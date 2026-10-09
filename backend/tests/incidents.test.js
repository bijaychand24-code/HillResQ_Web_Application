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

    it('should sort incidents by severity priority (critical first)', async () => {
      const res = await request(app).get('/api/incidents?sortBy=severity');
      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].severity).toBe('critical');
      expect(res.body.data[1].severity).toBe('low');
    });

    it('should filter active incidents excluding resolved and rejected', async () => {
      // Create a resolved incident
      await Incident.create({
        title: 'Old Cleared Rock',
        description: 'Already cleared by road crew',
        type: 'road_block',
        severity: 'low',
        latitude: 31.2,
        longitude: 77.2,
        locationName: 'Old Highway',
        reportedBy: citizenUser._id,
        status: 'resolved'
      });

      const res = await request(app).get('/api/incidents?status=active');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.some(i => i.status === 'resolved')).toBe(false);
    });

    it('should search incidents by title or location keyword', async () => {
      const res = await request(app).get('/api/incidents?search=Beas');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toContain('Beas River');
    });
  });

  describe('GET /api/incidents/:id', () => {
    let incidentId;

    beforeEach(async () => {
      const incident = await Incident.create({
        title: 'Single Incident Test',
        description: 'Single test desc',
        type: 'landslide',
        severity: 'medium',
        latitude: 31.4,
        longitude: 77.3,
        locationName: 'Solang Valley',
        reportedBy: citizenUser._id
      });
      incidentId = incident._id.toString();
    });

    it('should retrieve single incident with populated user data', async () => {
      const res = await request(app).get(`/api/incidents/${incidentId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Single Incident Test');
      expect(res.body.data.reportedBy.name).toBe('Ramesh Citizen');
    });

    it('should return 404 for non-existent valid ObjectId', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/incidents/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle invalid/malformed ObjectId safely with 400', async () => {
      const res = await request(app).get('/api/incidents/invalid-mongo-id');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
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

    it('should allow Admin to reject an incident', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('rejected');
    });

    it('should prevent responder from setting unauthorized status like reported', async () => {
      await Incident.findByIdAndUpdate(incidentId, {
        assignedTo: responderUser._id,
        status: 'assigned'
      });

      const res = await request(app)
        .patch(`/api/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${responderToken}`)
        .send({
          status: 'reported'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should allow citizen to edit their own report if still in reported state', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          title: 'Updated Title by Citizen'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe('Updated Title by Citizen');
    });

    it('should prevent citizen from editing incident once it has been verified', async () => {
      await Incident.findByIdAndUpdate(incidentId, { status: 'verified' });

      const res = await request(app)
        .patch(`/api/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          title: 'Attempted edit after verified'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should prevent citizen from editing another citizen report', async () => {
      const otherCitizen = await User.create({
        name: 'Other Citizen',
        email: 'other_cit@example.com',
        passwordHash: 'pass123',
        role: 'citizen'
      });
      const { generateToken } = require('../src/utils/jwt');
      const otherCitizenToken = generateToken(otherCitizen._id);

      const res = await request(app)
        .patch(`/api/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${otherCitizenToken}`)
        .send({
          title: 'Malicious title hijack'
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
