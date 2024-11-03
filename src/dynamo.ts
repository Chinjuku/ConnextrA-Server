import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb"
import { v4 as uuidv4 } from "uuid";

const dynamoClient = new DynamoDBClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        sessionToken: process.env.AWS_SESSION_TOKEN || ''
    }
});

const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

export async function checkDynamoDBConnection(): Promise<boolean> {
    try {
        const command = new ListTablesCommand({});
        const response = await dynamoClient.send(command);
        console.log('Successfully connected to DynamoDB');
        console.log('Available tables:', response.TableNames);
        return true;
    } catch (error) {
        console.error('Failed to connect to DynamoDB:', error);
        return false;
    }
}

export async function saveMessageToDynamoDB(
    senderId: string,
    content: string,
    receiverId: string | null = null,
    groupId: string | null = null,
    image_url: string | null = null): Promise<void> {
    const messageId = uuidv4();
    const timestamp = Date.now();

    const command = new PutCommand({
        TableName: "Messages",
        Item: {
            messageId,
            senderId,
            receiverId,
            groupId,
            content,
            image_url,
            timestamp,
        },
    });

    try {
        await dynamoDB.send(command);
        console.log("Message saved to DynamoDB:", { messageId, senderId, receiverId, groupId, content, image_url, timestamp });
    } catch (error) {
        console.error("Failed to save message to DynamoDB:", error);
    }
}

export default dynamoDB
