import { activeSession } from "../routes/attendance.route.js";
import type { eventData, extendedWS, wsData } from "../types/index.js";

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
      await handleMyAttendanec(ws);
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
