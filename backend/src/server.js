/**
 * RideTracker Backend — Express Server
 *
 * This is the main entry point for the backend API server.
 * Future integrations (DB, Kafka, Redis, WebSocket) are clearly marked.
 *
 * Architecture:
 *  HTTP (Express) ─── REST API routes
 *  WebSocket       ─── Real-time driver location / ride events (TODO)
 *  Kafka Consumer  ─── GPS events from drivers (TODO)
 *  Redis           ─── GEO index, session cache (TODO)
 *  PostgreSQL      ─── Persistent data (TODO)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import 'dotenv/config';

// ── Route imports (stub files) ────────────────────────────────────────────────
import authRouter from './api/auth.js';
import usersRouter from './api/users.js';
import driversRouter from './api/drivers.js';
import ridesRouter from './api/rides.js';
import locationsRouter from './api/locations.js';
import pricingRouter from './api/pricing.js';
import analyticsRouter from './api/analytics.js';
import incidentsRouter from './api/incidents.js';
import { initDatabase, getDatabaseDiagnostics } from './db/db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://ride-tracker-ruddy.vercel.app',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const clean = origin.replace(/\/$/, '');
    if (allowedOrigins.some(o => o.replace(/\/$/, '') === clean) || clean.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const dbInfo = getDatabaseDiagnostics();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: dbInfo.sqliteReady ? 'connected_sqlite_disk' : (dbInfo.postgresConnected ? 'connected_postgres' : 'memory_cached'),
      postgres: dbInfo.postgresConnected ? 'connected' : 'offline',
      sqlite: dbInfo.sqliteReady ? 'active' : 'offline',
      redis: 'ready_for_connect',
      kafka: 'ready_for_connect',
    },
    databaseDiagnostics: dbInfo,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/drivers', driversRouter);
app.use('/api/v1/rides', ridesRouter);
app.use('/api/v1/locations', locationsRouter);
app.use('/api/v1/pricing', pricingRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/incidents', incidentsRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 RideTracker Backend running on http://127.0.0.1:${PORT}`);
  console.log(`   Health: http://127.0.0.1:${PORT}/health`);
  console.log(`   API:    http://127.0.0.1:${PORT}/api/v1\n`);

  // TODO: Initialize database connection pool
  // import { pool } from './db/pool.js'; await pool.connect();

  // TODO: Initialize Redis client
  // import { redis } from './redis/client.js'; await redis.connect();

  // TODO: Start Kafka consumers
  // import { startConsumers } from './kafka/consumers.js'; await startConsumers();

  // TODO: Start WebSocket server
  // import { startWebSocket } from './websocket/server.js'; startWebSocket(server);
});

export default app;
