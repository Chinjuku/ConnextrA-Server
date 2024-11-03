import { getChatRoomMessage } from "@/controller/chat_room";
import { createMessage } from "@/controller/message";
import { Router, Request, Response } from "express"
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDB from "@/dynamo";

const router = Router();

router.get("/loadMessages", async (req: Request, res: Response) => {
    const { userId, friendId, groupId } = req.query;

    // Construct query parameters
    const params = {
        TableName: "Messages",
        IndexName: "ChatIndex", // Assuming a GSI named ChatIndex based on userId, friendId, or groupId
        KeyConditionExpression: "(senderId = :userId AND receiverId = :friendId) OR groupId = :groupId",
        ExpressionAttributeValues: {
            ":userId": userId,
            ":friendId": friendId,
            ":groupId": groupId,
        },
    };

    try {
        const command = new QueryCommand(params);
        const data = await dynamoDB.send(command);
        res.json(data.Items);
    } catch (error) {
        console.error("Error loading messages:", error);
        res.status(500).json({ error: "Failed to load messages" });
    }
});

// chatroom
router.get('/chat_room', getChatRoomMessage);

router.post('/create', createMessage);

export default router
