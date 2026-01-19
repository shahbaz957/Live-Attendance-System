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
   const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7)  // Remove "Bearer " prefix
    : authHeader;  
  if (!token) {
    return errorResponse(res, "Unauthorized, token missing or invalid", 401);
  }
  try {
    if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not defined");
}
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    // ! means that trust me JWT_TOKEN is not undefined it will be string and present at the time of compilation
    req.user = decoded;
    console.log("Req got the user")
    next();
  } catch (error) {
    return errorResponse(res, "Unauthorized, token missing or invalid", 401);
  }
};

export const teacherOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user: TokenPayload = req.user!;
  console.log("i am in teacher only here the error occur")
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
  if (user.role != "student") {
    return errorResponse(res, "Forbidden, student access required", 403);
  }
  next();
};
