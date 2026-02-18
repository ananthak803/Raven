import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { UserModel } from "../models/user.model.js";

const getMe = async (req, res) => {
  const user = await UserModel.findById(req.user._id)
    .select("_id username email avatarUrl createdAt");

  res.status(200).json(
    new ApiResponse(200, user, "User profile fetched")
  );
};

const searchUsers = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    throw new ApiError(400, "Search query is required");
  }

  const users = await UserModel.find({
    username: { $regex: q, $options: "i" },
    _id: { $ne: req.user._id } // exclude self
  })
    .select("_id username avatarUrl")
    .limit(10);

  res.status(200).json(
    new ApiResponse(200, users, "Users found")
  );
};

const updateMe = async (req, res) => {
  const { username, avatarUrl } = req.body;
  const updates = {};
  if (username) updates.username = username;
  if (avatarUrl) updates.avatarUrl = avatarUrl;

  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select("_id username avatarUrl");

  res.status(200).json(
    new ApiResponse(200, user, "Profile updated")
  );
};

const getUserById = async (req, res) => {
  const { userId } = req.params;

  const user = await UserModel.findById(userId)
    .select("_id username avatarUrl");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(200, user, "User fetched")
  );
};




export {getMe,searchUsers,updateMe,getUserById};