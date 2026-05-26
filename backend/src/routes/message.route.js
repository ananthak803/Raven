import express from "express";
import { getChannelMessages, uploadAttachment } from "../controllers/message.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:channelId", authMiddleware, getChannelMessages);
router.post("/upload", authMiddleware, uploadAttachment);

export default router;
