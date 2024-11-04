import { getChatRoomMessage } from "@/controller/chat_room";
import { createMessage } from "@/controller/message";
import { getChatLog } from "@/controller/chat_log";
import { Router } from "express";

const router = Router();

// chatroom
router.get('/chat_room', getChatRoomMessage);

router.post('/create', createMessage);

router.get("/loadMessages", getChatLog);

export default router
