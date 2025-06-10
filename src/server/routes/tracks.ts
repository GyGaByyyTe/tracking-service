/**
 * Route for retrieving tracking events
 */
import { Router, Request, Response } from 'express';
import { getTrackEvents, deleteAllTrackEvents } from '../db/mongodb';

const router = Router();

/**
 * GET /tracks - Get tracking events
 *
 * Returns a list of tracking events from the database
 * Optional query parameters:
 * - limit: Maximum number of events to return (default: 100)
 * - event: Filter by event name
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

    // Create filter object
    const filter: any = {};

    // Add event filter if provided
    if (req.query.event) {
      filter.event = req.query.event;
    }

    // Get events from database
    const events = await getTrackEvents(filter, limit);

    // Return events
    return res.status(200).json({
      success: true,
      count: events.length,
      events: events,
    });
  } catch (error) {
    console.error('Error retrieving tracking events:', error);

    // Return error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /tracks - Delete all tracking events
 *
 * Deletes all tracking events from the database
 * Returns the number of deleted events
 */
router.delete('/', async (_req: Request, res: Response) => {
  try {
    // Delete all events from database
    const deletedCount = await deleteAllTrackEvents();

    // Return success response
    return res.status(200).json({
      success: true,
      deletedCount: deletedCount,
    });
  } catch (error) {
    console.error('Error deleting tracking events:', error);

    // Return error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
