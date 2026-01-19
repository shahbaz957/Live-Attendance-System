import express from "express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import { authenticate, teacherOnly } from "./middleware/auth.js";
import { User } from "./models/user.models.js";
import { errorResponse, successResponse } from "./utils/ApiResponse.js";
import type { AuthRequest, extendedWS, TokenPayload } from "./types/index.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { ZodError } from "zod";
import attendanceRouter from "./routes/attendance.route.js"
import dotenv from "dotenv";
import url from "url";
import { WebSocketServer } from "ws";
import http from "http";
import classRouter from "./routes/class.route.js";
import { wsReqHandler } from "./websocket/wsHandler.js";

dotenv.config();
const app = express();

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
app.use("/class", classRouter);
app.use('/attendance' , attendanceRouter)
app.get(
  "/students",
  authenticate,
  teacherOnly,
  async (req: AuthRequest, res) => {
    console.log("🎯 /students route HIT!");
    console.log("User from token:", req.user);
    try {
      const students = await User.find({ role: "student" }).select("-password");
      return successResponse(res, 200, students);
    } catch (error) {
      return errorResponse(res, "Server error", 500);
    }
  },
);

const httpServer = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });
// means we will handle the upgradation of the server manually

httpServer.on("upgrade", (request, socket, head) => {
  console.log(
    "HTTP server upgradation request is recieved proceeding for further processing",
  );
  if (!request.url?.startsWith("/ws")) {
    socket.destroy();
    return;
  }

  const { query } = url.parse(request.url!, true);
  const token = query.token;

  if (!token || typeof token !== "string") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      ws.send(
        JSON.stringify({
          event: "ERROR",
          data: { message: "Unauthorized or invalid token" },
        }),
      );
      ws.close();
    });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    // now as the token is verified and decoded, its time for handshake between http and websocket server
    wss.handleUpgrade(request, socket, head, (ws: extendedWS) => {
      ws.user = {
        userId: decoded.userId,
        role: decoded.role,
      };
      wss.emit("connection", ws, request);
    });
  } catch (error) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      ws.send(
        JSON.stringify({
          event: "ERROR",
          data: { message: "Unauthorized or invalid token" },
        }),
      );
      ws.close();
    });
  }
});

wss.on("connection", (ws: extendedWS, request) => {
  ws.on("error", (err) => {
    console.log("Websocker Error : ", err);
  });
  ws.on("close", () => {
    console.log("User with ID ", ws.user?.userId, " is disconnected");
  });

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      wsReqHandler(ws, message, wss.clients);
    } catch (error) {
      ws.send(
        JSON.stringify({
          event: "ERROR",
          data: {
            message: "Invalid message format",
          },
        }),
      );
    }
  });
});

// let allWS : any[] = [];

// app.ws('/ws' , async (ws , req) => {
//     try {
//         const token = req.query.token;
//         const {userId , role} = jwt.verify(token , process.env.JWT_TOKEN!) as JwtPayload;
//         console.log("DONE" , role);
//     } catch (error) {
//         console.log("ERROR OCCURed")
//     }
// })

connectDB()
  .then(() => {
    httpServer.listen(process.env.PORT! || 3000, () =>
      console.log("Server is listening at PORT 3000"),
    );
  })
  .catch((err) => {
    console.log("Database is not Connected ..... ERROR");
    console.log(err);
  });
