const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Refusing to start in production without it.');
  process.exit(1);
}

const quizRoutes = require('./routes/quizRoutes');
const authRoutes = require('./routes/authRoutes');
const { handleSocketEvents } = require('./controllers/socketController');

const app = express();
const server = http.createServer(app);

// In development, allow any origin so phones on the local network can connect.
// In production, only the origins listed in CLIENT_URL (comma separated) are allowed.
const corsOrigin = process.env.NODE_ENV === 'production'
  ? (process.env.CLIENT_URL || 'http://localhost:3000').split(',')
  : true;

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Rate limiting: general cap on all API routes, tighter cap on auth
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' }
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);

// Health check
const health = (req, res) => {
  res.json({ message: 'Quiz MAX Server is running!', status: 'ok' });
};
app.get('/health', health);

// Serve the built frontend when it exists (Docker and production)
const distPath = process.env.FRONTEND_DIST || path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^\/(?!api|socket\.io).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', health);
}

// Socket.io
handleSocketEvents(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
