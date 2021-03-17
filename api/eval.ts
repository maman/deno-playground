import { APIGatewayProxyEvent, APIGatewayProxyResult } from "../deps.ts";
import createCommandHandler from "../lib/createCommandHandler.ts";

export async function handler(
  evt: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  return createCommandHandler("run")(evt);
}
