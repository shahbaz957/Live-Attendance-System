import mongoose, { mongo } from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Types.ObjectId,
    ref: "Class",
  },
  studentId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["present", "absent"],
  },
});

export const Attendance = mongoose.model("Attendance", AttendanceSchema);
