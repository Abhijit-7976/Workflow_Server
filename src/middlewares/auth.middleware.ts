import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiRequest, JWTPayload } from "../types/auth.type.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";

export const isAuth = catchAsync(async (req: ApiRequest, res, next) => {
  const authorization = req.headers.authorization;

  const token = authorization?.replace("Bearer ", "") || req?.cookies?.token;

  if (!token) throw new ApiError("Please login to get access", 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JWTPayload;

  const user = await User.findById(decoded.userId).select("+passwordChangedAt");
  if (!user) throw new ApiError("User belonging to this token does no longer exist", 401);

  user.password = undefined;

  req.user = user;
  next();
});
