import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import authRoute from "@/router/auth";
import userRoute from "@/router/user";
import groupRoute from "@/router/group";
import messageRoute from "@/router/message";
import noteRoute from "@/router/note";
import { saveMessageToDynamoDB } from "@/dynamo";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const socketPort = 3001;

// Initialize HTTP server for socket
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(express.json());
app.use(cors());

// Routes setup
app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/group", groupRoute);
app.use("/message", messageRoute);
app.use("/note", noteRoute);

// Start the Express server
app.listen(port, () => {
    console.log(`[server]: Express is running at http://localhost:${port}`);
});

// Set up Socket.IO connection
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("send_message", async (data, friendId) => {
        console.log("Message received:", data);
        const { message } = data;
        const { sender, recipient, groupId, content, id } = message;

        // Check if message structure is correct
        if (!sender || !recipient || !content || !id) {
            console.error("Invalid message structure:", message);
            return;
        }

        await saveMessageToDynamoDB(sender.id, content, friendId || null, groupId || null, null);
        io.emit("receive_message", { message }); // Broadcast to all connected clients
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Start the Socket.IO server
server.listen(socketPort, () => {
    console.log(`[socket]: Socket.IO server is running at http://localhost:${socketPort}`);
});
