/**
 * Validator for tracking events
 */
import { TrackEvent } from '../../types';

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate a tracking event
 * @param data Data to validate
 * @returns Validation result with information if the data conforms to the TrackEvent interface
 */
export function validateTrackEvent(data: Partial<TrackEvent> | any): ValidationResult {
  // We're validating if data matches the TrackEvent interface structure
  const errors: ValidationError[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push({
      field: 'data',
      message: 'Event data must be an object',
    });
    return { valid: false, errors };
  }

  // Validate event field
  if (!data.event) {
    errors.push({
      field: 'event',
      message: 'Event name is required',
    });
  } else if (typeof data.event !== 'string') {
    errors.push({
      field: 'event',
      message: 'Event name must be a string',
    });
  }

  // Validate tags field
  if (!data.tags) {
    errors.push({
      field: 'tags',
      message: 'Tags are required',
    });
  } else if (!Array.isArray(data.tags)) {
    errors.push({
      field: 'tags',
      message: 'Tags must be an array',
    });
  } else {
    // Check if all tags are strings
    const nonStringTags = data.tags.filter((tag: unknown) => typeof tag !== 'string');
    if (nonStringTags.length > 0) {
      errors.push({
        field: 'tags',
        message: 'All tags must be strings',
      });
    }
  }

  // Validate url field
  if (!data.url) {
    errors.push({
      field: 'url',
      message: 'URL is required',
    });
  } else if (typeof data.url !== 'string') {
    errors.push({
      field: 'url',
      message: 'URL must be a string',
    });
  } else {
    try {
      new URL(data.url);
    } catch (error) {
      errors.push({
        field: 'url',
        message: 'URL is invalid',
      });
    }
  }

  // Validate title field
  if (!data.title) {
    errors.push({
      field: 'title',
      message: 'Title is required',
    });
  } else if (typeof data.title !== 'string') {
    errors.push({
      field: 'title',
      message: 'Title must be a string',
    });
  }

  // Validate ts field
  if (data.ts === undefined || data.ts === null) {
    errors.push({
      field: 'ts',
      message: 'Timestamp is required',
    });
  } else if (typeof data.ts !== 'number') {
    errors.push({
      field: 'ts',
      message: 'Timestamp must be a number',
    });
  } else if (isNaN(data.ts) || !isFinite(data.ts)) {
    errors.push({
      field: 'ts',
      message: 'Timestamp must be a valid number',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an array of tracking events
 * @param events Array of events to validate
 * @returns Validation result
 */
export function validateTrackEvents(events: any[]): ValidationResult {
  // This function validates if the events array contains valid TrackEvent objects
  const errors: ValidationError[] = [];

  // Check if events is an array
  if (!Array.isArray(events)) {
    errors.push({
      field: 'events',
      message: 'Events must be an array',
    });
    return { valid: false, errors };
  }

  // Validate each event
  for (let i = 0; i < events.length; i++) {
    const result = validateTrackEvent(events[i]);
    if (!result.valid) {
      errors.push({
        field: `events[${i}]`,
        message: `Invalid event at index ${i}`,
      });
      // Add nested errors with index prefix
      result.errors.forEach(error => {
        errors.push({
          field: `events[${i}].${error.field}`,
          message: error.message,
        });
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
