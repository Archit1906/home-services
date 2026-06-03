import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import database connector & register models/associations
import sequelize from './config/database.js';
import './models/index.js';

// Import services and middlewares
import { initSocket } from './services/socketService.js';
import { errorHandler } from './middleware/error.js';
import { apiLimiter } from './middleware/rateLimit.js';

// Import routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import workerRoutes from './routes/workers.js';
import reviewRoutes from './routes/reviews.js';
import conversationRoutes from './routes/conversations.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const app = express();
const server = http.createServer(app);

// Port configuration
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading assets locally across ports
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general API rate limiter
app.use('/api', apiLimiter);

// API Endpoints Mounting
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'UP', 
      database: 'connected',
      dialect: sequelize.getDialect(),
      time: new Date()
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      database: 'disconnected',
      error: err.message,
      time: new Date()
    });
  }
});

// Centralized error handler (must be registered last)
app.use(errorHandler);

// Initialize Socket.io
initSocket(server);

// Database Sync and Server Bootstrap
console.log('[DB] Connecting to database...');
sequelize.sync({ alter: true })
  .then(() => {
    console.log('[DB] Database connection established and tables synced successfully.');
    server.listen(PORT, () => {
      console.log(`[SERVER] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Database sync failed:', err);
    process.exit(1);
  });
