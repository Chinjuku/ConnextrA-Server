import { Router } from "express"
import { authenticateToken } from "@/middleware/authenticate";
import { addFriend, editAccount, getAccount, getAllFriends, getFriendAccount, getNotFriends } from "@/controller/user"
import { blockedFriends, blockFriend, unblockFriend } from "@/controller/block";

const router = Router();

// my account
router.get('/protected-route', authenticateToken, getAccount);

// edit account
router.put('/edit/:userId', editAccount);

// friend's account
router.get('/friend-account/:friendId', getFriendAccount)

// all friends
router.get('/all-friends/:userId', getAllFriends)

// ในไฟล์ routes ของคุณ
router.get('/not-friend-yet/:userId', getNotFriends);

// add friend
router.post('/addfriend', addFriend);

// all blocked friends
router.get('/blocked/:userId', blockedFriends)

// block friend
router.post('/block-friend', blockFriend)

// unblock friend
router.delete('/unblock/:userId/:friendId', unblockFriend)

export default router