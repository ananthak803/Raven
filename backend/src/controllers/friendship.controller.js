import { ApiError } from "../utils/ApiError.js";
import { FriendshipModel } from "../models/friendship.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { UserModel } from "../models/user.model.js";
import { ChannelModel } from "../models/channel.model.js";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";

const sendFriendRequest = async (req, res) => {
  const requester = req.user._id;
  const recipientUsername = req.params.username;

  const user= await UserModel.findOne({username:recipientUsername},{_id:1});
  if (!user) {
  throw new ApiError(404, "User not found");
}
  const recipient=user._id;
  if (requester.equals(recipient)) {
    throw new ApiError(400, "You cannot friend yourself");
  }

  const exists = await FriendshipModel.findOne({
    $or: [
      { requester, recipient },
      { requester: recipient, recipient: requester }
    ]
  });

  if (exists) {
    throw new ApiError(400, "Friend request already exists");
  }

  const request = await FriendshipModel.create({ requester, recipient });

  return res.status(201).json(new ApiResponse(201, request, "Friend request sent"));
};

const acceptFriendRequest = async (req, res) => {
  const { requesterId } = req.params;
  const currentUserId = req.user._id;

  const request = await FriendshipModel.findOne({
    requester: requesterId,
    recipient: currentUserId,
    status: "pending",
  });

  if (!request) {
    throw new ApiError(404, "Friend request not found");
  }

  const existingChannel = await ChannelModel.findOne({
    type: "dm",
    members: { $all: [currentUserId, requesterId] },
  });

  if (!existingChannel) {
    await ChannelModel.create({
      type: "dm",
      members: [currentUserId, requesterId],
    });
  }

 
  request.status = "accepted";
  await request.save();

  return res.json(
    new ApiResponse(200, request, "Friend request accepted")
  );
};


const rejectFriendRequest = async (req, res) => {
  const { requesterId } = req.params;

  const request = await FriendshipModel.findOne({
  requester: requesterId,
  recipient: req.user._id,
  status: "pending"
});


  if (!request) {
    throw new ApiError(404, "Friend request not found");
  }

  if (!request.recipient.equals(req.user._id)) {
    throw new ApiError(403, "Not authorized");
  }

  await request.deleteOne();

  return res.json(
    new ApiResponse(200, null, "Friend request rejected")
  );
};

const blockUser = async (req, res) => {
  const userId = req.params.userId;
  const me = req.user._id;

  await FriendshipModel.findOneAndUpdate(
    {
      $or: [
        { requester: me, recipient: userId },
        { requester: userId, recipient: me }
      ]
    },
    {
      requester: me,
      recipient: userId,
      status: "blocked"
    },
    { upsert: true, new: true }
  );

  res.json(new ApiResponse(200, null, "User blocked"));
};

const getFriends = async (req, res) => {
  const userId = req.user._id;

  const friends = await FriendshipModel.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }]
  }).populate("requester recipient", "username avatarUrl");

  const friendList = friends.map(f => {
    return f.requester._id.equals(userId)
      ? f.recipient
      : f.requester;
  });

  res.json(new ApiResponse(200, friendList));
};

const getFriendRequests = async (req, res) => {
  console.log('inside freq')
  const requests = await FriendshipModel.find({
    recipient: req.user._id,
    status: "pending"
  }).populate("requester", "username avatarUrl");
  console.log("frreq",requests)
  res.status(200).json(new ApiResponse(200, requests));
};





export { sendFriendRequest, acceptFriendRequest, rejectFriendRequest ,blockUser,getFriends,getFriendRequests};
