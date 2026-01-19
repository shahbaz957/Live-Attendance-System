import express from "express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import { authenticate, teacherOnly } from "./middleware/auth.js";
import { User } from "./models/user.models.js";
import { errorResponse, successResponse } from "./utils/ApiResponse.js";
import type { AuthRequest, extendedWS } from "./types/index.js";
import jwt from "jsonwebtoken"
import { ZodError } from "zod";
import dotenv from "dotenv"
import url from "url"
import { WebSocketServer } from "ws";
import http from "http"
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

const httpServer = http.createServer(app);
const wss = new WebSocketServer({noServer : true}) 
// means we will handle the upgradation of the server manually 

httpServer.on('upgrade' , (request , socket , head) => {
    console.log("HTTP server upgradation request is recieved proceeding for further processing")
    const {query} = url.parse(request.url! , true);
    const token = query.token;

    if (!token) {
        console.log("No token is found");
        socket.destroy();
        return;
    }
    try {
        const decoded = jwt.verify(token , process.env.JWT_TOKEN!);
        // now as the token is verified and decoded, its time for handshake between http and websocket server
        wss.handleUpgrade(request, socket , head , (ws : extendedWS) => {
            ws.user = {
                userId : decoded.userId , 
                role : decoded.role
            }
            wss.emit('connection', ws , request);
        })
    } catch (error) {
        console.log("Process Broken during the token verification")
        socket.destroy();
    }
})

wss.on('connection' , (ws : extendedWS , request) => {
    ws.on('error' , (err) => {
        console.log("Websocker Error : " , err)
    })
    ws.on('close' , () => {
        console.log("User with ID " , ws.user?.userId , " is disconnected");
    })

    ws.on('message' , (data) => {
        try {
            const message = JSON.parse(data.toString());
            wsReqHandler(ws , message , wss.clients)
        } catch (error) {
            ws.send(
                JSON.stringify({
                    event : "ERROR" , 
                    data : {
                        "message" : "Invalid message format"
                    }
                })
            )
        }
    })
})


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
    app.listen(process.env.PORT!, () =>
      console.log("Server is listening at PORT 8000"),
    );
  })
  .catch((err) => {
    console.log("Database is not Connected ..... ERROR");
    console.log(err);
  });
