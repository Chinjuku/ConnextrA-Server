import { getChatRoomMessage } from "@/controller/chat_room";
import { createMessage } from "@/controller/message";
import { Router } from "express"

const router = Router();

// chatroom
router.get('/chat_room', getChatRoomMessage);

router.post('/create', createMessage);

export default router