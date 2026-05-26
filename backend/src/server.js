import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

import app from "./index.js";
import { config } from "./config/index.js";
import { connectDB, disconnectDB } from "./config/db.js";
import chatSocket from "./sockets/chat.socket.js";
import { startKafkaWorker, stopKafkaWorker } from "./workers/kafka.worker.js";

const startServer = async () => {
  let server;
  let io;

  const shutdown = async (signal) => {
    try {
      console.log(`[server] Shutdown requested: ${signal}`);

      if (io) {
        // Stop accepting new socket events + disconnect clients.
        await io.close();
      }

      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }

      await stopKafkaWorker();
      await disconnectDB();
    } catch (error) {
      console.error("[server] Shutdown error:", error?.message || error);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  try {
    await connectDB({ required: config.DB_REQUIRED });

    server = http.createServer(app);

    io = new Server(server, {
      cors: {
        origin: config.CORS_ORIGINS,
        credentials: true,
      },
    });

    chatSocket(io);
    app.set("io", io);

    server.listen(config.PORT, () => {
      console.log(`[server] Listening on port ${config.PORT}`);
      startKafkaWorker();
    });
  } catch (error) {
    console.error("[server] Failed to start:", error?.message || error);
    process.exit(1);
  }
};

startServer();
