/**
 * Tracker entry point
 *
 * This file exports the tracker instance for use in client applications.
 * It can be included in a web page using a script tag:
 *
 * <script src="http://localhost:8888/tracker"></script>
 *
 * The tracker will be available as a global variable 'tracker' with a 'track' method:
 *
 * tracker.track('pageview');
 * tracker.track('click', 'button', 'submit');
 */

import tracker from './tracker';

// Make the tracker available globally
(window as any).tracker = tracker;

// Export tracker as default
export default tracker;

// Automatically track pageview when loaded
// document.addEventListener('DOMContentLoaded', () => {
//   tracker.track('pageview');
// });
