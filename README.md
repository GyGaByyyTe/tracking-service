# Tracking Service

A service for tracking website visitor activity, similar to Google Analytics. The system tracks user actions on a website and saves activity logs on the server.

## Features

- Track various user events on web pages
- Buffer events and send them in batches
- Store events in MongoDB
- Serve test pages for demonstration

## Tech Stack

- **Backend**: Node.js, TypeScript, Express
- **Database**: MongoDB
- **Frontend**: JavaScript (client-side tracker)

## Project Structure

```
tracking-service/
├── src/
│   ├── server/           # Server-side code
│   │   ├── index.ts      # Main server file
│   │   ├── routes/       # API routes
│   │   ├── db/           # Database operations
│   │   ├── validators/   # Input validation
│   │   └── config.ts     # Server configuration
│   ├── tracker/          # Client-side tracker
│   │   ├── tracker.ts    # Tracker implementation
│   │   └── index.ts      # Tracker entry point
│   └── types/            # Shared TypeScript types
├── public/               # Test HTML pages
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
├── tsconfig.tracker.json # Tracker-specific TS config
└── README.md
```

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Make sure MongoDB is running on your system
4. Create a `.env` file based on the provided `.env.example`:

```bash
cp .env.example .env
```

5. Customize the environment variables in the `.env` file as needed

## Configuration

The application uses environment variables for configuration. These can be set in a `.env` file at the root of the project. A `.env.example` file is provided as a template.

Available configuration options:

| Variable | Description | Default |
|----------|-------------|---------|
| STATIC_PORT | Port for serving static pages | 50000 |
| TRACKER_PORT | Port for tracker and tracking data | 8888 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017 |
| MONGODB_DB | MongoDB database name | tracking_service |
| MONGODB_COLLECTION | MongoDB collection for tracking events | tracks |
| MIN_EVENTS_TO_SEND | Minimum number of events to buffer before sending | 3 |
| MIN_TIME_BETWEEN_SENDS | Minimum time (in ms) between sending events | 1000 |
| CORS_ORIGINS | Comma-separated list of allowed CORS origins | http://localhost:50000,http://127.0.0.1:50000 |
| TRACKER_ENDPOINT | Endpoint for client-side tracker | http://localhost:8888/track |

## Building the Project

Build the server and tracker:

```bash
npm run build        # Build the server
npm run build:tracker # Build the client tracker
```

## Running the Service

Start the service:

```bash
npm start
```

This will start two servers:
- Static server (for test pages) on the port specified by STATIC_PORT in your .env file (default: 50000)
- Tracker server (for tracker script and receiving events) on the port specified by TRACKER_PORT in your .env file (default: 8888)

## Using the Tracker

Include the tracker in your HTML:

```html
<script src="http://localhost:8888/tracker"></script>
```

Note: Replace `localhost:8888` with your actual tracker server host and port as configured in your .env file.

Track events in your JavaScript:

```javascript
// Track a simple event
tracker.track('pageview');

// Track an event with tags
tracker.track('click', 'button', 'submit');
```

## Test Pages

The service includes three test pages to demonstrate tracking functionality:

- http://localhost:50000/1.html - Basic tracking demo
- http://localhost:50000/2.html - Form interaction tracking
- http://localhost:50000/3.html - E-commerce tracking demo

Note: Replace `localhost:50000` with your actual static server host and port as configured in your .env file.

## How It Works

1. The tracker collects events on the client side
2. Events are buffered and sent to the server:
   - When at least MIN_EVENTS_TO_SEND events are collected (default: 3)
   - Not more often than MIN_TIME_BETWEEN_SENDS milliseconds (default: 1000ms)
   - When the page is about to unload
3. The server validates the events and stores them in MongoDB
4. Events can be queried from the database for analysis

## Event Format

```json
{
  "event": "pageview",
  "tags": ["homepage"],
  "url": "http://localhost:50000/1.html",
  "title": "Test Page 1",
  "ts": 1675209600
}
```
