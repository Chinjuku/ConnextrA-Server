import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateAccessToken = (userId: number) => {
    return jwt.sign({userId}, process.env.JWT_SECRET_ACCESS as string, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: number) => {
    return jwt.sign({userId}, process.env.JWT_SECRET_REFRESH as string, { expiresIn: '7h' });
};