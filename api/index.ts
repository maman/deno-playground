import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  dirname,
  fromFileUrl,
} from "../deps.ts";

import {getFromAPI} from './share.ts';

export async function handler(
  { body: evtBody }: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const { method, path, host } = JSON.parse(evtBody || "{}");
  if (method === "GET") {
    let templateText;
    const [_, queryString] = path.split("?");
    const textDecoder = new TextDecoder();
    const qs = new URLSearchParams(queryString || "");
    const currentPath = dirname(fromFileUrl(import.meta.url));
    const template = await Deno.open(`${currentPath}/../template/index.html`);
    templateText = textDecoder.decode(await Deno.readAll(template));
    templateText = (qs.has("unstable"))
      ? templateText.replace("{{isUnstableTemplateMark}}", "checked")
      : templateText.replace("{{isUnstableTemplateMark}}", "");
    templateText = (qs.has("ts"))
      ? templateText.replace("{{isTypescriptTemplateMark}}", "checked")
      : templateText.replace("{{isTypescriptTemplateMark}}", "");
    if (qs.has("id")) {
      const loadedText = await getFromAPI(qs.get('id') || '');
      templateText = templateText.replace("{{source}}", loadedText);
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
