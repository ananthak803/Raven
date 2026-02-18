import express from "express";
import { getChannelMessages } from "../controllers/message.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:channelId",authMiddleware, getChannelMessages);

export default router;
