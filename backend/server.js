const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ================= SECURITY =================
app.use(helmet());

// ================= RATE LIMIT =================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

app.use(limiter);

// ================= CORS FIXED =================
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// ================= BODY PARSER =================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================= DATABASE =================
let dbConnected = false;

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/farmdirect'
)
.then(() => {
  dbConnected = true;
  console.log('✅ Connected to MongoDB');
})
.catch((err) => {
  dbConnected = false;
  console.error('❌ MongoDB Error:', err.message);
  console.error('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET - using localhost fallback');
});

// ================= ROUTES =================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/setup', require('./routes/setup')); // ← ADD THIS LINE

// ================= HOME ROUTE =================
app.get('/', (req, res) => {
  res.send('FarmDirect API Running...');
});

// ================= HEALTH CHECK ROUTE =================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'FarmDirect API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : undefined
  });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;