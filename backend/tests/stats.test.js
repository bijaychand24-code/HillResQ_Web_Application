const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Incident = require('../src/models/Incident');
const { generateToken } = require('../src/utils/jwt');
require('./setup');

describe('Dashboard Statistics & Health Check APIs', () => {
  let citizenToken, citizenUser;
  let responderToken, responderUser;
  let adminToken, adminUser;

  beforeEach(async () => {
    await Incident.deleteMany({});
    await User.deleteMany({});

    citizenUser = await User.create({
      name: 'Stats Citizen',
      email: 'citizen_stats@example.com',
      passwordHash: 'pass123',
      role: 'citizen'
    });
    citizenToken = generateToken(citizenUser._id);

    responderUser = await User.create({
      name: 'Stats Responder',
      email: 'responder_stats@example.com',
      passwordHash: 'pass123',
      role: 'responder'
    });
    responderToken = generateToken(responderUser._id);

    adminUser = await User.create({
      name: 'Stats Admin',
      email: 'admin_stats@example.com',
      passwordHash: 'pass123',
      role: 'admin'
    });
    adminToken = generateToken(adminUser._id);

    // Create 3 diverse incidents
    await Incident.create([
      {
        title: 'Critical Active Mudflow',
        description: 'Blocks road',
        type: 'landslide',
        severity: 'critical',
        severityWeight: 4,
        latitude: 31.6,
        longitude: 77.1,
        locationName: 'Ridge Path',
        reportedBy: citizenUser._id,
        assignedTo: responderUser._id,
        status: 'in_progress'
      },
      {
        title: 'Reported Fallen Tree',
        description: 'Needs verification',
        type: 'fallen_tree',
        severity: 'medium',
        severityWeight: 2,
        latitude: 31.5,
        longitude: 77.2,
        locationName: 'Pine forest road',
        reportedBy: citizenUser._id,
        status: 'reported'
      },
      {
        title: 'Resolved Flood Drain',
        description: 'Water receded',
        type: 'flood',
        severity: 'high',
        severityWeight: 3,
        latitude: 31.4,
        longitude: 77.0,
        locationName: 'Riverbank',
        reportedBy: citizenUser._id,
        assignedTo: responderUser._id,
        status: 'resolved'
      }
    ]);
  });

  describe('GET /api/health', () => {
    it('should return 200 OK with healthy status and API details', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('HillResQ API');
    });
  });

  describe('GET /api/incidents/stats', () => {
    it('should return aggregated citizen report metrics', async () => {
      const res = await request(app)
        .get('/api/incidents/stats')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalReports).toBe(3);
      expect(res.body.stats.activeReports).toBe(2);
      expect(res.body.stats.resolvedReports).toBe(1);
    });

    it('should return aggregated responder metrics for assigned unit', async () => {
      const res = await request(app)
        .get('/api/incidents/stats')
        .set('Authorization', `Bearer ${responderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.assignedIncidents).toBe(2);
      expect(res.body.stats.criticalAssigned).toBe(1);
      expect(res.body.stats.inProgressIncidents).toBe(1);
      expect(res.body.stats.resolvedIncidents).toBe(1);
    });

    it('should return complete command center metrics for Admin', async () => {
      const res = await request(app)
        .get('/api/incidents/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const s = res.body.stats;
      expect(s.totalIncidents).toBe(3);
      expect(s.criticalIncidents).toBe(1);
      expect(s.pendingVerification).toBe(1);
      expect(s.assignedIncidents).toBe(0);
      expect(s.inProgressIncidents).toBe(1);
      expect(s.resolvedIncidents).toBe(1);
      expect(s.totalUsers).toBe(3);
      expect(s.byType.landslide).toBe(1);
      expect(s.byType.fallen_tree).toBe(1);
      expect(s.byType.flood).toBe(1);
    });
  });
});

