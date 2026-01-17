import { Router } from "express";
import { classSchema } from "../schemas/index.js";
import { ZodError } from "zod";
import { errorResponse, successResponse } from "../utils/ApiResponse.js";
import { authenticate, teacherOnly } from "../middleware/auth.js";
import { Class } from "../models/class.model.js";
import type { AuthRequest } from "../types/index.js";
import { addStudentSchema } from "../schemas/index.js";
import mongoose from "mongoose";
const router = Router();

router.post("/", authenticate, teacherOnly, async (req: AuthRequest, res) => {
  try {
    const validated = classSchema.parse(req.body);
    const user = req.user!;
    const newClass = await Class.create({
      className: validated.className,
      teacherId: user.userId,
    });
    return successResponse(res, 201, newClass);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(res, "Invalid Zod Schema", 400);
    }
    return errorResponse(res, "Server Error", 500);
  }
});

router.post(
  "/:id/add-student",
  authenticate,
  teacherOnly,
  async (req: AuthRequest, res) => {
    try {
      const validated = addStudentSchema.parse(req.body);
      const user = req.user!;
      const classId = req.params.id;
      const fetchedClass = await Class.findById(classId);
      if (!fetchedClass?.teacherId?.equals(user._id)) {
        return errorResponse(res, "Teacher is not the owner of the Class", 401);
      }
      const studentId = validated.studentId;
      if (
        fetchedClass.studentIds.includes(new mongoose.Types.ObjectId(studentId))
      ) {
        return errorResponse(res, "Student already added", 400);
      }
      fetchedClass?.studentIds.push(new mongoose.Types.ObjectId(studentId));
      await fetchedClass.save();
      return successResponse(res, 200, fetchedClass);
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse(res, "Invalid Zod Schema", 400);
      }
      return errorResponse(res, "Server Error", 500);
    }
  }
);

router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    // Get the info of all the class
    const classId = req.params.id;
    const user = req.user;
    const fetchedClass = await Class.findById(classId).populate('teacherId').populate('studentIds');
    if (!fetchedClass) {
      return errorResponse(res, "Wrong Class ID", 404);
    }
    if (
      user?.role == "teacher" &&
      !fetchedClass.teacherId?.equals(new mongoose.Types.ObjectId(user.userId))
    ) {
      return errorResponse(res, "Not Authenticated Teacher", 401);
    }
    if (
      user?.role == "student" &&
      !fetchedClass.studentIds.includes(new mongoose.Types.ObjectId(user.userId))
    ) {
        return errorResponse(res , "Not Authenticated Student" , 401)
    }
    return successResponse(res , 200 , fetchedClass);
  } catch (error) {
    return errorResponse(res , "Sever Error" , 500)
  }
});

