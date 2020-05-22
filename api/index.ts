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
    const isUnstable = qs.get("unstable") === "1";
    const isNotTypescript = qs.get("ts") === "0";
    const idToLoadFrom = qs.get("id");
    templateText = `${template}`;
    templateText = (isUnstable)
      ? templateText.replace("{{isUnstableTemplateMark}}", "checked")
      : templateText.replace("{{isUnstableTemplateMark}}", "");
    templateText = (isNotTypescript)
      ? templateText.replace("{{isTypescriptTemplateMark}}", "")
      : templateText.replace("{{isTypescriptTemplateMark}}", "checked");
    if (idToLoadFrom) {
      loadedText = await checkUid(idToLoadFrom) || "";
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
