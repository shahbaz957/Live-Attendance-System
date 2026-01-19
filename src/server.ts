import express from "express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import { authenticate, teacherOnly } from "./middleware/auth.js";
import { User } from "./models/user.models.js";
import { errorResponse, successResponse } from "./utils/ApiResponse.js";
import type { AuthRequest } from "./types/index.js";
import { attendanceSchema } from "./schemas/index.js";
import { Class } from "./models/class.model.js";
import expressWs from "express-ws";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { ZodError } from "zod";
import dotenv from "dotenv"

dotenv.config();
const app = express();
expressWs(app);

let activeSession: {
  classId: string;
  startedAt: Date;
  attendance: Record<string, string>;
} | null = null;

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use((req, _, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  console.log("✅ Root route hit!");
  return res.status(200).json({ message: "Server is running correctly" });
});
app.use("/auth", authRouter);
app.get(
  "/students",
  authenticate,
  teacherOnly,
  async (req: AuthRequest, res) => {
    console.log("🎯 /students route HIT!");
    console.log("User from token:", req.user);
    try {
      const students = await User.find({ role: "student" });
      return successResponse(res, 200, students);
    } catch (error) {
      return errorResponse(res, "Server Error", 500);
    }
  },
);

app.post(
  "/attendance/start",
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
      activeSession = {
        classId: classDb.id.toString(),
        startedAt: new Date(),
        attendance: {},
      };
      return successResponse(res, 200, {
        classId: activeSession.classId,
        startedAt: activeSession.startedAt,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse(res, "Invalid request schema", 400);
      }
    }
  },
);

let allWS : any[] = [];

app.ws('/ws' , async (ws , req) => {
    try {
        const token = req.query.token;
        const {userId , role} = jwt.verify(token , process.env.JWT_TOKEN!) as JwtPayload;
        console.log("DONE" , role);
    } catch (error) {
        console.log("ERROR OCCURed")
    }
})

connectDB()
  .then(() => {
    app.listen(process.env.PORT!, () =>
      console.log("Server is listening at PORT 8000"),
    );
  })
  .catch((err) => {
    console.log("Database is not Connected ..... ERROR");
    console.log(err);
  });
