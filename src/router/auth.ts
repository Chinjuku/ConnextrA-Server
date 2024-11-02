import { Router } from "express";
import { login, refreshToken } from "@/controller/auth"; // Ensure this path is correct

const router = Router();

router.post('/login', login); // This should work if the login function is properly typed

router.post('/refresh-token', refreshToken);

export default router;
