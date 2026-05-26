import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import { ChannelModel } from "../models/channel.model.js";
import cookie from "cookie";
import mongoose from "mongoose";
import { setUserOnline, setUserOffline, invalidateChannelCache } from "../config/redis.js";
import { publishMessageEvent } from "../config/kafka.js";
import { config } from "../config/index.js";



const chatSocket = (io) => {
  // Simple per-socket rate limiting to prevent abuse/spam.
  // Note: This is per-connection in-memory; use Redis-based throttling for multi-instance setups.
  const allowByRate = (socket, key, max, intervalMs) => {
    const now = Date.now();
    socket._rateLimiter = socket._rateLimiter || {};
    socket._rateLimiter[key] = socket._rateLimiter[key] || [];

    socket._rateLimiter[key] = socket._rateLimiter[key].filter(
      (ts) => now - ts < intervalMs
    );

    if (socket._rateLimiter[key].length >= max) return false;
    socket._rateLimiter[key].push(now);
    return true;
  };

  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(
        socket.handshake.headers.cookie || ""
      );

      const token = cookies.accessToken;

      if (!token) {
        console.warn("Socket auth failed: missing accessToken cookie");
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

      socket.userId = decoded.userId;

      next();
    } catch (error) {
      console.warn("Socket auth failed:", error?.message || error);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.userId);
    await setUserOnline(socket.userId.toString());
    
    // Globally announce that this user is now online
    io.emit("user_online", socket.userId.toString());

    // const userId = socket.handshake.query.userId;
    socket.join(socket.userId.toString());
    socket.on("join_channel", ({ channelId }) => {
      if (!mongoose.Types.ObjectId.isValid(channelId)) return;
      socket.join(channelId);
    });

    // --- WebRTC Calling Signaling ---
    socket.on("call-user", ({ to, offer, callType, callerInfo }, ack) => {
      try {
        const toId = typeof to === "string" ? to : to?.toString?.();
        if (!toId) {
          ack?.({ ok: false, error: "Invalid recipient" });
          return;
        }
        if (!allowByRate(socket, "call-user", 5, 60_000)) {
          ack?.({ ok: false, error: "Rate limited" });
          return;
        }

        console.log(`call-user received: from=${socket.userId} to=${to}`);

        console.log(`Forwarding call from ${socket.userId} to ${to}`);
        io.to(toId).emit("call-incoming", {
          from: socket.userId,
          offer,
          callType,
          callerInfo
        });

        ack?.({ ok: true });
      } catch (error) {
        console.error("call-user handler error:", error?.message || error);
        ack?.({ ok: false, error: error?.message || String(error) });
      }
    });

    socket.on("make-answer", ({ to, answer }, ack) => {
      try {
        const toId = typeof to === "string" ? to : to?.toString?.();
        if (!toId) {
          ack?.({ ok: false, error: "Invalid recipient" });
          return;
        }
        if (!allowByRate(socket, "make-answer", 5, 60_000)) {
          ack?.({ ok: false, error: "Rate limited" });
          return;
        }

        console.log(`make-answer received: from=${socket.userId} to=${to}`);
        console.log(`Forwarding answer from ${socket.userId} to ${to}`);
        io.to(toId).emit("call-answered", {
          from: socket.userId,
          answer
        });
        ack?.({ ok: true });
      } catch (error) {
        console.error("make-answer handler error:", error?.message || error);
        ack?.({ ok: false, error: error?.message || String(error) });
      }
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      const toId = typeof to === "string" ? to : to?.toString?.();
      if (!toId) return;
      // Frontend uses `candidate: null` as a metadata refresh trigger.
      if (candidate === undefined) return;
      if (!allowByRate(socket, "ice-candidate", 50, 10_000)) return;

      io.to(toId).emit("ice-candidate", {
        from: socket.userId,
        candidate,
      });
    });

    socket.on("reject-call", ({ to }) => {
      const toId = typeof to === "string" ? to : to?.toString?.();
      if (!toId) return;
      console.log(`Call rejected by ${socket.userId} sent to ${to}`);
      io.to(toId).emit("call-rejected");
    });

    socket.on("end-call", ({ to }) => {
      const toId = typeof to === "string" ? to : to?.toString?.();
      if (!toId) return;
      console.log(`Call ended by ${socket.userId} sent to ${to}`);
      io.to(toId).emit("call-ended");
    });
    // ---------------------------------

    socket.on("send_message", async ({ channelId, content, attachment }, ack) => {
      try {
        if (!allowByRate(socket, "send_message", 10, 10_000)) {
          ack?.({ ok: false, error: "Rate limited" });
          return;
        }

        if (!mongoose.Types.ObjectId.isValid(channelId)) return;
        if (content !== undefined && typeof content !== "string") return;
        if (typeof content === "string" && content.length > 5000) return;
        // Frontend sends `attachment: null` for text messages.
        if (attachment !== undefined && attachment !== null && typeof attachment !== "string") {
          ack?.({ ok: false, error: "Invalid attachment" });
          return;
        }

        // Enforce channel membership (prevents non-members from sending into a channel).
        const channel = await ChannelModel.findOne({
          _id: channelId,
          members: socket.userId,
        }).select("members");

        if (!channel) {
          ack?.({ ok: false, error: "Not a channel member" });
          return;
        }

        const message = await Message.create({
          sender: socket.userId,
          channelId,
          content,
          attachment
        });

        const populatedMessage = await message.populate(
          "sender",
          "username avatarUrl"
        );

        // Emit to personal user rooms so users receive it regardless of which tab is open.
        channel.members.forEach((memberId) => {
          io.to(memberId.toString()).emit("receive_message", populatedMessage);
        });

        // Publish to Kafka for offline notification processing
        await publishMessageEvent({
          messageId: message._id,
          channelId: channelId,
          content: content,
          sender: socket.userId
        });

        // Invalidate the cache for this channel so the NEXT time someone opens the tab they get real fresh data!
        await invalidateChannelCache(channelId);

      } catch (error) {
        console.error("Send message error:", error.message);
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.userId);
      await setUserOffline(socket.userId.toString());

      // Globally announce that this user dropped offline
      io.emit("user_offline", socket.userId.toString());
    });
  });
};


export default chatSocket;
