/**
 * Route for receiving tracking events
 */
import { Router, Request, Response } from 'express';
import { TrackEvent } from '../../types';
import { validateTrackEvents } from '../validators/event';
import { insertTrackEvents } from '../db/mongodb';

const router = Router();

/**
 * POST /track - Receive tracking events
 *
 * Accepts an array of tracking events, validates them, and responds immediately
 * Then saves events to MongoDB asynchronously (without waiting for completion)
 * Returns 200 OK if validation is successful, 422 Unprocessable Entity if validation fails
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Handle both JSON and form-urlencoded formats
    let events;
    if (req.body.events) {
      // Form-urlencoded format
      try {
        events = JSON.parse(req.body.events);
      } catch (e) {
        return res.status(422).json({
          success: false,
          errors: ['Invalid JSON in events parameter'],
        });
      }
    } else {
      // Direct JSON format (for backward compatibility)
      events = req.body;
    }

    // Validate events
    const validationResult = validateTrackEvents(events);

    if (!validationResult.valid) {
      return res.status(422).json({
        success: false,
        errors: validationResult.errors,
      });
    }

    // Return success response immediately after validation
    res.status(200).json({
      success: true,
      count: events.length,
    });

    // Insert events into MongoDB asynchronously (don't wait for completion)
    insertTrackEvents(events as TrackEvent[])
      .then(insertedCount => {
        console.log(`Successfully inserted ${insertedCount} events into MongoDB`);
      })
      .catch(error => {
        console.error('Error inserting tracking events into MongoDB:', error);
      });

    return;
  } catch (error) {
    console.error('Error processing tracking events:', error);

    // Return error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
