import { Router } from "express";
import { signupSchema, loginSchema } from "../schemas/index.js";
import { User } from "../models/user.models.js";
import { errorResponse, successResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../types/index.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const validated = signupSchema.parse(req.body);
    const alreadyUser = await User.findOne({ email: validated.email });
    if (alreadyUser) {
      return errorResponse(res, "Email already exists", 400);
    }
    const hashedPassword = await bcrypt.hash(validated.password, 10);
    const newUser = await User.create({
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
      role: validated.role,
    });
    return successResponse(res, 201, newUser);
  } catch (error) {
    console.log("ERROR : ", error);
    if (error instanceof ZodError) {
      return errorResponse(res, "Zod schema error occured", 400);
    }
    return errorResponse(res, "Error Occured while SigningUp", 501);
  }
});
router.post("/login", async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    const user = await User.findOne({ email: validated.email });
    if (!user) {
      return errorResponse(res, "Invalid email or password", 400);
    }
    const isPassValid = await bcrypt.compare(
      validated.password,
      user.password!
    );
    if (!isPassValid) {
      return errorResponse(res, "Invalid email or password", 400);
    }
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_TOKEN!,
      {
        expiresIn: "1h",
      }
    );
    return successResponse(res, 200, token);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        "Zod Schema Error. ALl feilds are required",
        400
      );
    }
  }
});
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      return errorResponse(res, "User not found in req", 404);
    }
    const fetchedUser = await User.findById(user.userId);
    if (!fetchedUser) {
      return errorResponse(res, "Invalid Credentials", 401);
    }
    const data = {
      _id: fetchedUser._id,
      name: fetchedUser.name,
      email: fetchedUser.email,
      role: fetchedUser.role,
    };
    return successResponse(res, 200, data);
  } catch (error) {
    return errorResponse(res, "Server Error Occured", 501);
  }
});