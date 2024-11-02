import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface CustomRequest extends Request {
    user?: any; // หรือระบุ type ที่เหมาะสม
}

export const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.sendStatus(401); // Unauthorized
    }
    else {
        jwt.verify(token, process.env.JWT_SECRET_ACCESS as string, (err: any, user: any) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }
            console.log(user)
            req.user = user; // เพิ่มข้อมูลผู้ใช้ใน request
            next(); // เรียกฟังก์ชันถัดไป
        });
    }
};
