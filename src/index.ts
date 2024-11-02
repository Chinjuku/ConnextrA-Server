// RUN SERVER --> npm run start OR npm start
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import authRoute from '@/router/auth';
import userRoute from '@/router/user';
import groupRoute from '@/router/group';
import messageRoute from '@/router/message';
import cors from "cors"

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors())
// all user and friend and block
app.use("/user", userRoute);
// authenticate
app.use("/auth", authRoute);
// group + members
app.use("/group", groupRoute);
// message
app.use("/message", messageRoute);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});