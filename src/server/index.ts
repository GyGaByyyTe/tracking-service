/**
 * Main server entry point
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { STATIC_PORT, TRACKER_PORT } from './config';
import { connectToMongoDB } from './db/mongodb';
import trackRouter from './routes/track';
import trackerRouter from './routes/tracker';
import staticRouter from './routes/static';
import tracksRouter from './routes/tracks';
import tracksScriptRouter from './routes/tracks-script';

// Create Express applications for each port
const trackerApp = express();
const staticApp = express();

// Configure middleware for the tracker app
trackerApp.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for simplicity in this example
  })
);
// Get CORS origins from the environment variable or use default
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : [`http://localhost:${STATIC_PORT}`, `http://127.0.0.1:${STATIC_PORT}`];

trackerApp.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
trackerApp.use(express.json());
trackerApp.use(express.urlencoded({ extended: true }));

// Configure middleware for static app
staticApp.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for simplicity in this example
  })
);
staticApp.use(cors());

// Register routes
trackerApp.use('/tracker', trackerRouter);
trackerApp.use('/track', trackRouter);
trackerApp.use('/tracks', tracksRouter);
trackerApp.use('/tracks-script', tracksScriptRouter);
staticApp.use('/', staticRouter);

// Health check endpoint
trackerApp.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the servers
async function startServers() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Start the tracker server
    trackerApp.listen(TRACKER_PORT, () => {
      console.log(`Tracker server running on port ${TRACKER_PORT}`);
      console.log(`- Tracker endpoint: http://localhost:${TRACKER_PORT}/tracker`);
      console.log(`- Track endpoint: http://localhost:${TRACKER_PORT}/track`);
    });

    // Start the static server
    staticApp.listen(STATIC_PORT, () => {
      console.log(`Static server running on port ${STATIC_PORT}`);
      console.log(`- Test pages: http://localhost:${STATIC_PORT}/`);
    });
  } catch (error) {
    console.error('Failed to start servers:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down servers...');
  process.exit(0);
});

// Start the servers
startServers();
