import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // เปลี่ยนเป็น URL ของแอปพลิเคชันของคุณในโปรดักชัน
        methods: ["GET", "POST"],
    },
});

const PORT = 3001;

app.use(cors()); // เปิดใช้งาน CORS

// เมื่อมีการเชื่อมต่อ Socket.IO
io.on("connection", (socket) => {
    console.log("A user connected");

    // ฟังข้อความจาก client
    socket.on("send_message", (message) => {
        console.log("Message received:", message);
        // ส่งข้อความไปยังทุกคนที่เชื่อมต่อ
        io.emit("receive_message", message);
    });

    // เมื่อมีการตัดการเชื่อมต่อ
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// เริ่มเซิร์ฟเวอร์
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
