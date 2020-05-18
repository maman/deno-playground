import { APIGatewayProxyEvent, APIGatewayProxyResult, decodeQueryString, Base64 } from "./_deps.ts";

const HASTEBIN_BASE_URL = 'https://hastebin.com/documents';

export async function handler(
  {body: evtBody}: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const {method, body, path} = JSON.parse(evtBody || '{}');
  if (method === 'POST') {
    const source = Base64.fromBase64String(body).toString();
    return fetch(HASTEBIN_BASE_URL, {
      method: 'POST',
      body: source,
    }).then(result => {
      if (!result.ok) throw new Error(`${result.status}: ${result.statusText}`);
      return result.json();
    }).then(result => ({
      statusCode: 200,
      body: result.key,
    }));
  } else if (method === 'GET') {
    const [_, queryString] = path.split("?");
    const qs = decodeQueryString(queryString || '');
    if (!qs.id) return {statusCode: 500, body: 'need id queryparam'};
    return fetch(`${HASTEBIN_BASE_URL}/${qs.id}`, {method: 'GET'})
      .then(result => {
        if (!result.ok) throw new Error(`${result.status}: ${result.statusText}`);
        return result.json();
      }).then(result => ({
        statusCode: 200,
        body: result.data
      }));
  } else {
    return {
      statusCode: 500,
      body: 'Not supported',
    }
  }
}