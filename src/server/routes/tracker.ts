/**
 * Route for serving the tracker JavaScript code
 */
import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * GET / - Serve the tracker JavaScript code
 *
 * Returns the minified tracker JavaScript code with appropriate headers
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    // Paths to the compiled tracker files
    const indexPath = path.join(__dirname, '../../../dist/tracker/index.js');
    const trackerImplPath = path.join(__dirname, '../../../dist/tracker/tracker.js');

    // Check if files exist
    if (!fs.existsSync(indexPath)) {
      console.error('Tracker index file not found:', indexPath);
      return res.status(404).send('Tracker index not found. Please build the tracker first.');
    }

    if (!fs.existsSync(trackerImplPath)) {
      console.error('Tracker implementation file not found:', trackerImplPath);
      return res
        .status(404)
        .send('Tracker implementation not found. Please build the tracker first.');
    }

    // Read both files
    const indexCode = fs.readFileSync(indexPath, 'utf8');
    const trackerCode = fs.readFileSync(trackerImplPath, 'utf8');

    // Remove ES module syntax from the code
    const cleanTrackerCode = trackerCode.replace(/export default tracker;/g, '');
    const cleanIndexCode = indexCode
      .replace(/import tracker from '.\/tracker';/g, '')
      .replace(/export default tracker;/g, '');

    // Combine and wrap the code in an IIFE to make it browser-compatible
    const combinedCode = `(function(window) {
      // Create a module system for the browser
      var exports = {};
      var module = { exports: exports };
      var process = { 
        env: { 
          TRACKER_ENDPOINT: "${process.env.TRACKER_ENDPOINT || '/track'}",
          MIN_EVENTS_TO_SEND: "${process.env.MIN_EVENTS_TO_SEND || '3'}",
          MIN_TIME_BETWEEN_SENDS: "${process.env.MIN_TIME_BETWEEN_SENDS || '1000'}"
        } 
      };
      var __importDefault = function(mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
      };

      // Execute the tracker implementation code first
      (function() {
        ${cleanTrackerCode}
      })();

      // Then execute the index code which will use the tracker
      (function() {
        ${cleanIndexCode}
      })();

      // Ensure tracker is available globally
      if (!window.tracker) {
        console.log('Setting global tracker');
        window.tracker = tracker;
      }
    })(window);`;

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Use the request's origin or allow all origins in production
    const origin = _req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Send the combined code
    return res.send(combinedCode);
  } catch (error) {
    console.error('Error serving tracker:', error);
    return res.status(500).send('Internal server error');
  }
});

export default router;
