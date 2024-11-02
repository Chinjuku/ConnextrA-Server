import { Router } from "express";
import { createNote, getNoteById } from "@/controller/note"; 
import { authenticateToken } from "@/middleware/authenticate"; 

const router = Router();


router.post('/create', createNote);

router.get('/:note_id', getNoteById);


export default router; 
