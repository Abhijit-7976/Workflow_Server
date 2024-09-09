import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import User from "../models/user.model.js";
import { ApiRequest } from "../types/auth.type.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";

const signToken = (id: Types.ObjectId) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY!, {
    expiresIn: process.env.JWT_EXPIRES_IN!,
  });
};

export const getAuthUser = catchAsync(async (req: ApiRequest, res, next) => {
  if (!req.user) throw new ApiError("User not found", 404);

  res.status(200).json(new ApiResponse(200, { user: req.user }, "Logged in user"));
});

export const signup = catchAsync(async (req, res, next) => {
  console.log("Signup");
  const savedUser = await User.create(req.body);

  console.log(savedUser);

  const token = signToken(savedUser._id);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(201)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(201, { user: savedUser, token }, "User created"));
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) throw new ApiError("Please provide email and password", 400);

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.checkPassword(password))) throw new ApiError("Incorrect email or password", 401);

  const token = signToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res.status(200).cookie("token", token, cookieOptions).json(new ApiResponse(200, { user, token }, "Token generated."));
});

export const logout = catchAsync(async (req: ApiRequest, res, next) => {
  req.user = undefined;
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res.status(200).clearCookie("token", cookieOptions).json(new ApiResponse(200, null, "User logged out successfully"));
});
