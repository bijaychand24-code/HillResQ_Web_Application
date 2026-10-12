const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security HTTP headers with comprehensive CSP for Leaflet maps and external CDN assets
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://unpkg.com',
          'https://fonts.googleapis.com'
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tile.openstreetmap.org',
          'https://unpkg.com',
          'https://raw.githubusercontent.com'
        ],
        objectSrc: ["'none'"]
      }
    }
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('Blocked by CORS policy'));
      }
      return callback(null, true); // Allow dev origins for smooth pair programming
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'HillResQ API',
    timestamp: new Date().toISOString()
  });
});

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// API route mounts
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/upload', uploadRoutes);

// In production, serve the compiled frontend SPA if dist exists
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    // Forward unknown /api and /uploads requests to 404 handler
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Catch 404 and forward to error handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

module.exports = app;
