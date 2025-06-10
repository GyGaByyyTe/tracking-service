/**
 * Client-side tracker implementation
 */

// Declare global window property for TypeScript
declare global {
  interface Window {
    tracker: Tracker;
  }
}

/**
 * Interface for the tracker
 */
interface Tracker {
  /**
   * Track an event with optional tags
   * @param event The name of the event
   * @param tags Optional tags associated with the event
   */
  track(event: string, ...tags: string[]): void;
}

/**
 * Interface for a tracking event
 */
interface TrackEvent {
  event: string;
  tags: string[];
  url: string;
  title: string;
  ts: number;
}

/**
 * Tracker implementation
 */
class TrackerImpl implements Tracker {
  private buffer: TrackEvent[] = [];
  private sending = false;
  private lastSendTime = 0;
  private sendTimeout: number | null = null;
  private readonly endpoint: string;
  private readonly minEventsToSend: number;
  private readonly minTimeBetweenSends: number;

  /**
   * Create a new tracker
   * @param endpoint API endpoint for sending events
   * @param minEventsToSend Minimum number of events to buffer before sending
   * @param minTimeBetweenSends Minimum time (in ms) between sends
   */
  constructor(
    // Use environment variables with fallbacks
    // These will be replaced during build time
    endpoint = process.env.TRACKER_ENDPOINT || '/track',
    minEventsToSend = process.env.MIN_EVENTS_TO_SEND ? parseInt(process.env.MIN_EVENTS_TO_SEND, 10) : 3,
    minTimeBetweenSends = process.env.MIN_TIME_BETWEEN_SENDS ? parseInt(process.env.MIN_TIME_BETWEEN_SENDS, 10) : 1000
  ) {
    this.endpoint = endpoint;
    this.minEventsToSend = minEventsToSend;
    this.minTimeBetweenSends = minTimeBetweenSends;

    // Set up beforeunload event to send remaining events before page unload
    window.addEventListener('beforeunload', () => {
      this.sendEvents(true);
    });
  }

  /**
   * Track an event with optional tags
   * @param event The name of the event
   * @param tags Optional tags associated with the event
   */
  public track(event: string, ...tags: string[]): void {
    // Create a new tracking event
    const trackEvent: TrackEvent = {
      event,
      tags,
      url: window.location.href,
      title: document.title,
      ts: Date.now(),
    };

    // Add the event to the buffer
    this.buffer.push(trackEvent);

    // Schedule sending events if needed
    this.scheduleSend();
  }

  /**
   * Schedule sending events based on buffer size and time constraints
   */
  private scheduleSend(): void {
    // If already sending or buffer is empty, do nothing
    if (this.sending || this.buffer.length === 0) {
      return;
    }

    // If buffer has reached minimum size, send immediately
    if (this.buffer.length >= this.minEventsToSend) {
      this.sendEvents();
      return;
    }

    // If no timeout is set, schedule one
    if (this.sendTimeout === null) {
      const now = Date.now();
      const timeSinceLastSend = now - this.lastSendTime;
      const timeToWait = Math.max(0, this.minTimeBetweenSends - timeSinceLastSend);

      this.sendTimeout = window.setTimeout(() => {
        this.sendTimeout = null;
        this.sendEvents();
      }, timeToWait);
    }
  }

  /**
   * Send events to the server
   * @param sync Whether to send synchronously (for beforeunload)
   */
  private sendEvents(sync = false): void {
    // If already sending or buffer is empty, do nothing
    if (this.sending || this.buffer.length === 0) {
      return;
    }
    console.log('sendEvents');
    // Mark as sending
    this.sending = true;

    // Get events from the buffer
    const events = [...this.buffer];
    this.buffer = [];

    // Update last send time
    this.lastSendTime = Date.now();

    // Send events to the server
    this.sendToServer(events, sync)
      .then(success => {
        if (!success) {
          // If sending failed, add events back to the buffer
          this.buffer = [...events, ...this.buffer];

          // Wait a second before trying again
          window.setTimeout(() => {
            this.sending = false;
            this.scheduleSend();
          }, 1000);
        } else {
          // If sending succeeded, reset sending flag
          this.sending = false;

          // Schedule sending remaining events if any
          if (this.buffer.length > 0) {
            this.scheduleSend();
          }
        }
      })
      .catch(() => {
        // If sending failed, add events back to the buffer
        this.buffer = [...events, ...this.buffer];

        // Wait a second before trying again
        window.setTimeout(() => {
          this.sending = false;
          this.scheduleSend();
        }, 1000);
      });
  }

  /**
   * Send events to the server
   * @param events Events to send
   * @param sync Whether to send synchronously
   * @returns Promise resolving to success status
   */
  private async sendToServer(events: TrackEvent[], sync = false): Promise<boolean> {
    try {
      // Create URL-encoded form data to avoid preflight requests
      const formData = new URLSearchParams();
      formData.append('events', JSON.stringify(events));

      // Create fetch options with simple content type to avoid preflight
      const options: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      };

      // Add sync flag for beforeunload
      if (sync && navigator.sendBeacon) {
        // Use sendBeacon for sync requests if available
        const blob = new Blob([formData.toString()], {
          type: 'application/x-www-form-urlencoded',
        });
        return navigator.sendBeacon(this.endpoint, blob);
      }

      // Use fetch for async requests
      const response = await fetch(this.endpoint, options);
      return response.ok;
    } catch (error) {
      console.error('Error sending events:', error);
      return false;
    }
  }
}

// Create and export the tracker instance
const tracker = new TrackerImpl();
// Make the tracker available globally
window.tracker = tracker;
export default tracker;
