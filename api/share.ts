import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Base64,
  shortUUID,
} from "../deps.ts";

const SALT = Deno.env.get('a');
const JSONBIN_USER = Deno.env.get("JSONBIN_USER") || "";
const JSONBIN_TOKEN = Deno.env.get("JSONBIN_TOKEN") || "";
const JSONBIN_URL = `https://jsonbin.org/${JSONBIN_USER}`;

// export function generateShareKey(): string {
  
// }

export async function getFromAPI(id: string): Promise<string> {
  return fetch(`${JSONBIN_URL}/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `token ${JSONBIN_TOKEN}`,
    },
  })
    .then((result) => {
      if (!result.ok) {
        throw new Error(`${result.status}: ${result.statusText}`);
      }
      return result.text();
    });
}

export async function storeToAPI(body: string): Promise<string> {
  const uid = new shortUUID()(12);
  return fetch(`${JSONBIN_URL}/${uid}`, {
    method: "POST",
    headers: {
      "Authorization": `token ${JSONBIN_TOKEN}`,
    },
    body,
  }).then((result) => {
    if (!result.ok) throw new Error(`${result.status}: ${result.statusText}`);
    return uid;
  });
}

export async function handler(
  { body: evtBody }: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const { method, body, path, headers } = JSON.parse(evtBody || "{}");
  if (headers['user-agent']?.includes('curl')) return {
    statusCode: 500,
    body: 'Cannot share text'
  }
  if (method === "POST") {
    const source = Base64.fromBase64String(body).toString();
    return storeToAPI(source)
      .then((uid) => ({
        statusCode: 200,
        body: uid,
      }))
      .catch((err) => {
        console.error(err);
        return {
          statusCode: 500,
          body: err.message,
        };
      });
  } else if (method === "GET") {
    const [_, queryString] = path.split("?");
    const qs = new URLSearchParams(queryString || "");
    if (!qs.has("id")) return { statusCode: 500, body: "need id queryparam" };
    return getFromAPI(qs.get("id") || "")
      .then((body) => ({
        statusCode: 200,
        body,
      }))
      .catch((err) => {
        console.error(err);
        return {
          statusCode: 500,
          body: err.message,
        };
      });
  } else {
    return {
      statusCode: 500,
      body: "Not supported",
    };
  }
}
