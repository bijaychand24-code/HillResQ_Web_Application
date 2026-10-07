const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Incident = require('../src/models/Incident');
require('./setup');

describe('Incident API Lifecycle & Role Permissions', () => {
  let citizenToken, citizenUser;
  let responderToken, responderUser;
  let adminToken, adminUser;

  beforeEach(async () => {
    await Incident.deleteMany({});
    await User.deleteMany({});

    // Create Citizen
    citizenUser = await User.create({
      name: 'Ramesh Citizen',
      email: 'citizen_test@example.com',
      passwordHash: 'pass123',
      role: 'citizen'
    });
    const { generateToken } = require('../src/utils/jwt');
    citizenToken = generateToken(citizenUser._id);

    // Create Responder
    responderUser = await User.create({
      name: 'Major Sharma',
      email: 'responder_test@example.com',
      passwordHash: 'pass123',
      role: 'responder'
    });
    responderToken = generateToken(responderUser._id);

    // Create Admin
    adminUser = await User.create({
      name: 'Director Disaster Mgmt',
      email: 'admin_test@example.com',
      passwordHash: 'pass123',
      role: 'admin'
    });
    adminToken = generateToken(adminUser._id);
  });

  describe('POST /api/incidents', () => {
    it('should create an incident report for authenticated citizen', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          title: 'Landslide on Dharamshala Highway',
          description: 'A large rock boulder fell blocking traffic completely.',
          type: 'landslide',
          severity: 'high',
          latitude: 32.219,
          longitude: 76.323,
          locationName: 'Dharamshala NH near KM 12'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Landslide on Dharamshala Highway');
      expect(res.body.data.status).toBe('reported');
      expect(res.body.data.reportedBy._id.toString()).toBe(citizenUser._id.toString());
    });

    it('should reject incident without coordinates or title', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          title: '',
          description: 'Missing fields'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/incidents & Filtering', () => {
    beforeEach(async () => {
      await Incident.create([
        {
          title: 'Flood in Beas River',
          description: 'Heavy water discharge',
          type: 'flood',
          severity: 'critical',
          latitude: 31.9,
          longitude: 77.1,
          locationName: 'Beas Ghat',
          reportedBy: citizenUser._id,
          status: 'verified'
        },
        {
          title: 'Fallen Tree on Mall Road',
          description: 'Blocks foot traffic',
          type: 'fallen_tree',
          severity: 'low',
          latitude: 31.1,
          longitude: 77.1,
          locationName: 'Mall Road Shimla',
          reportedBy: citizenUser._id,
          status: 'reported'
        }
      ]);
    });

    it('should retrieve list of incidents with pagination', async () => {
      const res = await request(app).get('/api/incidents?page=1&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('should filter incidents by severity and type', async () => {
      const res = await request(app).get('/api/incidents?severity=critical');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].type).toBe('flood');
    });
  });

  describe('PATCH /api/incidents/:id & Role Transitions', () => {
    let incidentId;

    beforeEach(async () => {
      const incident = await Incident.create({
        title: 'Bridge Buckling',
        description: 'Pillar damaged',
        type: 'infrastructure_damage',
        severity: 'high',
        latitude: 31.5,
        longitude: 77.2,
        locationName: 'Sutlej Bridge',
        reportedBy: citizenUser._id,
        status: 'reported'
      });
      incidentId = incident._id.toString();
    });

    it('should allow Admin to verify and assign incident to responder', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'verified',
          assignedTo: responderUser._id.toString()
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.assignedTo._id.toString()).toBe(responderUser._id.toString());
      expect(res.body.data.status).toBe('assigned');
    });

    it('should allow assigned responder to update status to in_progress and add response notes', async () => {
      // First assign to responder
      await Incident.findByIdAndUpdate(incidentId, {
        assignedTo: responderUser._id,
        status: 'assigned'
      });

      const res = await request(app)
        .patch(`/api/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${responderToken}`)
        .send({
          status: 'in_progress',
          responseNotes: 'Team arrived on site with safety barriers.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('in_progress');
      expect(res.body.data.responseNotes).toContain('safety barriers');
    });

    it('should prevent unassigned responder from updating incident', async () => {
      const otherResponder = await User.create({
        name: 'Other Responder',
        email: 'other_resp@example.com',
        passwordHash: 'pass123',
        role: 'responder'
      });
      const { generateToken } = require('../src/utils/jwt');
      const otherToken = generateToken(otherResponder._id);

      const res = await request(app)
        .patch(`/api/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          status: 'in_progress'
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/incidents/:id', () => {
    let incidentId;

    beforeEach(async () => {
      const incident = await Incident.create({
        title: 'Spam report',
        description: 'Test text',
        type: 'other',
        severity: 'low',
        latitude: 31.0,
        longitude: 77.0,
        locationName: 'Nowhere',
        reportedBy: citizenUser._id
      });
      incidentId = incident._id.toString();
    });

    it('should prevent citizen from deleting incident (403)', async () => {
      const res = await request(app)
        .delete(`/api/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to delete incident (200)', async () => {
      const res = await request(app)
        .delete(`/api/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      const check = await Incident.findById(incidentId);
      expect(check).toBeNull();
    });
  });
});
