import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "../deps.ts";
import template from "../lib/template.ts";
import { checkUid } from "./share.ts";

export async function handler(
  { body: evtBody }: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const { method, path } = JSON.parse(evtBody || "{}");
  if (method === "GET") {
    let templateText;
    let loadedText =
      `console.log(\`Hello from Deno:\${Deno.version.deno} 🦕\`);`;
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
      loadedText = await checkUid(qs.get("id") || "") || "";
    }
    templateText = templateText.replace("{{source}}", loadedText);
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
