import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Base64,
} from "../deps.ts";

const beforeTimeout = (promise: Promise<any>, timeout: number = 0) => {
  const error = "Timeout occured before promise was resolved";
  const wait = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(error)), timeout)
  );
  return Promise.race([wait, promise]);
};

type SupportedDenoSubCommand = "eval" | "fmt";

const BLACKLISTED_API = ["Deno.run", "Deno.env"];

export default function createCommandHandler(
  commandType: SupportedDenoSubCommand,
) {
  return async function handler({
    body: evtBody,
  }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { method, body, path } = JSON.parse(evtBody || "{}");
    if (method !== "POST") return { statusCode: 500, body: "Not supported" };
    const [_, queryString] = path.split("?");
    const qs = new URLSearchParams(queryString || "");
    const source = Base64.fromBase64String(body).toString();
    // Blacklist some deno APIs
    if (BLACKLISTED_API.some((api) => source.includes(api))) {
      return {
        statusCode: 500,
        body: "Blacklisted APIs: ['Deno.env', 'Deno.run']",
      };
    }
    const cmd = ["deno", commandType];
    if (commandType === "fmt") {
      cmd.push("-");
    } else {
      if (qs.has("ts")) cmd.push("--ts");
      if (qs.has("unstable")) cmd.push("--unstable");
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
      // @ts-ignore
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
      Deno.kill(executor.pid, Deno.Signal.SIGTERM);
      console.error(e);
      return {
        statusCode: 500,
        body: "Exceeding execution time limit",
      };
    }
  };
}
