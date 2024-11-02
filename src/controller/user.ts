import express, { Express, Request, Response } from "express";
import pool from "@/db";

interface CustomRequest extends Request {
    user?: any; // หรือระบุ type ที่เหมาะสมกับข้อมูลของคุณ
}

export const getAccount = async (req: CustomRequest, res: Response) => {
    console.log(req.user)
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]); // 
    res.json({ message: "This is a protected route", user: result.rows[0] });
}

export const getAllFriends = async (req: Request, res: Response) => {
    const { userId } = req.body;
    try {
        const result = await pool.query(
            `
            SELECT u.id, u.family_name, u.given_name, u.email
            FROM users u
            WHERE u.id != $1
            AND u.id IN (
                SELECT friend_id FROM friends WHERE user_id = $1
                UNION
                SELECT user_id FROM friends WHERE friend_id = $1
            )
            `, 
            [userId]
        ); // ทดสอบการดึงข้อมูลจากตาราง users
        res.send(result.rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const getNotFriends = async (req: Request, res: Response) => {
    const { userId } = req.body;
    console.log(userId)
    try {
        const result = await pool.query(
            `
            SELECT u.id, u.family_name, u.given_name, u.email
            FROM users u
            WHERE u.id != $1
            AND u.id NOT IN (
                SELECT friend_id FROM friends WHERE user_id = $1
                UNION
                SELECT user_id FROM friends WHERE friend_id = $1
                UNION
                SELECT user_id FROM blocks WHERE friend_id = $1
                UNION
                SELECT friend_id FROM blocks WHERE user_id = $1
            )
            `,
            [userId]
        );

        res.send(result.rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const addFriend = async (req: Request, res: Response) => {
    const { userId, friendId } = req.body;
    try {
        await pool.query('INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)', [userId, friendId]);
        res.status(201).json({ message: "Friend added successfully" });
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).send('Internal Server Error');
    }
}