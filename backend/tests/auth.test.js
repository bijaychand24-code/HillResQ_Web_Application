const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
require('./setup');

describe('Authentication & Authorization Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new citizen successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Pooja Sharma',
          email: 'pooja@example.com',
          password: 'securePassword123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('citizen');
      expect(res.body.user.email).toBe('pooja@example.com');
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('should reject registration if email is already registered', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123'
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'password123'
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should validate invalid email and short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bad Input',
          email: 'not-an-email',
          password: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
    it('should prevent citizen from elevating role to admin during registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker User',
          email: 'hacker@example.com',
          password: 'password123',
          role: 'admin'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe('citizen'); // Forced to citizen
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Login Tester',
        email: 'login@example.com',
        password: 'correctPassword'
      });
    });

    it('should login with correct credentials and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'correctPassword'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.name).toBe('Login Tester');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongPassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return profile for authenticated user', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        name: 'Token Tester',
        email: 'me@example.com',
        password: 'password123'
      });

      const token = reg.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('me@example.com');
    });

    it('should reject request without token with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject request with invalid or malformed token with 401', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_garbage_token_12345');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
