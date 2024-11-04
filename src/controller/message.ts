import express, { Express, Request, Response } from "express";
import pool from "@/db/rds";

export const createMessage = async (req: Request, res: Response) => {
    const { senderId, receiverId, content, groupId } = req.body;
    try {
        // Validate input
        if (!senderId || (!receiverId && !groupId) || !content) {
            res.status(400).json({ message: "Missing required fields." });
        }

        // Insert a new message into the messages table
        if (senderId && receiverId) {
            const getFriend = await pool.query(
                `
                SELECT id
                FROM friends
                WHERE (user_id = $1 AND friend_id = $2) OR
                (user_id = $2 AND friend_id = $1)
                `,
                [receiverId, senderId]
            );

            // Check if friend relationship exists
            if (getFriend.rows.length === 0) {
                res.status(404).json({ message: "Friend relationship not found." });
            }

            const result = await pool.query(
                `
                INSERT INTO messages (sender_id, receiver_id, content)
                VALUES ($1, $2, $3)
                RETURNING id
                `,
                [senderId, receiverId, content]
            );

            await pool.query(
                `
                INSERT INTO chat_rooms (message_id, friend_id)
                VALUES ($1, $2)
                `,
                [result.rows[0].id, getFriend.rows[0].id]
            );
        } else if (senderId && groupId) {
            const result = await pool.query(
                `
                INSERT INTO messages (sender_id, group_id, content)
                VALUES ($1, $2, $3)
                RETURNING id
                `,
                [senderId, groupId, content]
            );

            await pool.query(
                `
                INSERT INTO chat_rooms (message_id, group_id)
                VALUES ($1, $2)
                `,
                [result.rows[0].id, groupId]
            );
        }

        // Sending back the created message ID or relevant data
        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal Server Error", error: error });
    }
};
