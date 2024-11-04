import express, { Express, Request, Response } from "express";
import pool from "@/db/rds";

export const blockedFriends = async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.params;
    console.log(userId);

    try {
        const result = await pool.query(
            `
            SELECT *
            FROM users u
            WHERE u.id != $1
            AND u.id IN (
                SELECT friend_id FROM blocks WHERE user_id = $1
                UNION
                SELECT user_id FROM blocks WHERE friend_id = $1
            )
            `,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error finding groups:", error);
        res.status(500).send("Internal Server Error");
    }
}

export const blockFriend = async (req: Request, res: Response): Promise<any> => {
    const { userId, friendId } = req.body;
    try {
        // Delete friend connection
        await pool.query(`
            DELETE FROM friends 
            WHERE (user_id = $1 AND friend_id = $2) 
               OR (user_id = $2 AND friend_id = $1)
        `, [userId, friendId]);

        // Check if the block relationship already exists
        const result = await pool.query(
            'SELECT * FROM blocks WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
            [userId, friendId]
        );

        if (result.rows.length > 0) {
            return res.status(400).json({ message: 'User is already blocked' });
        }

        // Insert block relationship
        await pool.query(`
            INSERT INTO blocks (user_id, friend_id)
            VALUES ($1, $2)
        `, [userId, friendId]);
        
        res.status(201).json({ message: 'Friend blocked successfully' });

    } catch (err) {
        console.error('Error blocking friend:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const unblockFriend = async (req: Request, res: Response): Promise<any> => {
    const { userId, friendId } = req.params;
    try {
        // Delete friend connection
        await pool.query(`
            DELETE FROM blocks
            WHERE (user_id = $1 AND friend_id = $2) 
               OR (user_id = $2 AND friend_id = $1)
        `, [userId, friendId]);

        res.status(204).json({ message: 'Friend unblocked successfully' });

    } catch (err) {
        console.error('Error blocking friend:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}