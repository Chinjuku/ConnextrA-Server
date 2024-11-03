import { allGroup, createGroup, findGroup, joinGroup, kickMember, leaveGroup, memberGroup, myGroup } from "@/controller/group";
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

// leave group
router.delete('/leave/:groupId/:userId', leaveGroup);

// kick member
router.delete('/kick-member', kickMember);

// all group for dashboard
router.delete('/all', allGroup);

export default router