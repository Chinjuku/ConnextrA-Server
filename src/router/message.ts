import { getChatRoomMessage } from "@/controller/chat_room";
import { createMessage } from "@/controller/message";
import { getAllChat, getChatGroup, getChatLog } from "@/controller/chat_log";
import { Router } from "express";

const router = Router();

// chatroom
router.get('/chat_room', getChatRoomMessage);

router.post('/create', createMessage);

router.get("/loadMessages", getChatLog);

router.get("/loadGroupMessages", getChatGroup);

router.get("/all", getAllChat);

export default router
