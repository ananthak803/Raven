import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true, // S3 URL
    },
    type: {
      type: String,
      enum: ["image", "video", "audio", "file"],
      required: true,
    },
    fileName: {
      type: String,
    },
    size: {
      type: Number, // bytes
    },
  },
  { _id: false }
);

const dmMessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dm",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    attachments: [String],
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("DmMessage", dmMessageSchema);
