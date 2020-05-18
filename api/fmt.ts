import { APIGatewayProxyEvent, APIGatewayProxyResult } from "../deps.ts";
import createCommandHandler from "./_createCommandHandler.ts";

export async function handler(
  evt: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  return createCommandHandler("fmt")(evt);
}
