/**
 * Track's table functionality
 *
 * This file contains the functionality for the track's table.
 * It fetches tracking events from the server and displays them in a table.
 */

// Import TrackEvent type from the types module
import { TrackEvent } from '../types';

// Response from the tracks API
interface TracksResponse {
  success: boolean;
  count: number;
  events: TrackEvent[];
  error?: string;
}

// Response from the delete tracks API
interface DeleteTracksResponse {
  success: boolean;
  deletedCount: number;
  error?: string;
}

// Configuration
const TRACKS_ENDPOINT = process.env.TRACKS_ENDPOINT || '/tracks';

/**
 * Initialize the track table
 */
function initTracksTable(): void {
  // DOM Elements
  const tracksTable = document.getElementById('tracks-table') as HTMLTableElement;
  const tracksBody = document.getElementById('tracks-body') as HTMLTableSectionElement;
  const loadingElement = document.getElementById('loading') as HTMLDivElement;
  const refreshButton = document.getElementById('refresh-button') as HTMLButtonElement;
  const deleteButton = document.getElementById('delete-button') as HTMLButtonElement;
  const errorContainer = document.getElementById('error-container') as HTMLDivElement;

  // Add event listener for refresh button
  refreshButton.addEventListener('click', fetchTracks);

  // Add event listener for delete button
  deleteButton.addEventListener('click', deleteAllTracks);

  // Fetch tracks immediately
  fetchTracks();

  /**
   * Format timestamp to readable date/time
   * @param timestamp Timestamp in milliseconds
   * @returns Formatted date/time string
   */
  function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  /**
   * Format tags array to string
   * @param tags Array of tags
   * @returns Formatted tags string
   */
  function formatTags(tags: string[]): string {
    if (!tags || tags.length === 0) return '-';
    return tags.join(', ');
  }

  /**
   * Show error message
   * @param message Error message to display
   */
  function showError(message: string): void {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
  }

  /**
   * Hide error message
   */
  function hideError(): void {
    errorContainer.style.display = 'none';
  }

  /**
   * Fetch tracks from server
   */
  async function fetchTracks(): Promise<void> {
    try {
      hideError();
      loadingElement.style.display = 'block';
      tracksTable.style.display = 'none';

      const response = await fetch(TRACKS_ENDPOINT);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as TracksResponse;

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      // Clear existing rows
      tracksBody.innerHTML = '';

      // Add tracks to table
      if (data.events && data.events.length > 0) {
        data.events.forEach(track => {
          const row = document.createElement('tr');

          // Event name
          const eventCell = document.createElement('td');
          eventCell.textContent = track.event;
          row.appendChild(eventCell);

          // Tags
          const tagsCell = document.createElement('td');
          tagsCell.className = 'tags';
          tagsCell.textContent = formatTags(track.tags);
          row.appendChild(tagsCell);

          // URL
          const urlCell = document.createElement('td');
          urlCell.textContent = track.url;
          row.appendChild(urlCell);

          // Page title
          const titleCell = document.createElement('td');
          titleCell.textContent = track.title;
          row.appendChild(titleCell);

          // Timestamp
          const timestampCell = document.createElement('td');
          timestampCell.className = 'timestamp';
          timestampCell.textContent = formatTimestamp(track.ts);
          row.appendChild(timestampCell);

          tracksBody.appendChild(row);
        });

        // Show table
        tracksTable.style.display = 'table';
      } else {
        // No tracks found
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 5;
        cell.textContent = 'No tracking events found';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tracksBody.appendChild(row);
        tracksTable.style.display = 'table';
      }
    } catch (error) {
      showError(`Error fetching tracks: ${error instanceof Error ? error.message : String(error)}`);

      // Show empty table
      tracksBody.innerHTML = '';
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = 'Failed to load tracking events';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      tracksBody.appendChild(row);
      tracksTable.style.display = 'table';
    } finally {
      loadingElement.style.display = 'none';
    }
  }

  /**
   * Delete all tracks from server
   */
  async function deleteAllTracks(): Promise<void> {
    if (
      !confirm('Are you sure you want to delete all tracking events? This action cannot be undone.')
    ) {
      return;
    }

    try {
      hideError();
      loadingElement.style.display = 'block';
      tracksTable.style.display = 'none';

      const response = await fetch(TRACKS_ENDPOINT, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as DeleteTracksResponse;

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      // Show a success message
      alert(`Successfully deleted ${data.deletedCount} tracking events.`);

      // Refresh tracks list
      fetchTracks();
    } catch (error) {
      showError(`Error deleting tracks: ${error instanceof Error ? error.message : String(error)}`);
      loadingElement.style.display = 'none';
    }
  }
}

export default initTracksTable;
