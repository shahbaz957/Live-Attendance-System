import express from "express"
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.route.js"
import { authenticate , teacherOnly } from "./middleware/auth.js";
import { User } from "./models/user.models.js";
import { errorResponse, successResponse } from "./utils/ApiResponse.js";
import type { AuthRequest } from "./types/index.js";
const app = express();

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true , limit : "16kb"}))
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});

app.get("/", (req, res) => {
    console.log("✅ Root route hit!");
    return res.status(200).json({ "message": "Server is running correctly" });
});
app.use('/auth' , authRouter);
app.get("/students" , authenticate , teacherOnly ,  async (req : AuthRequest , res) => {
    console.log("🎯 /students route HIT!");
    console.log("User from token:", req.user);
    try {
        const students = await User.find({role : 'student'});
        return successResponse(res , 200 , students)
    } catch (error) {
        return errorResponse(res , "Server Error" , 500);
    }
})


connectDB()
.then(() => {
    app.listen(process.env.PORT! , () => console.log("Server is listening at PORT 8000"))
})
.catch((err) => {
    console.log("Database is not Connected ..... ERROR");
    console.log(err)
})