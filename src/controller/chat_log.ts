import { Request, Response } from "express";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDB from "@/dynamo";

export const getChatLog = async (req: Request, res: Response): Promise<any> => {
    const { userId, friendId, groupId } = req.body;

    try {
        let params;

        if (friendId) {
            params = {
                TableName: "Messages",
                IndexName: "senderReceiverIndex",
                KeyConditionExpression: "senderId = :userId AND receiverId = :friendId",
                ExpressionAttributeValues: {
                    ":userId": userId,
                    ":friendId": friendId,
                },
                ScanIndexForward: true, // sort by timestamp
            };
        }
        else if (groupId) {
            params = {
                TableName: "Messages",
                IndexName: "groupIndex",
                KeyConditionExpression: "groupId = :groupId",
                ExpressionAttributeValues: {
                    ":groupId": groupId,
                },
                ScanIndexForward: true,
            };
        } else {
            return res.status(400).json({ message: "error: friendId and groupId can't both be null" });
        }

        const command = new QueryCommand(params);
        const data = await dynamoDB.send(command);

        if (data.Items && data.Items.length > 0) {
            res.json(data.Items);
        } else {
            res.status(404).json({ message: "No messages found." });
        }

    } catch (error) {
        console.error("Error fetching chat messages:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
