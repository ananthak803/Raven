import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "None"
    },

    type: {
      type: String,
      enum: ["private", "dm", "public"],
      default: "dm"
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null
    }

  },
  { timestamps: true }
);

const ChannelModel = mongoose.model("Channel", channelSchema);

export { ChannelModel };
