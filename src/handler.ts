import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import pool from "@/db";

// ฟังก์ชัน Connect เมื่อผู้ใช้เชื่อมต่อ WebSocket
export const connect: APIGatewayProxyHandlerV2 = async (event) => {
    const connectionId = event.requestContext.connectionId;
    try {
        // เพิ่ม connectionId ลงในฐานข้อมูล (หรือจัดเก็บในที่ที่ต้องการ)
        await pool.query(`INSERT INTO connections (connection_id) VALUES ($1)`, [connectionId]);
        return { statusCode: 200, body: 'Connected' };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: 'Failed to connect' };
    }
};

// ฟังก์ชัน Disconnect เมื่อผู้ใช้ตัดการเชื่อมต่อ WebSocket
export const disconnect: APIGatewayProxyHandlerV2 = async (event) => {
    const connectionId = event.requestContext.connectionId;
    try {
        // ลบ connectionId ออกจากฐานข้อมูล
        await pool.query(`DELETE FROM connections WHERE connection_id = $1`, [connectionId]);
        return { statusCode: 200, body: 'Disconnected' };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: 'Failed to disconnect' };
    }
};

// ฟังก์ชัน Message สำหรับจัดการข้อความเรียลไทม์
export const message: APIGatewayProxyHandlerV2 = async (event) => {
    const { connectionId } = event.requestContext;
    const message = JSON.parse(event.body || '{}').message;

    try {
        // ดึง connection_ids ทั้งหมดเพื่อลูปและส่งข้อความไปยังผู้ใช้ที่เชื่อมต่อ
        const result = await pool.query(`SELECT connection_id FROM connections`);
        const connectionIds = result.rows.map(row => row.connection_id);

        // ส่งข้อความไปยังทุก connection_id
        for (const id of connectionIds) {
        await sendMessage(id, message);
        }
        return { statusCode: 200, body: 'Message sent' };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: 'Failed to send message' };
    }
};

// ฟังก์ชันส่งข้อความผ่าน API Gateway
async function sendMessage(connectionId: string, message: string) {
  // ใช้ AWS SDK เพื่อส่งข้อความไปยัง connectionId ที่ระบุ
  // Note: ต้องติดตั้ง AWS SDK เช่น @aws-sdk/client-apigatewaymanagementapi เพื่อใช้งานฟังก์ชันนี้
}
