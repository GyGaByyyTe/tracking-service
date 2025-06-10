/**
 * MongoDB connection and operations
 */
import { MongoClient, Collection } from 'mongodb';
import { TrackEvent } from '../../types';
import { MONGODB_URI, MONGODB_DB, MONGODB_COLLECTION } from '../config';

/**
 * MongoDB client instance
 */
let client: MongoClient | null = null;

/**
 * Collection for tracking events
 */
let tracksCollection: Collection<TrackEvent> | null = null;

/**
 * Initialize MongoDB connection
 */
export async function connectToMongoDB(): Promise<void> {
  try {
    // Create a new MongoDB client
    client = new MongoClient(MONGODB_URI);

    // Connect to the MongoDB server
    await client.connect();

    console.log('Connected to MongoDB');

    // Get the database and collection
    const db = client.db(MONGODB_DB);
    tracksCollection = db.collection<TrackEvent>(MONGODB_COLLECTION);

    // Create indexes if needed
    await tracksCollection.createIndex({ ts: 1 });
    await tracksCollection.createIndex({ event: 1 });

    console.log('MongoDB initialized successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
}

/**
 * Close MongoDB connection
 */
export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    tracksCollection = null;
    console.log('MongoDB connection closed');
  }
}

/**
 * Insert multiple tracking events
 * @param events Array of tracking events to insert
 * @returns Number of inserted events
 */
export async function insertTrackEvents(events: TrackEvent[]): Promise<number> {
  if (!tracksCollection) {
    throw new Error('MongoDB not initialized');
  }

  if (events.length === 0) {
    return 0;
  }

  try {
    const result = await tracksCollection.insertMany(events);
    return result.insertedCount;
  } catch (error) {
    console.error('Failed to insert track events', error);
    throw error;
  }
}

/**
 * Get tracking events with optional filtering
 * @param filter Optional filter criteria
 * @param limit Maximum number of events to return
 * @returns Array of tracking events
 */
export async function getTrackEvents(
  filter: Partial<TrackEvent> = {},
  limit = 100
): Promise<TrackEvent[]> {
  if (!tracksCollection) {
    throw new Error('MongoDB not initialized');
  }

  try {
    return await tracksCollection.find(filter).sort({ ts: -1 }).limit(limit).toArray();
  } catch (error) {
    console.error('Failed to get track events', error);
    throw error;
  }
}

/**
 * Delete all tracking events
 * @returns Number of deleted events
 */
export async function deleteAllTrackEvents(): Promise<number> {
  if (!tracksCollection) {
    throw new Error('MongoDB not initialized');
  }

  try {
    const result = await tracksCollection.deleteMany({});
    return result.deletedCount;
  } catch (error) {
    console.error('Failed to delete track events', error);
    throw error;
  }
}
