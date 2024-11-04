import { Request, Response } from "express";
import pool from "@/db/rds"; 


export const createNote = async (req: Request, res: Response) => {
    const { content, creator, viewer, group_id } = req.body; // รับข้อมูลจาก req.body

    const created_at = new Date(); 
    const updated_at = new Date(); 

    try {
        const result = await pool.query(
            `INSERT INTO notes (content, created_at, updated_at, creator, viewer, group_id)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [content, created_at, updated_at, creator, viewer, group_id]
        );

        res.status(201).json(result.rows[0]); 
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).send('Internal Server Error');
    }
};


export const getNoteById = async (req: Request, res: Response): Promise<void> => {
    const { note_id } = req.params; 

    try {
        const result = await pool.query(
            `SELECT id, content, created_at, updated_at, creator, viewer, group_id 
             FROM notes WHERE id = $1`, 
            [note_id]
        );

        if (result.rows.length === 0) {
            res.status(404).send('Note not found'); 
            return; 
        }

        res.status(200).json(result.rows[0]); 
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).send('Internal Server Error');
    }
};

