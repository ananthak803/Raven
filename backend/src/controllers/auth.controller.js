import { UserModel, validateUser ,validateLogin} from "../models/user.model.js";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const cookieOptions={
  httpOnly:true,
  secure:false,
  sameSite: "lax",
  maxAge:15*24*60*60*1000,
}
const generateToken = async (user) => {
  const accessToken = user.generateAccessToken();
  return accessToken;
};


const register = async (req, res) => {
  const { username, email, password,dob} = req.body;
  const { error } = validateUser({ username, email, password });
  if (error) throw new ApiError(400, error.details[0].message);

  const existedUser = await UserModel.findOne({ email });
  if (existedUser) throw new ApiError(400, "Email Already Exist");
  const existedUserName = await UserModel.findOne({ username });
  if (existedUserName) throw new ApiError(400, "UserName Already Exist");

  const user = await UserModel.create({ username, email, password,dob });
  const createdUser = await UserModel.findById(user._id).select("-password");
  return res
    .status(201)
    .json(new ApiResponse(201,createdUser, "User registered successfully"));
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const { error } = validateLogin({ email, password });

  if (error) throw new ApiError(400, error.details[0].message);

  const user = await UserModel.findOne({ email }).select("+password");

  if (!user) throw new ApiError(400, "Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new ApiError(400, "Invalid email or password");

  const accessToken= await generateToken(user);

  const loggedInUser = await UserModel.findById(user._id).select("-password");

  return res.status(200)
  .cookie("accessToken", accessToken, cookieOptions).json(new ApiResponse(200,loggedInUser, "User logged in successfully"));
};

const logout = async (req,res)=>{
   return res.status(200).clearCookie("accessToken").json(new ApiResponse(200,{},"Logged out successfully"));
};

export { register ,login,logout};
