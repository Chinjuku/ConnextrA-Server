import { Request, Response } from "express";
import pool from "@/db/rds"; 


// Create a new note
export const createNote = async (req: Request, res: Response) => {
    const { title, content, image, friendId, userId } = req.body; // Include userId from the request body

    try {
        // Insert the new note into the database
        const result = await pool.query(
            `INSERT INTO notes (title, content, image, friend_id, user_id, timestamp) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, content, image || null, friendId, userId, new Date()]
        );

        const newNote = result.rows[0];
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error saving note:', error);
        res.status(500).json({ error: 'Failed to save the note.' });
    }
};

// Retrieve notes for a specific user and their friends
export const getNotesByUserAndFriend = async (req: Request, res: Response) => {
    const { userId } = req.params; // User ID from the URL parameter

    try {
        // Fetch notes for the user and their friends
        const result = await pool.query(
            `SELECT * FROM notes 
             WHERE user_id = $1 OR friend_id = $1 
             ORDER BY timestamp DESC`,
            [userId]
        );

        const notes = result.rows;
        res.status(200).json(notes);
    } catch (error) {
        console.error('Error retrieving notes:', error);
        res.status(500).json({ error: 'Failed to retrieve notes.' });
    }
};

export const deleteNoteById = async (req: Request, res: Response) => {
    const { noteId } = req.params; // รับ noteId จาก URL parameter

    try {
        await pool.query(`DELETE FROM notes WHERE id = $1`, [noteId]);
        res.status(204).send(); // ส่งสถานะ 204 No Content
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note.' });
    }
};