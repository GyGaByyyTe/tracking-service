/**
 * Route for serving the tracks script JavaScript code
 */
import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * GET / - Serve the tracks script JavaScript code
 *
 * Returns the compiled tracks script JavaScript code with appropriate headers
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    // Paths to the compiled tracks files
    const indexPath = path.join(__dirname, '../../../dist/tracks/tracks/index.js');
    const tracksPath = path.join(__dirname, '../../../dist/tracks/tracks/tracks.js');

    // Check if files exist
    if (!fs.existsSync(indexPath)) {
      console.error('Tracks index file not found:', indexPath);
      return res.status(404).send('Tracks index not found. Please build the tracks script first.');
    }

    if (!fs.existsSync(tracksPath)) {
      console.error('Tracks implementation file not found:', tracksPath);
      return res
        .status(404)
        .send('Tracks implementation not found. Please build the tracks script first.');
    }

    // Read both files
    const indexCode = fs.readFileSync(indexPath, 'utf8');
    const tracksCode = fs.readFileSync(tracksPath, 'utf8');

    // Remove ES module syntax from the code
    const cleanTracksCode = tracksCode.replace(/export default initTracksTable;/g, '');
    const cleanIndexCode = indexCode.replace(/import initTracksTable from '.\/tracks';/g, '');

    // Combine and wrap the code in an IIFE to make it browser-compatible
    const combinedCode = `(function(window) {
      // Create a module system for the browser
      var exports = {};
      var module = { exports: exports };
      var process = { 
        env: { 
          TRACKS_ENDPOINT: "${process.env.TRACKS_ENDPOINT || '/tracks'}",
        } 
      };      
      
      // Define the TrackEvent interface for the browser
      var TrackEvent = {
        event: '',
        tags: [],
        url: '',
        title: '',
        ts: 0
      };

      // Execute the tracks implementation code first
      (function() {
        ${cleanTracksCode}
        window.initTracksTable = initTracksTable
      })();

      // Then execute the index code which will initialize the tracks table
      (function() {
        ${cleanIndexCode}
      })();
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
    console.error('Error serving tracks script:', error);
    return res.status(500).send('Internal server error');
  }
});

export default router;
