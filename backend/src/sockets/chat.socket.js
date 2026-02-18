import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import cookie from "cookie";



const chatSocket = (io) => {

  io.use((socket, next) => {
  try {
    const cookies = cookie.parse(
      socket.handshake.headers.cookie || ""
    );

    const token = cookies.accessToken; 

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    socket.userId = decoded.userId;
    console.log("no error")

    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
});

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);
    socket.on("join_channel", ({ channelId }) => {
      socket.join(channelId);
      console.log(`Joined channel: ${channelId}`);
    });
    socket.on("send_message", async ({ channelId, content, attachment }) => {
      try {
        const message = await Message.create({
          sender: socket.userId,
          channelId,
          content,
          attachment
        });

        console.log("msg rec",message)
        const populatedMessage = await message.populate(
          "sender",
          "username avatarUrl"
        );

        io.to(channelId).emit("receive_message", populatedMessage);

      } catch (error) {
        console.error("Send message error:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};


export default chatSocket;
