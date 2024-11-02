import { createGroup, findGroup, joinGroup, kickMember, leaveGroup, myGroup } from "@/controller/group";
import { Router } from "express"

const router = Router();

// create group
router.post('/create', createGroup);

// join group
router.post('/join/:groupId/:userId', joinGroup);

// find group
router.get('/find/:userId', findGroup);

// my group
router.get('/:userId', myGroup);

// leave group
router.delete('/leave/:groupId/:userId', leaveGroup);

// kick member
router.delete('/kick-member', kickMember);

export default router