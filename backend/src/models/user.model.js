import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import joi from "joi";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true,unique:true,trim:true },
  email: { type: String, required: true, unique: true,trim:true },
  password: { type: String, required: true,trim:true, select: false },
  avatarUrl:{ type: String, default:"https://api.dicebear.com/7.x/thumbs/png?seed=NightCoder" },
  onlineStatus: { type: String, enum: ["online", "offline", "away"], default: "offline" },
}, { timestamps: true });



userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      userId: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
        userId: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN },
  );
}


const UserModel = mongoose.model("User", userSchema);

const validateUser = (user) =>{
    return joi.object({
        username: joi.string().min(3).required().trim(),
        email: joi.string().email().required().trim(),
        password: joi.string().min(6).required().trim(),
    }).validate(user);
}

const validateLogin = (data) =>{
    return joi.object({
        email: joi.string().email().required().trim(),
        password: joi.string().min(6).required().trim(),
    }).validate(data);
}

export { UserModel, validateUser, validateLogin };