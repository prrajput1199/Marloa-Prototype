require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const registerSocketHandlers = require('./sockets/index');
const { seedDemoCalls } = require('./simulator/simulator');

const callRoutes = require('./routes/calls');
const outcomeRoutes = require('./routes/outcomes');
const simulatorRoutes = require('./routes/simulator');

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

async function main() {
  await connectDB();

  const app = express();
  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST', 'PATCH'] },
  });

  app.use(cors({ origin: CLIENT_ORIGIN }));
  app.use(express.json());

  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'marloa-live-backend', time: new Date().toISOString() });
  });

  app.use('/api/calls', callRoutes);
  app.use('/api/outcomes', outcomeRoutes);
  app.use('/api/simulator', simulatorRoutes);

  // 404 handler
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Central error handler
  app.use((err, req, res, next) => {
    console.error('[server] unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  registerSocketHandlers(io);

  httpServer.listen(PORT, () => {
    console.log(`[server] Marloa Live backend listening on port ${PORT}`);
    console.log(`[server] CORS allowed origin: ${CLIENT_ORIGIN}`);

    if (process.env.AUTO_SEED_DEMO !== 'false') {
      seedDemoCalls(io, 3);
    }
  });
}

main().catch((err) => {
  console.error('[server] failed to start:', err.message);
  process.exit(1);
});
