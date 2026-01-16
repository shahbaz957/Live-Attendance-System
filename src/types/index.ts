import type { Request } from "express";
import type { JwtPayload } from 'jsonwebtoken';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "teacher" | "student";
}

export interface TokenPayload extends JwtPayload{
    userId : string ,
    role : 'teacher' | 'student'
}

export interface IAttendance {
  _id: string;
  classId: string;
  studentId: string;
  status: "present" | "absent";
}

export interface IClass {
  _id: string;
  className: string;
  teacherId: string;
  studentIds: string[];
}

export interface AuthRequest extends Request{
    user ?: TokenPayload;
}

export interface ApiResponse <T = any >{
    success : Boolean;
    data ?: T;
    error ?: string;
}
