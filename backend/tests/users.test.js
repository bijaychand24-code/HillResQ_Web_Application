const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { generateToken } = require('../src/utils/jwt');
require('./setup');

describe('User Management API & Role Authorization', () => {
  let citizenToken, citizenUser;
  let adminToken, adminUser;
  let responderToken, responderUser;

  beforeEach(async () => {
    await User.deleteMany({});

    citizenUser = await User.create({
      name: 'Test Citizen',
      email: 'citizen_user@example.com',
      passwordHash: 'pass123',
      role: 'citizen'
    });
    citizenToken = generateToken(citizenUser._id);

    responderUser = await User.create({
      name: 'Capt. Anita',
      email: 'responder_user@example.com',
      passwordHash: 'pass123',
      role: 'responder'
    });
    responderToken = generateToken(responderUser._id);

    adminUser = await User.create({
      name: 'System Admin',
      email: 'admin_user@example.com',
      passwordHash: 'pass123',
      role: 'admin'
    });
    adminToken = generateToken(adminUser._id);
  });

  describe('GET /api/users', () => {
    it('should reject non-admin users with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin to list users with pagination and role filtering', async () => {
      const res = await request(app)
        .get('/api/users?role=responder')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].role).toBe('responder');
    });
  });

  describe('GET /api/users/responders', () => {
    it('should allow admin to retrieve active responders list', async () => {
      const res = await request(app)
        .get('/api/users/responders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].email).toBe('responder_user@example.com');
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    it('should allow admin to promote a citizen to responder', async () => {
      const res = await request(app)
        .patch(`/api/users/${citizenUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'responder' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('responder');

      const updated = await User.findById(citizenUser._id);
      expect(updated.role).toBe('responder');
    });

    it('should reject invalid role with 400', async () => {
      const res = await request(app)
        .patch(`/api/users/${citizenUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'supergod' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should prevent demoting the only administrator in the system', async () => {
      const res = await request(app)
        .patch(`/api/users/${adminUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'citizen' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('only administrator');
    });
  });
});

