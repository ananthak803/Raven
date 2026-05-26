# Backend Documentation (Express + Socket.io + MongoDB)

This backend provides:
- REST APIs for **auth, users, friends, channels, messages**
- Socket.io events for **real-time chat delivery** and **WebRTC signaling**

## Main entry points

### `backend/src/server.js`
What it does:
- Loads environment variables (`dotenv`)
- Validates config (`backend/src/config/env.js`)
- Connects to MongoDB (`backend/src/config/db.js`)
- Starts:
  - an HTTP server for REST APIs
  - a Socket.io server for real-time events
- Starts the Kafka worker (for offline notifications)
- Adds graceful shutdown for `SIGINT`/`SIGTERM`

### `backend/src/index.js`
What it does:
- Creates the Express app:
  - CORS configuration
  - JSON body size limits
  - cookie parsing
  - minimal security headers
  - request id middleware (`x-request-id`)
  - `/health` route
  - 404 route
  - centralized error handler
- Mounts routes:
  - `/user`
  - `/auth`
  - `/friend`
  - `/message`
  - `/channel`

## Environment variables

Environment variables are validated at startup using:
- `backend/src/config/env.js`

Required for startup:
- `ACCESS_TOKEN_SECRET` (JWT signing/verifying)
- `MONGO_URI` in production (DB_REQUIRED)

Important optional ones:
- `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS` (CORS security)
- `REDIS_ENABLED` (online status + cached messages)
- Cloudinary variables (`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`)
- Kafka variables (`KAFKA_BROKER`, etc.)

## REST API flow (easy language)

Typical request path:
1. Browser calls a REST endpoint (example: `/message/:channelId`)
2. Route file (example: `backend/src/routes/message.route.js`) attaches:
   - `authMiddleware` (JWT from cookie)
   - controller function
3. `auth.middleware.js` verifies JWT, then sets `req.user`
4. Controller reads `req.user` and calls MongoDB models (Mongoose)
5. Response is returned as JSON
6. If anything throws, the error is formatted by `backend/src/middlewares/error.middleware.js`

## Central error handling

### `backend/src/middlewares/error.middleware.js`
What it does:
- Converts errors to a safe JSON response
- Returns `401` for JWT/token problems
- Avoids leaking stack traces in production
- Includes `requestId` (when available)

## Socket.io flow (easy language)

### `backend/src/sockets/chat.socket.js`
What it does:
- Authenticates the socket connection by reading `accessToken` from cookies
- Stores `socket.userId` from the JWT
- Sends events based on socket rooms:
  - Each user joins their personal room: `socket.join(socket.userId)`
  - When a message is sent, the server emits to the users who belong to that channel

Key events used by the frontend:
- `send_message`
- `call-user`, `call-incoming`, `call-answered`
- `ice-candidate` (WebRTC signaling)
- `reject-call`, `end-call`

Production reliability improvements included:
- Basic validation for incoming socket payloads
- Per-socket rate limiting for common events
- Enforces channel membership for sending messages

## Kafka worker (offline notifications)

### `backend/src/workers/kafka.worker.js`
What it does:
- Consumes messages from Kafka topic `chat-messages`
- Finds channel members
- For members who are offline (checked via Redis), it stores a notification in MongoDB

## Important config modules

- `backend/src/config/env.js`: validates environment variables and builds the `config` object
- `backend/src/config/db.js`: connects and disconnects MongoDB
- `backend/src/config/redis.js`: cache + online status helpers (disabled if `REDIS_ENABLED=false`)
- `backend/src/config/cloudinary.js`: Cloudinary client used for attachment upload
- `backend/src/config/kafka.js`: Kafka producer/consumer setup

