import express from "express"
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.route.js"
const app = express();

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true , limit : "16kb"}))

app.use('/auth' , authRouter);



connectDB()
.then(() => {
    app.listen(process.env.PORT! , () => console.log("Server is listening at PORT 8000"))
})
.catch((err) => {
    console.log("Database is not Connected ..... ERROR");
    console.log(err)
})