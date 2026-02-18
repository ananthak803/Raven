import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";


const authMiddleware = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  const token = req.cookies?.accessToken;
  if (!token) throw new ApiError(401, "Unauthorized");

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  if (!decoded) throw new ApiError(401, "Unauthorized");

  const user = await UserModel
    .findById(decoded.userId)
    .select("_id username email");


  if (!user) throw new ApiError(401, "Unauthorized");


  req.user = user;
  next();
};


export default authMiddleware;