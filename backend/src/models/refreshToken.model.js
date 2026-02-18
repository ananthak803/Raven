import mongoose from "mongoose";
import crypto from "crypto";

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    index: { expires: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deviceInfo: {
    type: String,
    default: "Unknown Device",
  },
});

refreshTokenSchema.pre("save", function () {
  if (!this.isModified("token")) return;
  this.token = crypto.createHash("sha256").update(this.token).digest("hex");
});

const RefreshTokenModel = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshTokenModel;
