import express, { Express, Request, Response } from "express";
import pool from "@/db";

export const getChatRoomMessage = async (req: Request, res: Response): Promise<any> => {
    const { userId, friendId, groupId } = req.body;
    console.log(userId, friendId, groupId);
    try {
        let result;

        if (friendId) {
            // Query for a one-on-one chat room based on friend relationship
            result = await pool.query(
                `
                SELECT cr.id AS id,
                    m.receiver_id, 
                    m.sender_id, 
                    cr.friend_id AS friend_id_from_friends, 
                    m.content AS message_content, 
                    m.created_at AS message_created_at
                FROM chat_rooms cr
                JOIN friends f ON cr.friend_id = f.id
                JOIN messages m ON cr.message_id = m.id  
                WHERE 
                    (f.user_id = $1 AND f.friend_id = $2) 
                    OR 
                    (f.user_id = $2 AND f.friend_id = $1);
                `,
                [userId, friendId]
            );
        } else if (groupId) {
            // Query for a group chat room based on group ID
            result = await pool.query(
                `
                SELECT cr.id AS chat_room_id,
                    m.sender_id, 
                    cr.group_id,
                    m.content AS message_content,
                    m.id AS message_id,
                    m.created_at AS message_created_at
                FROM chat_rooms cr
                JOIN messages m ON cr.message_id = m.id  
                JOIN groups g ON cr.group_id = g.id
                WHERE cr.group_id = $1;
                `,
                [groupId]
            );
        } else {
            return res.status(400).json({ message: "Either friendId or groupId must be provided." });
        }

        // Check if any rows were returned and send the response
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.status(404).json({ message: "Chat room not found." });
        }

    } catch (error) {
        console.error('Error fetching chat rooms:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};