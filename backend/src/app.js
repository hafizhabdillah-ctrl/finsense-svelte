const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const umkmRoutes = require('./routes/umkmRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const chatRoutes = require('./routes/chatRoutes');
const productRoutes = require('./routes/productRoutes');
const stockLogRoutes = require('./routes/stockLogRoutes');
const debtRoutes = require('./routes/debtRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

const unwrapRoute = (route, name = 'unknown') => {
  console.log(`[Debug Route] '${name}' keys:`, Object.keys(route || {}));

  let resolved = route;
  if (resolved && typeof resolved !== 'function') {
    resolved = resolved.default || resolved.router || resolved;
  }

  if (typeof resolved !== 'function') {
    throw new Error(
      `[Route Error] Route '${name}' is type '${typeof resolved}'. Received keys: ${JSON.stringify(Object.keys(route || {}))}`
    );
  }
  return resolved;
};

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL,
    ];
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(
  cors({
    origin: true, // Mengizinkan origin tempat request berasal (termasuk domain Vercel kamu)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[Express] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', unwrapRoute(authRoutes, 'authRoutes'));
app.use('/api/umkm', unwrapRoute(umkmRoutes, 'umkmRoutes'));
app.use('/api/dashboard', unwrapRoute(dashboardRoutes, 'dashboardRoutes'));
app.use('/api/transactions', unwrapRoute(transactionRoutes, 'transactionRoutes'));
app.use('/api/categories', unwrapRoute(categoryRoutes, 'categoryRoutes'));
app.use('/api/chat', unwrapRoute(chatRoutes, 'chatRoutes'));
app.use('/api/products', unwrapRoute(productRoutes, 'productRoutes'));
app.use('/api/stock-logs', unwrapRoute(stockLogRoutes, 'stockLogRoutes'));
app.use('/api/debts', unwrapRoute(debtRoutes, 'debtRoutes'));
app.use('/api', unwrapRoute(voiceRoutes, 'voiceRoutes'));
app.use('/api/ai', unwrapRoute(aiRoutes, 'aiRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.url });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
