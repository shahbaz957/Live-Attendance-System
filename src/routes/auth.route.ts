import { Router } from "express";
import { signupSchema } from "../schemas/index.js";

const router = Router();


router.post('/signup' , async (req , res) => {
    const validated = signupSchema.parse(req.body);
    
})
router.post('/login')