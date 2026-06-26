# FullStack6Sem (Real-time Chat + WebRTC Calls)

This project is a real-time communication app with:
- **Chat (DM + channels)** using **REST + MongoDB** and **real-time updates** using **Socket.io**
- **Encrypted messages + encrypted attachments** (client encrypts, server stores)
- **Audio/Video calls** using **WebRTC** (Socket.io is used only for signaling)

## Tech stack (high level)

- Backend: **Node.js + Express**, **MongoDB (Mongoose)**, **Socket.io**, **JWT (cookies)**, **Redis** (optional caching/online status), **Kafka** (offline notifications), **Cloudinary** (encrypted attachments storage)
- Frontend: **React + Vite**, **Zustand** (state), **Socket.io-client**, **WebRTC**, **TailwindCSS**, **CryptoJS** (encryption)

## How everything connects (overview)

```mermaid
flowchart LR

subgraph Client["Frontend (React/Vite)"]
    UI["UI Components (DM, CallOverlay, Message)"]
    Socket["socket.io-client"]
    Store["Zustand Store (DM + Call State)"]
end

subgraph Server["Backend (Express + Socket.io)"]
    REST["REST API (Routes/Controllers)"]
    WS["Socket.io Events (Chat + Call Signaling)"]
    Error["Central Error Handler"]
end

subgraph Data["Data & Services"]
    Mongo["MongoDB (Mongoose)"]
    Redis["Redis (Online + Cache)"]
    Kafka["Kafka (Offline Notifications)"]
    Cloudinary["Cloudinary (Encrypted Attachments)"]
end

UI -->|HTTP| REST
UI -->|WebSocket| WS

Socket --> WS
Store --> UI

REST --> Mongo
REST --> Cloudinary

WS --> Mongo
WS --> Redis
WS --> Kafka
```
## Running the app (development)

### 1 Backend
1. Install dependencies:
   - `cd backend`
   - `npm i`
2. Create `backend/.env` (example):
   - `NODE_ENV=development`
   - `PORT=5000`
   - `MONGO_URI=your_mongodb_connection_string`
   - `ACCESS_TOKEN_SECRET=your_long_secret`
   - `FRONTEND_URL=http://localhost:5173`
   - (optional) `REDIS_ENABLED=true`, `REDIS_URL=...`
   - (optional) `CLOUDINARY_API_KEY=...`, `CLOUDINARY_API_SECRET=...`, `CLOUDINARY_CLOUD_NAME=...`
   - (optional) `KAFKA_BROKER=localhost:9092`
3. Start:
   - `npm run dev`

Backend entrypoint:
- `backend/src/server.js` (starts Express + Socket.io, connects DB, starts Kafka worker)

### 2) Frontend
1. Install dependencies:
   - `cd frontend`
   - `npm i`
2. Create `frontend/.env`:
   - `VITE_BACKEND_URL=http://localhost:5000`
   - (optional) `VITE_CLOUDINARY_CLOUD_NAME=...` (used for client-side uploads)
3. Start:
   - `npm run dev`

## Quick file map (where to look)

### Backend (most important files)
- `backend/src/server.js`: bootstraps the server + socket + graceful shutdown
- `backend/src/index.js`: Express app setup (CORS, routes, security headers, 404, error handler)
- `backend/src/config/env.js`: validates environment variables at startup
- `backend/src/config/db.js`: MongoDB connect/disconnect
- `backend/src/controllers/*`: REST controllers (auth, messages, channels, friends, users)
- `backend/src/routes/*`: route definitions (example: `message.route.js`)
- `backend/src/middlewares/auth.middleware.js`: verifies JWT cookie and sets `req.user`
- `backend/src/middlewares/error.middleware.js`: centralized error response
- `backend/src/sockets/chat.socket.js`: Socket.io events (chat send + WebRTC signaling)

### Frontend (most important files)
- `frontend/src/socket.js`: creates the shared Socket.io client
- `frontend/src/store/useDmStore.js`: Zustand store for DM + call state
- `frontend/src/pages/Home.jsx`: main protected UI page (sidebar + DM section + call overlay)
- `frontend/src/components/normal/OpenDm.jsx`: DM view (fetch messages, join socket room)
- `frontend/src/components/normal/InputBar.jsx`: sends encrypted messages/attachments
- `frontend/src/components/normal/Message.jsx`: decrypts and renders message content
- `frontend/src/components/normal/CallOverlay.jsx`: WebRTC call UI and call setup/teardown

## Notes for production deployment
- Run behind HTTPS (recommended) and a reverse proxy if needed.
- Set `NODE_ENV=production`.
- Provide `FRONTEND_URL` (and/or `CORS_ALLOWED_ORIGINS`) to restrict CORS in production.
- Make sure `ACCESS_TOKEN_SECRET` and `MONGO_URI` are set.

