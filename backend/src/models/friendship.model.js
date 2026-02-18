import mongoose from "mongoose";


const friendshipSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "blocked"], default: "pending" },
  blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.status === "blocked";
      }
    }
  }, { timestamps: true });


const FriendshipModel = mongoose.model("Friendship", friendshipSchema);

export { FriendshipModel };
