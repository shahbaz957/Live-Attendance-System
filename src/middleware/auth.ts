import { Request , NextFunction } from "express";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config();

export const authenticate = (req : Request) => {
    const token = req.headers.authorization;
    if(!token){
        return "error Response"
    };
    const decoded = jwt.verify(token , process.env.JWT_TOKEN)
    req.user = 
}