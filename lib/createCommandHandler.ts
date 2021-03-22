import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Base64,
} from "../deps.ts";

type SupportedDenoSubCommand = "run" | "fmt";

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
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const cmd = ["deno", commandType];
    if (qs.has("unstable")) {
      cmd.push("--unstable");
    }
    cmd.push("-");

    const executor = Deno.run({
      cmd,
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });

    await executor.stdin?.write(encoder.encode(source));
    executor.stdin?.close();
    let killed = false;
    const timer = setTimeout(() => {
      killed = true;
      executor.kill(Deno.Signal.SIGKILL);
    }, parseInt(Deno.env.get("SCRIPT_EXECUTION_TIMEOUT") || "3000", 10));

    const [status, stdout, stderr] = await Promise.all([
      executor.status(),
      executor.output(),
      executor.stderrOutput(),
    ]);

    clearTimeout(timer);

    executor.close();

    if (!status.success) {
      if (killed) {
        return formatResponse("Exceeding execution time limit", 500);
      }
      return formatResponse(decoder.decode(stderr), 500);
    }
    return formatResponse(decoder.decode(stdout), 200);
  };
}

function formatResponse(body: string, statusCode: number) {
  return {
    statusCode,
    body,
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
    },
  };
}
