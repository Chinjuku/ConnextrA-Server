import { Router } from "express"
import { authenticateToken } from "@/middleware/authenticate";
import { addFriend, editAccount, getAccount, getAllFriends, getNotFriends } from "@/controller/user"
import { blockFriend, unblockFriend } from "@/controller/block";

const router = Router();

// my account
router.get('/protected-route', authenticateToken, getAccount);

// edit account
router.put('/edit/:userId', editAccount);

// all friends
router.get('/all-friends', getAllFriends)

// ในไฟล์ routes ของคุณ
router.get('/not-friend-yet/:userId', getNotFriends);



// add friend
router.post('/addfriend', addFriend);

// block friend
router.post('/block-friend', blockFriend)

// unblock friend
router.delete('/block-friend', unblockFriend)

export default router