import Message from "../models/message.model.js";
import { ChannelModel } from "../models/channel.model.js";
import { ApiError } from "../utils/ApiError.js";

export const getChannelMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { channelId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const channel = await ChannelModel.findOne({
      _id: channelId,
      members: currentUserId
    });

    if (!channel) {
      return res.status(403).json({
        message: "You are not part of this channel"
      });
    }

    const messages = await Message.find({ channelId })
      .populate("sender", "username avatarUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

      // console.log("msg",messages)
    res.status(200).json(messages.reverse());

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
