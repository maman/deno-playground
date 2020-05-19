import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "../deps.ts";
import template from "./_template.ts";
import { getFromAPI } from "./share.ts";

export async function handler(
  { body: evtBody }: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const { method, path, host } = JSON.parse(evtBody || "{}");
  if (method === "GET") {
    let templateText;
    const [_, queryString] = path.split("?");
    const qs = new URLSearchParams(queryString || "");
    templateText = `${template}`;
    templateText = (qs.has("unstable"))
      ? templateText.replace("{{isUnstableTemplateMark}}", "checked")
      : templateText.replace("{{isUnstableTemplateMark}}", "");
    templateText = (qs.has("ts"))
      ? templateText.replace("{{isTypescriptTemplateMark}}", "checked")
      : templateText.replace("{{isTypescriptTemplateMark}}", "");
    if (qs.has("id")) {
      const loadedText = await getFromAPI(qs.get("id") || "");
      templateText = templateText.replace("{{source}}", loadedText);
    } else {
      templateText = templateText.replace("{{source}}", "");
    }
    return {
      headers: {
        "Content-Type": "text/html",
      },
      statusCode: 200,
      body: templateText,
    };
  } else {
    return {
      statusCode: 404,
      body: "Route not defined",
    };
  }
}
