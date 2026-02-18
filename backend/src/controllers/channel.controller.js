import { ChannelModel } from "../models/channel.model.js";

const getDmChannels = async (req, res) => {
  try {
    const userId = req.user._id;

    const dms = await ChannelModel.find({
      type: "dm",
      members: userId   
    })
      .populate("members", "username avatarUrl")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(dms);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {getDmChannels}