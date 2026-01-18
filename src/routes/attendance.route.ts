import mongoose from "mongoose";
import { Router } from "express";
import { authenticate, teacherOnly } from "../middleware/auth.js";
const router = Router()


router.post('/start' ,authenticate , teacherOnly,  async (req , res) => {
    
})