import { Router } from "express"
import { authenticateToken } from "@/middleware/authenticate";
import { blockFriend, unblockFriend } from "@/controller/block";

const router = Router();

// my account
// router.get('/messages', getChatRoom);

export default router