import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Base64,
  shortUUID,
  HmacSha256,
} from "../deps.ts";

const SHARE_SALT = Deno.env.get("SHARE_SALT") || "CAFEBABE";
const JSONBIN_USER = Deno.env.get("JSONBIN_USER") || "";
const JSONBIN_TOKEN = Deno.env.get("JSONBIN_TOKEN") || "";
const JSONBIN_URL = `https://jsonbin.org/${JSONBIN_USER}`;

function generateHash(body: string) {
  const h = new HmacSha256(SHARE_SALT);
  const tempHash = Base64.fromString(h.hex()).toString();
  let i = 11;

  while (tempHash.slice(0, i).endsWith("_") && i < tempHash.length) {
    i++;
  }
  return tempHash.slice(0, i);
}

async function checkUid(hash: string): Promise<boolean> {
  return fetch(`${JSONBIN_URL}/${hash}`, {
    method: "GET",
    headers: {
      "Authorization": `token ${JSONBIN_TOKEN}`,
    },
  }).then((result) => result.ok);
}

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
  const hash = generateHash(body.trim());
  const uid = await checkUid(hash);
  if (!uid) {
    return fetch(`${JSONBIN_URL}/${hash}`, {
      method: "POST",
      headers: {
        "Authorization": `token ${JSONBIN_TOKEN}`,
      },
      body,
    }).then((result) => {
      if (!result.ok) throw new Error(`${result.status}: ${result.statusText}`);
      return hash;
    });
  }
  return Promise.resolve(hash);
}

export async function handler(
  { body: evtBody }: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const { method, body, path, headers } = JSON.parse(evtBody || "{}");
  if (headers["user-agent"]?.includes("curl")) {
    return {
      statusCode: 500,
      body: "Cannot share text",
    };
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
