const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.MONGODB_URI = 'mongodb://localhost:27017/hillresq_test';
process.env.JWT_SECRET = 'test_jwt_secret_key_hillresq_testing_2026';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});
