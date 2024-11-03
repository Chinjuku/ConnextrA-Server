import { 
    allGroup, createGroup, 
    findGroup, joinGroup, 
    kickMember, leaveGroup, 
    memberGroup, myGroup, 
    selectGroup, getFriendsNotInGroup
    } from "@/controller/group";
import { Router } from "express"

const router = Router();

// create group
router.post('/create', createGroup);

// join group
router.post('/join/:groupId/:userId', joinGroup);

// find group
router.get('/find/:userId', findGroup);

// group member
router.get('/member/:groupId', memberGroup);

// my group
router.get('/:userId', myGroup);

// show select group
router.get('/:groupId', selectGroup);

// leave group
router.delete('/leave/:groupId/:userId', leaveGroup);

// kick member
router.delete('/kick-member', kickMember);

// all group for dashboard
router.get('/', allGroup);

// friend not in group
router.get('/friends-not-in-group/:groupId/:userId', getFriendsNotInGroup);

export default router