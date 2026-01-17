import type { Request, NextFunction, Response } from "express";
import type { AuthRequest } from "../types/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { TokenPayload } from "../types/index.js";
import { errorResponse } from "../utils/ApiResponse.js";

dotenv.config();

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return errorResponse(res, "Unauthorized, token missing or invalid", 401);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN!) as TokenPayload;
    // ! means that trust me JWT_TOKEN is not undefined it will be string and present at the time of compilation
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, "unauthorized error", 401);
  }
};

export const teacherOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user: TokenPayload = req.user!;
  if (!user) {
    return errorResponse(res, "User not found", 404);
  }
  if (user.role != "teacher") {
    return errorResponse(res, "Forbidden, teacher access required", 403);
  }
  next();
};

export const studentOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user: TokenPayload = req.user!;
  if (!user) {
    return errorResponse(res, "User not found", 404);
  }
  if (user.role != "student") {
    return errorResponse(res, "Forbidden, student access required", 403);
  }
  next();
};
