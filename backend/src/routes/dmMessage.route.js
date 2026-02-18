import express from "express";
import { getMessages } from "../controllers/dmMessage.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:chatId", authMiddleware, getMessages);

export default router;
