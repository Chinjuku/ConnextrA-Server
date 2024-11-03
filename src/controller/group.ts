import express, { Request, Response } from "express";
import pool from "@/db";
import { console } from "inspector";

export const createGroup = async (req: Request, res: Response) => {
    const { userId, friendIds, group_name } = req.body;

    try {
        // Insert the group and get the group_id
        const result = await pool.query(
            `
            INSERT INTO groups (name, created_by) 
            VALUES ($1, $2) 
            RETURNING id
            `,
            [group_name, userId]
        );

        const group_id = result.rows[0].id; // Get the inserted group_id

        if (friendIds && Array.isArray(friendIds)) {
            friendIds.push(userId)
            for (const member of friendIds) {
                await pool.query(
                    `
                    INSERT INTO group_members (group_id, user_id) 
                    VALUES ($1, $2)
                    `,
                    [group_id, member]
                );
            }
        } else {
            await pool.query(
                `
                INSERT INTO group_members (group_id, user_id) 
                VALUES ($1, $2)
                `,
                [group_id, userId]
            )
        }

        res.status(201).json({ message: "Group created successfully", group_id });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).send("Internal Server Error");
    }
};

export const joinGroup = async (req: Request, res: Response): Promise<any> => {
    const { groupId, userId } = req.params

    try {
        // Insert the group and get the group_id
        const alreadyJoined = await pool.query(
            `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
            [groupId, userId]
        )
        if (alreadyJoined.rows.length > 0) {
            return res.status(400).json({ message: "User is already a member of this group" });
        }
        await pool.query(
            `
            INSERT INTO group_members (group_id, user_id) 
            VALUES ($1, $2) 
            `,
            [groupId, userId]
        );
        res.status(201).json({ message: "Group joined successfully" });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).send("Internal Server Error");
    }
};

export const findGroup = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const searchQuery = req.query.q || ''; // รับค่าค้นหาจาก query params

    try {
        const result = await pool.query(
            `
            SELECT g.* 
            FROM groups g
            WHERE NOT EXISTS (
                SELECT 1
                FROM group_members gm
                WHERE gm.group_id = g.id AND gm.user_id = $1
            )
            AND g.name ILIKE '%' || $2 || '%'  -- ค้นหาตามชื่อกลุ่ม
            `,
            [userId, searchQuery]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error finding groups:", error);
        res.status(500).send("Internal Server Error");
    }
};


export const myGroup = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            `
            SELECT g.* 
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = $1
            `,
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error finding groups:", error);
        res.status(500).send("Internal Server Error");
    }
};

export const selectGroup = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    console.log(groupId);
    try {
        const result = await pool.query(
            `
            SELECT * FROM groups WHERE id = $1
            `,
            [groupId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error finding groups:", error);
        res.status(500).send("Internal Server Error");
    }
};

export const leaveGroup = async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;

    try {
        const result = await pool.query(
            `
            DELETE FROM group_members WHERE group_id = $1 AND user_id = $2
            `,
            [groupId, userId]
        );

        res.status(204).json(result.rows);
    } catch (error) {
        console.error("Error finding groups:", error);
        res.status(500).send("Internal Server Error");
    }
};

export const kickMember = async (req: Request, res: Response): Promise<any> => {
    const { groupId, userId, friendIds } = req.body;

    if (!Array.isArray(friendIds) || friendIds.length === 0) {
        return res.status(400).json({ error: "User IDs must be an array and cannot be empty." });
    }
    const query = `
            SELECT * FROM groups 
            WHERE id = $1 AND created_by = $2
        `;
    const result = await pool.query(query, [groupId, userId]);
    if (result.rows.length === 0) {
        return res.status(400).json({ message: "Your are not owner"})
    }
    try {
        const query = `
            DELETE FROM group_members 
            WHERE group_id = $1 AND user_id = ANY($2::integer[])
        `;
        await pool.query(query, [groupId, friendIds]);
        // Respond with a 204 No Content status
        res.status(204).send();
    } catch (error) {
        console.error("Error kicking members:", error);
        res.status(500).send("Internal Server Error");
    }
};

export const memberGroup = async (req: Request, res: Response): Promise<any> => {
    const { groupId } = req.params;

    try {
        const query = `
            SELECT gm.*, u.*
            FROM group_members gm
            INNER JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = $1
        `;
        const result = await pool.query(query, [groupId]);
        
        // Check if any rows were returned and send the response
        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).json({ message: "No members found for this group." });
        }

    } catch (error) {
        console.error("Error fetching group members:", error);
        res.status(500).send("Internal Server Error");
    }
};

export const allGroup = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM groups`)
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching group", error);
        res.status(500).send("Internal Server Error");
    }
}
