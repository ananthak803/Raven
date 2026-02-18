import "dotenv/config.js";
import app from "./index.js";
import { connectDB } from "./config/db.js";
import http from "http";
import { Server } from "socket.io";
import chatSocket from "./sockets/chat.socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        credentials:true
      }
    });

    chatSocket(io);
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
