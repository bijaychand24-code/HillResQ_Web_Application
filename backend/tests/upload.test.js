const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { generateToken } = require('../src/utils/jwt');
const fs = require('fs');
const path = require('path');
require('./setup');

describe('Image Upload API (/api/upload)', () => {
  let citizenToken, citizenUser;

  beforeEach(async () => {
    await User.deleteMany({});
    citizenUser = await User.create({
      name: 'Uploader Citizen',
      email: 'uploader@example.com',
      passwordHash: 'pass123',
      role: 'citizen'
    });
    citizenToken = generateToken(citizenUser._id);
  });

  it('should reject unauthenticated upload requests with 401', async () => {
    const res = await request(app).post('/api/upload');
    expect(res.statusCode).toBe(401);
  });

  it('should reject request when no file is uploaded with 400', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('No image file uploaded');
  });

  it('should reject unsupported file types (like text or exe) with 400', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${citizenToken}`)
      .attach('image', Buffer.from('console.log("hello world");'), 'script.js');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid file type');
  });

  it('should successfully upload valid PNG image and return relative URL', async () => {
    // 1x1 transparent PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );

    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${citizenToken}`)
      .attach('image', pngBuffer, 'test_landslide.png');

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.url).toMatch(/^\/uploads\/incident-/);

    // Verify file actually exists on disk in src/uploads
    const diskPath = path.join(__dirname, '../src', res.body.url);
    expect(fs.existsSync(diskPath)).toBe(true);

    // Cleanup created test file
    fs.unlinkSync(diskPath);
  });
});

