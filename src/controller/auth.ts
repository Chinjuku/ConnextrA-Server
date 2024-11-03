import express, { Request, Response } from "express"; // ตรวจสอบให้แน่ใจว่ามีการนำเข้า
import dotenv from "dotenv";
import pool from "@/db";
import { generateAccessToken, generateRefreshToken } from "@/lib/generate_token";
import axios from "axios";
import jwt from "jsonwebtoken"

dotenv.config();

export const login = async (req: Request, res: Response) => {
    const { access_token } = req.body;
    try {
        // Verify the Google token and fetch user info
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
            {
            headers: {
                Accept: "application/json",
            },
            }
        );
        const { email, family_name, given_name, picture, id } = response.data;
        // Check if the user already exists in the database
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let userData: any;

        if (userResult.rows.length === 0) {
            // New user, insert into the database
            const newUser = await pool.query(
                'INSERT INTO users (email, family_name, given_name, image_url, google_id, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [email, family_name, given_name, picture, id, "user"]
            );
            userData = newUser.rows[0];
        } else {
            // Existing user
            userData = userResult.rows[0];
        }
        console.log(userData)
        // Generate access and refresh tokens
        const accessToken = generateAccessToken(userData.id);
        const refreshToken = generateRefreshToken(userData.id);

        // Respond with the tokens
        console.log(accessToken, refreshToken)
        res.json({ user: userData, accessToken, refreshToken });

    } catch (error) {
        console.error('Error during Google login:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.sendStatus(401); // Unauthorized
    }

    try {
    // ตรวจสอบว่า refresh token ถูกต้องหรือไม่
        jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH as string, async (err: any, user: any) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }
            // console.log(user);
            // ถ้า refresh token ถูกต้อง สร้าง access token ใหม่
            const accessToken = generateAccessToken(user.userId); // ใช้ user.id
            return res.json({ accessToken, user }); // ใช้ return ที่นี่เพื่อไม่ให้เกิดข้อผิดพลาด
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(403); // Forbidden
    }
};
