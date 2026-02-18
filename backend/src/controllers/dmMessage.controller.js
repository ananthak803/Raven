import DmMessage from "../models/dmMessage.model.js";

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const { page = 1 } = req.query;

  const limit = 20;
  const skip = (page - 1) * limit;

  const messages = await DmMessage.find({ chatId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "username avatarUrl");

  res.json(messages.reverse());
};
