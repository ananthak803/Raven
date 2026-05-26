import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { config } from "../config/index.js";


const authMiddleware = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  const token = req.cookies?.accessToken;
  if (!token) throw new ApiError(401, "Unauthorized");

  let decoded;
  try {
    decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Unauthorized");
  }
  if (!decoded) throw new ApiError(401, "Unauthorized");

  const user = await UserModel
    .findById(decoded.userId)
    .select("_id username email");


  if (!user) throw new ApiError(401, "Unauthorized");


  req.user = user;
  next();
};


export default authMiddleware;