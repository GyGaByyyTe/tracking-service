/**
 * Route for serving static test pages
 */
import { Router, Request, Response } from 'express';
import path from 'path';

const router = Router();

/**
 * GET /:page - Serve static test pages
 *
 * Serves test HTML pages from the public directory
 */
router.get('/:page', (req: Request, res: Response) => {
  // Get the requested page
  const page = req.params.page;

  // Set the content type to HTML
  res.setHeader('Content-Type', 'text/html');

  // Serve the requested page
  res.sendFile(path.join(__dirname, '../../../public', page));
});

/**
 * GET / - Redirect to the first test page
 */
router.get('/', (_req: Request, res: Response) => {
  res.redirect('/1.html');
});

export default router;
