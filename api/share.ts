import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Base64,
  HmacSha256,
} from "../deps.ts";

import {
  SHARE_SALT,
  JSONBIN_URL,
  JSONBIN_TOKEN,
} from "../config.ts";

function generateHash(body: string) {
  const h = new HmacSha256(SHARE_SALT);
  h.update(body);
  const tempHash = Base64.fromString(h.hex()).toString();
  let i = 11;

  while (tempHash.slice(0, i).endsWith("_") && i < tempHash.length) {
    i++;
  }
  return tempHash.slice(0, i);
}

export async function checkUid(hash: string): Promise<string | null> {
  return fetch(`${JSONBIN_URL}/${hash}`, {
    method: "GET",
    headers: {
      "Authorization": `token ${JSONBIN_TOKEN}`,
    },
  }).then((result) => result.ok ? result.text() : null);
}

export async function store(body: string): Promise<string> {
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
    return store(source)
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
  } else {
    return {
      statusCode: 500,
      body: "Not supported",
    };
  }
}
