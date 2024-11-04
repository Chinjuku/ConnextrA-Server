import { Request, Response } from "express";
import { DeleteCommand, QueryCommand, QueryCommandInput, ScanCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDB from "@/db/dynamo";

export const getChatLog = async (req: Request, res: Response): Promise<void> => {
    const { userId, friendId } = req.query;

    const userIdStr = String(userId);
    const friendIdStr = friendId ? String(friendId) : undefined;

    try {
        let params: QueryCommandInput;

        if (friendId) {
            // We need to perform two queries and combine the results
            const params1: QueryCommandInput = {
                TableName: "Messages",
                IndexName: "senderReceiverIndex",
                KeyConditionExpression: "senderId = :userId AND receiverId = :friendId",
                ExpressionAttributeValues: {
                    ":userId": userIdStr,
                    ":friendId": friendIdStr,
                },
                ScanIndexForward: true,
            };

            const params2: QueryCommandInput = {
                TableName: "Messages",
                IndexName: "senderReceiverIndex",
                KeyConditionExpression: "senderId = :friendId AND receiverId = :userId",
                ExpressionAttributeValues: {
                    ":userId": userIdStr,
                    ":friendId": friendIdStr,
                },
                ScanIndexForward: true,
            };

            const [data1, data2] = await Promise.all([
                dynamoDB.send(new QueryCommand(params1)),
                dynamoDB.send(new QueryCommand(params2))
            ]);

            const combinedItems = [...(data1.Items || []), ...(data2.Items || [])];
            combinedItems.sort((a, b) => a.timestamp - b.timestamp);

            if (combinedItems.length > 0) {
                res.json(combinedItems);
            } else {
                res.status(404).json({ message: "No messages found." });
            }
        } else {
            res.status(400).json({ message: "error: friendId and groupId can't both be null" });
            return;
        }

    } catch (error) {
        console.error("Error fetching chat messages:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getChatGroup = async (req: Request, res: Response): Promise<void> => {
    const { groupId, userId } = req.query;
    const groupIdStr = String(groupId);
    const userIdStr = String(userId);

    console.log("groupId:", groupIdStr);

    try {
        if (!groupId) {
            res.status(400).json({ message: "GroupId is required." });
            return;
        }

        const params: QueryCommandInput = {
            TableName: "Messages",
            IndexName: "groupIndex",
            KeyConditionExpression: "groupId = :groupId",
            ExpressionAttributeValues: {
                ":groupId": groupIdStr,
            },
            ScanIndexForward: true,
        };

        const command = new QueryCommand(params);
        const data = await dynamoDB.send(command);

        console.log("Retrieved group messages: ", data);

        if (data.Items && data.Items.length > 0) {
            const sortedMessages = data.Items.sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            res.json(sortedMessages);
        } else {
            res.status(404).json({ message: "No messages found for this group." });
        }
    } catch (error) {
        console.error("Error fetching group chat messages:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const getAllChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const params = {
            TableName: "Messages",
        };

        const command = new ScanCommand(params);
        const data = await dynamoDB.send(command);

        console.log("Retrieved messages: ", data);

        if (data.Items && data.Items.length > 0) {
            // Sort by timestamp if it exists
            const sortedMessages = data.Items.sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            res.json(sortedMessages);
        } else {
            res.status(404).json({ message: "No messages found." });
        }
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};