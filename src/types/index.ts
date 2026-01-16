export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "teacher" | "student";
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


