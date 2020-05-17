import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Base64,
  decodeQueryString,
} from "./_deps.ts";

const beforeTimeout = (promise: Promise<any>, timeout: number = 0) => {
  const error = "Timeout occured before promise was resolved";
  const wait = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(error)), timeout)
  );
  return Promise.race([wait, promise]);
};

type SupportedDenoSubCommand = "eval" | "fmt";

export default function createCommandHandler(
  commandType: SupportedDenoSubCommand,
) {
  return async function handler(
    { body: evtBody }: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> {
    const { method, body, path } = JSON.parse(evtBody || "{}");
    if (method !== "POST") return { statusCode: 500, body: "Not supported" };
    const [_, queryString] = path.split("?");
    const qs = decodeQueryString(queryString || "");
    const source = Base64.fromBase64String(body).toString();
    const cmd = ["deno", commandType];
    if (qs.unstable) cmd.push("--unstable");
    if (commandType === "fmt") {
      cmd.push("-");
    } else {
      cmd.push(source);
    }
    const executor = Deno.run({
      cmd,
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });
    if (commandType === "fmt") {
      const encoder = new TextEncoder();
      await executor.stdin?.write(encoder.encode(source));
      executor.stdin?.close();
    }
    try {
      const { code } = await beforeTimeout(
        executor.status(),
        parseInt(Deno.env.get("SCRIPT_EXECUTION_TIMEOUT") || "3000", 10),
      );
      let output;
      let outputString;
      if (code === 0) {
        output = await executor.output();
      } else {
        output = await executor.stderrOutput();
      }
      const textDecoder = new TextDecoder();
      outputString = textDecoder.decode(output);
      return {
        statusCode: code === 0 ? 200 : 500,
        body: outputString,
      };
    } catch (e) {
      Deno.kill(executor.pid, Deno.Signal.SIGTERM)
      console.error(e);
      return {
        statusCode: 500,
        body: "Exceeding execution time limit",
      };
    }
  };
}
