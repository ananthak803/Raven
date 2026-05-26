import Message from "../models/message.model.js";
import { ChannelModel } from "../models/channel.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getCachedMessages, cacheMessages } from "../config/redis.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import joi from "joi";

export const getChannelMessages = async (req, res) => {
  const currentUserId = req.user._id;
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  const schema = joi.object({
    page: joi.number().integer().min(1).max(100).default(1),
  });

  const { error, value } = schema.validate({
    page: Number.parseInt(req.query.page, 10),
  });
  if (error) throw new ApiError(400, error.details[0].message);

  const page = value.page;
  const limit = 20;

  const channel = await ChannelModel.findOne({
    _id: channelId,
    members: currentUserId,
  });

  if (!channel) {
    throw new ApiError(403, "You are not part of this channel");
  }

  // 1. Attempt to fetch from Redis Cache
  const cachedData = await getCachedMessages(channelId, page);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  // 2. Cache Miss - Fetch from Database directly
  const messages = await Message.find({ channelId })
    .populate("sender", "username avatarUrl")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Ensure they are correctly ordered chronologically (oldest at top of view)
  const reversedMessages = messages.reverse();

  // 3. Store result in Redis for future requests
  await cacheMessages(channelId, page, reversedMessages);

  res.status(200).json(reversedMessages);
};

export const uploadAttachment = async (req, res) => {
  const { encryptedData, fileName } = req.body || {};

  if (typeof encryptedData !== "string" || encryptedData.length < 1) {
    throw new ApiError(400, "No file data provided");
  }

  // Prevent memory abuse. Express already caps body size, but this adds a tighter safety net.
  const MAX_ENCRYPTED_DATA_CHARS = 5_000_000;
  if (encryptedData.length > MAX_ENCRYPTED_DATA_CHARS) {
    throw new ApiError(413, "File data too large");
  }

  let safeFileName = "file";
  if (fileName !== undefined) {
    if (typeof fileName !== "string") throw new ApiError(400, "Invalid fileName");
    safeFileName = fileName
      .replace(/[^a-zA-Z0-9]/g, "_")
      .slice(0, 100);
  }

  // Convert the encrypted data to a base64 encoded text data URI for Cloudinary upload
  const base64Data = Buffer.from(encryptedData).toString("base64");
  const dataUri = `data:text/plain;base64,${base64Data}`;

  const uploadResult = await cloudinary.uploader.upload(dataUri, {
    resource_type: "raw",
    public_id: `encrypted_${Date.now()}_${safeFileName}`,
  });

  res.status(200).json({
    secure_url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
  });
};

