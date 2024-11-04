import { Router } from 'express';
import { createNote, getNotesByUserAndFriend, deleteNoteById  } from '@/controller/note';

const router = Router();

router.post('/create', createNote);
router.get('/user/:userId', getNotesByUserAndFriend); // Make sure this path is correct
router.delete("/delete/:noteId", deleteNoteById); // เพิ่มเส้นทางนี้

export default router;
