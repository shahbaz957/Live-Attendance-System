import mongoose from "mongoose";
import { Attendance } from "../models/attendance.model.js";
import { Class } from "../models/class.model.js";
import { activeSession } from "../routes/attendance.route.js";
import type { eventData, extendedWS, wsData } from "../types/index.js";
import WebSocket from "ws";

export const wsReqHandler = async (
  ws: extendedWS,
  message: wsData,
  clients: Set<WebSocket>,
) => {
  const { event, data } = message;
  switch (event) {
    case "ATTENDANCE_MARKED":
      await handleAttendanceMark(ws, data, clients);
      break;
    case "TODAY_SUMMARY":
      await handleSummary(ws, clients);
    case "MY_ATTENDANCE":
      await handleMyAttendanec(ws, clients);
    case "DONE":
      await handleDone(ws, clients);
  }
};

const handleAttendanceMark = async (
  ws: extendedWS,
  data: eventData,
  clients: Set<WebSocket>,
) => {
  if (ws.user?.role !== "teacher") {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "Forbidden, teacher event only",
        },
      }),
    );
    return;
  }
  if (activeSession == null) {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "No active attendance session",
        },
      }),
    );
    return;
  }
  const { studentId, status } = data;
  activeSession.attendance[studentId] = status;
  const broadCastMsg = {
    event: "ATTENDANCE_MARKED",
    data: {
      studentId: studentId,
      status: status,
    },
  };
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(broadCastMsg));
    }
  });
};

const handleSummary = async (ws: extendedWS, clients: Set<WebSocket>) => {
  if (ws.user?.role !== "teacher") {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "Forbidden, teacher event only",
        },
      }),
    );
    return;
  }
  if (!activeSession?.attendance) {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "No active attendance session",
        },
      }),
    );
    return;
  }
  let presCount = 0,
    absentCount = 0,
    total = 0;
  Object.entries(activeSession?.attendance).forEach(([key, val]) => {
    if (val === "present") {
      presCount++;
    } else if (val === "absent") {
      absentCount++;
    }
  });
  total = absentCount + presCount;
  clients.forEach((client) => {
    client.send(
      JSON.stringify({
        event: "TODAY_SUMMARY",
        data: {
          present: presCount,
          absent: absentCount,
          total: total,
        },
      }),
    );
  });
};

const handleMyAttendanec = async (ws: extendedWS, clients: Set<WebSocket>) => {
  if (ws.user?.role !== "student") {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "Forbidden, student event only",
        },
      }),
    );
    return;
  }
  if (activeSession == null) {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "No active attendance session",
        },
      }),
    );
    return;
  }
  let stu_status = activeSession.attendance[ws.user?.userId!];
  let broadCastMsg;
  if (stu_status == null) {
    broadCastMsg = {
      event: "MY_ATTENDANCE",
      data: {
        status: "not yet updated",
      },
    };
  } else {
    broadCastMsg = {
      event: "MY_ATTENDANCE",
      data: {
        status: "present",
      },
    };
  }

  ws.send(JSON.stringify(broadCastMsg));
};

const handleDone = async (ws: extendedWS, clients: Set<WebSocket>) => {
  if (ws.user?.role !== "teacher") {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "Forbidden, teacher event only",
        },
      }),
    );
    return;
  }
  if (activeSession == null) {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "No active attendance session",
        },
      }),
    );
    return;
  }
  if (!activeSession?.attendance) {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "No active attendance session",
        },
      }),
    );
    return;
  }
  const classDb = await Class.findById(activeSession.classId);
  if (!classDb) {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: { message: "Class not found" },
      }),
    );
    return;
  }
  classDb.studentIds.forEach((stu_id) => {
    const id = stu_id.toString();
    if (!activeSession.attendance[id]) {
      activeSession.attendance[id] = "absent";
    }
  });
  const attendancePromises = Object.entries(activeSession.attendance).map(
    ([studentId, status]) =>
      Attendance.create({
        classId: activeSession.classId,
        studentId: new mongoose.Types.ObjectId(studentId),
        status,
      }),
  );

  await Promise.all(attendancePromises);
  const attendanceRec = Object.values(activeSession.attendance);
  const presCount = attendanceRec.filter((s) => s === "present").length;
  const abCount = attendanceRec.filter((s) => s === "absent").length;
  const total = presCount + abCount;
  const broadCastMsg = {
    event: "DONE",
    data: {
      message: "Attendance persisted",
      present: presCount,
      absent: abCount,
      total: total,
    },
  };
  clients.forEach((client) => {
    if (client.readyState == WebSocket.OPEN) {
      client.send(JSON.stringify(broadCastMsg));
    }
  });
};
