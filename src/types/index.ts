/**
 * Types for the tracking service
 */

/**
 * Interface for tracking events
 */
export interface TrackEvent {
  /**
   * The name of the event
   */
  event: string;

  /**
   * Tags associated with the event
   */
  tags: string[];

  /**
   * The URL where the event occurred
   */
  url: string;

  /**
   * The title of the page where the event occurred
   */
  title: string;

  /**
   * Timestamp when the event occurred (in milliseconds)
   */
  ts: number;
}

/**
 * Interface for the tracker client
 */
export interface Tracker {
  /**
   * Track an event with optional tags
   * @param event The name of the event
   * @param tags Optional tags associated with the event
   */
  track(event: string, ...tags: string[]): void;
}

/**
 * Response from the tracking API
 */
export interface TrackResponse {
  /**
   * Whether the tracking was successful
   */
  success: boolean;

  /**
   * Optional error message
   */
  error?: string;
}
