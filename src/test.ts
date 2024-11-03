import {
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  DynamoDBClient,
  PutItemCommandInput,
  DeleteItemCommandInput,
  ScanCommandInput,
  ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi";

const client = new DynamoDBClient({});

interface ConnectionEvent {
  connectionId: string;
  user_name: string;
  user_id: string;
}

const on_connect = async (
  connectionId: string,
  user_name: string,
  user_id: string
): Promise<void> => {
  try {
    if (!connectionId) return;

    const commandInput: PutItemCommandInput = {
      TableName: "Customers",
      Item: {
        Id: { S: connectionId },
        Uid: { S: user_id },
        Name: { S: user_name },
      },
    };
    const command = new PutItemCommand(commandInput);
    await client.send(command);
  } catch (e) {
    console.error("Error in on_connect", e);
  }
};

const on_disconnect = async (connectionId: string): Promise<void> => {
  try {
    if (!connectionId) return;

    const commandInput: DeleteItemCommandInput = {
      TableName: "Customers",
      Key: {
        Id: { S: connectionId },
      },
    };
    const command = new DeleteItemCommand(commandInput);
    await client.send(command);
  } catch (e) {
    console.error("Error in on_disconnect", e);
  }
};

interface MessageBody {
  sender_id: string;
  sender_name: string;
  msg: string;
}

const on_message = async (
  connectionId: string,
  body: string | MessageBody,
  callbackUrl: string
): Promise<void> => {
  try {
    if (!connectionId) return;

    if (typeof body === "string") {
      body = JSON.parse(body) as MessageBody;
    }

    const { sender_id, sender_name, msg } = body;

    const scanCommandInput: ScanCommandInput = {
      TableName: "Customers",
    };
    const scanCommand = new ScanCommand(scanCommandInput);
    const res: ScanCommandOutput = await client.send(scanCommand);

    if (res.Items && res.Items.length) {
      await Promise.all(
        res.Items.map(async (obj) => {
          try {
            const clientApi = new ApiGatewayManagementApiClient({
              endpoint: callbackUrl,
            });

            const requestParams: PostToConnectionCommandInput = {
              ConnectionId: obj.Id.S as string,
              Data: JSON.stringify({
                sender_name,
                sender_id,
                msg,
              }),
            };
            const postCommand = new PostToConnectionCommand(requestParams);
            await clientApi.send(postCommand);
          } catch (e) {
            console.error("Error sending message to connection", e);
          }
        })
      );
    }
  } catch (e) {
    console.error("Error in on_message", e);
  }
};

export const handler = async (event: any) => {
  const {
    body,
    requestContext: { routeKey, connectionId, domainName, stage },
    queryStringParameters = {},
  } = event;

  switch (routeKey) {
    case "$connect":
      const { user_name, user_id } = queryStringParameters;
      await on_connect(connectionId, user_name, user_id);
      break;
    case "$disconnect":
      await on_disconnect(connectionId);
      break;
    case "message":
      const callbackUrl = `https://${domainName}/${stage}`;
      await on_message(connectionId, body, callbackUrl);
      break;
    default:
      break;
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify("success"),
  };
  return response;
};
