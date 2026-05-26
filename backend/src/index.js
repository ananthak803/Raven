import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'
import friendRoute from './routes/friendship.route.js'
import messageRoute from './routes/message.route.js'
import channelRoute from './routes/channel.route.js'

import { config } from "./config/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { randomUUID } from "crypto";

const app = express();
app.set("trust proxy", config.TRUST_PROXY ? 1 : 0); // Needed when behind a reverse proxy/load balancer
app.disable("x-powered-by");

// Request ID for tracing + consistent logs
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || randomUUID();
  res.setHeader("x-request-id", req.id);

  if (config.NODE_ENV !== "production") {
    console.log(`[${req.id}] Request:`, req.method, req.url);
  }
  next();
});

// Minimal security headers (helmet avoided to keep dependencies minimal)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=()");
  if (config.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains; preload"
    );
  }
  next();
});

app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(express.static('public'));

app.use('/user',userRoute);
app.use('/auth',authRoute);
app.use('/friend',friendRoute);
app.use('/message',messageRoute);
app.use('/channel',channelRoute);

// Health check route for cloud deployment monitoring
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date(), message: 'Server is healthy and running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: 404,
  });
});

// Central error handler (must be last)
app.use(errorMiddleware);

export default app;
