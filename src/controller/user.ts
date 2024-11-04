import express, { Express, Request, Response } from "express";
import pool from "@/db/rds";

interface CustomRequest extends Request {
    user?: any; // หรือระบุ type ที่เหมาะสมกับข้อมูลของคุณ
}

export const getAccount = async (req: CustomRequest, res: Response) => {
    console.log(req.user);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    res.json({ message: "This is a protected route", user: result.rows[0] });
}

export const editAccount = async (req: CustomRequest, res: Response) => {
    const { userId } = req.params;
    const { family_name, given_name, country, province, date_of_birth, about_me, phone } = req.body; // เพิ่ม phone ที่นี่
    try {
        await pool.query(
            `
            UPDATE users
            SET family_name = $2, given_name = $3, country = $4, province = $5, date_of_birth = $6, about_me = $7, phone = $8
            WHERE id = $1
            `,
            [userId, family_name, given_name, country, province, date_of_birth, about_me, phone] // เพิ่ม phone ในการส่งค่า
        );
        res.status(203).send('Account edited successfully');
    } catch (err) {
        console.error('Error editing account:', err);
        res.status(500).send('Internal Server Error');
    }
}

export const getAllFriends = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            `
            SELECT u.*, u.phone
            FROM users u
            WHERE u.id != $1
            AND u.id IN (
                SELECT friend_id FROM friends WHERE user_id = $1
                UNION
                SELECT user_id FROM friends WHERE friend_id = $1
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

export const getNotFriends = async (req: Request, res: Response) => {
    const { userId } = req.params;
    console.log(userId);
    try {
        const result = await pool.query(
            `
            SELECT u.id, u.family_name, u.given_name, u.email, u.image_url, u.phone
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
        res.status(201).json({ message: "Friend added successfully", friendId }); // ส่งกลับ friendId หรือข้อมูลที่ต้องการ
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const getFriendAccount = async (req: CustomRequest, res: Response) => {
    const { friendId } = req.params;
    const result = await pool.query('SELECT *, phone FROM users WHERE id = $1', [friendId]);
    res.json(result.rows[0]);
}

export const allUser = async (req: Request, res: Response) => {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
}
