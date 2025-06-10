/**
 * Server configuration
 */
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Port for serving static pages
 */
export const STATIC_PORT = parseInt(process.env.STATIC_PORT || '50000', 10);

/**
 * Port for tracker and tracking data
 */
export const TRACKER_PORT = parseInt(process.env.TRACKER_PORT || '8888', 10);

/**
 * MongoDB connection string
 */
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

/**
 * MongoDB database name
 */
export const MONGODB_DB = process.env.MONGODB_DB || 'tracking_service';

/**
 * MongoDB collection for tracking events
 */
export const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || 'tracks';

/**
 * Minimum number of events to buffer before sending
 */
export const MIN_EVENTS_TO_SEND = parseInt(process.env.MIN_EVENTS_TO_SEND || '3', 10);

/**
 * Minimum time (in ms) between sending events
 */
export const MIN_TIME_BETWEEN_SENDS = parseInt(process.env.MIN_TIME_BETWEEN_SENDS || '1000', 10);
