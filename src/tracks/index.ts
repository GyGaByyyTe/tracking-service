/**
 * Tracks table entry point
 *
 * This file exports the track's table functionality for use in client applications.
 * It can be included in a web page using a script tag:
 *
 * <script src="http://localhost:8888/tracks-script"></script>
 *
 * The track's functionality will be initialized automatically when the DOM is loaded.
 */

import initTracksTable from './tracks';

(window as any).initTracksTable = initTracksTable;
// Initialize track's table when DOM is loaded
document.addEventListener('DOMContentLoaded', initTracksTable);
