import mongoose from "mongoose";
import { Router } from "express";
import { authenticate, teacherOnly } from "../middleware/auth.js";

import { attendanceSchema } from "../schemas/index.js";
import { ZodError } from "zod";
import { errorResponse } from "../utils/ApiResponse.js";
import { Class } from "../models/class.model.js";
import type { AuthRequest } from "../types/index.js";
import { getActiveResourcesInfo } from "node:process";
const router = Router();

let activeSession: {
  classId: string;
  startedAt: Date;
  attendance: Record<string, string>;
} | null = null;

router.post(
  "/start",
  authenticate,
  teacherOnly,
  async (req: AuthRequest, res) => {
    try {
      const validated = attendanceSchema.parse(req.body);
      const classId = validated.classId;
      const classDb = await Class.findById(classId);
      if (
        !classDb ||
        classDb.teacherId?.toString() !== req.user?.userId.toString()
      ) {
        return errorResponse(res, "Forbidden, not class teacher", 403);
      }
      active
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse(res, "Invalid request schema", 400);
      }
    }
  },
);
