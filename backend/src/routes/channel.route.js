import express from "express";
import { getDmChannels } from "../controllers/channel.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/dms", authMiddleware, getDmChannels);

export default router;
