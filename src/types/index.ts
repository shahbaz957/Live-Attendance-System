import type { Request } from "express";
import type { JwtPayload } from 'jsonwebtoken';
import WebSocket from "ws";

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

export interface extendedWS extends WebSocket{
  user ?: {
    userId : string, 
    role : string 
  }
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

export interface wsData <T = any> {
  event : string , 
  data : T
}

export interface eventData {
  studentId : string, 
  status : string
}