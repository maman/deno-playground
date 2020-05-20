import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Base64,
  shortUUID,
  Fnv32a,
} from "../deps.ts";

const JSONBIN_USER = Deno.env.get("JSONBIN_USER") || "";
const JSONBIN_TOKEN = Deno.env.get("JSONBIN_TOKEN") || "";
const JSONBIN_URL = `https://jsonbin.org/${JSONBIN_USER}`;

function hasher(text: string): string {
  const textUint8 = new TextEncoder().encode(text);
  const hash = new Fnv32a().write(textUint8).sum();
  return hash.toString();
}

async function checkHash(hash: string): Promise<string> {
  return fetch(`${JSONBIN_URL}/${hash}`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${JSONBIN_TOKEN}`,
    },
  }).then(result => result.ok ? result.text() : '');
}

async function storeHash(hash: string, id: string): Promise<string> {
  return fetch(`${JSONBIN_URL}/${hash}`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${JSONBIN_TOKEN}`,
    },
    body: id,
  }).then(result => result.ok ? id : '');
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

export async function storeToAPI(body: string) {
  const hash = hasher(body.trim());
  let valueRef = await checkHash(hash);
  if (!valueRef) {
    const uid = new shortUUID()(12);
    valueRef = await storeHash(hash, uid);
    return fetch(`${JSONBIN_URL}/${valueRef}`, {
      method: "POST",
      headers: {
        "Authorization": `token ${JSONBIN_TOKEN}`,
      },
      body,
    }).then((result) => {
      if (!result.ok) throw new Error(`${result.status}: ${result.statusText}`);
      return valueRef;
    })
  }
  return Promise.resolve(valueRef);
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
