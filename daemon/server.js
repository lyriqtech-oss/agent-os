import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = (...parts) => join(__dirname, "data", ...parts);
const port = Number(process.env.AGENTOS_DAEMON_PORT || 4777);

async function readJson(file) {
  return JSON.parse(await readFile(dataPath(file), "utf8"));
}

async function writeJson(file, value) {
  await writeFile(dataPath(file), `${JSON.stringify(value, null, 2)}\n`);
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function send(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  response.end(JSON.stringify(payload));
}

function publicConfig(config) {
  return {
    version: config.version,
    channel: config.channel,
    provider: config.provider,
    model: config.model,
    keyValid: config.keyValid,
    permissions: config.permissions,
    logs: config.logs
  };
}

async function validateProvider({ provider, model, apiKey }) {
  const key = String(apiKey || "").trim();
  if (!provider || !model) return { ok: false, message: "Provider and model are required." };
  if (key.length < 12) return { ok: false, message: "API key is too short." };

  const fingerprint = createHash("sha256").update(key).digest("hex").slice(0, 10);
  const config = await readJson("config.json");
  config.provider = provider;
  config.model = model;
  config.keyValid = true;
  config.providerKeyFingerprint = fingerprint;
  config.logs = [
    ...config.logs.slice(-9),
    `${new Date().toISOString().slice(11, 19)}  [INFO]  ${provider} provider validated for ${model}`
  ];
  await writeJson("config.json", config);

  return {
    ok: true,
    provider,
    model,
    fingerprint,
    message: `${provider} key validated. ${model} is ready.`
  };
}

createServer(async (request, response) => {
  if (request.method === "OPTIONS") return send(response, 204, {});

  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/api/health") {
      const config = await readJson("config.json");
      return send(response, 200, {
        ok: true,
        service: "agentos-daemon",
        version: config.version,
        channel: config.channel,
        uptime: Math.round(process.uptime())
      });
    }

    if (request.method === "GET" && url.pathname === "/api/apps") {
      return send(response, 200, { ok: true, apps: await readJson("apps.json") });
    }

    if (request.method === "GET" && url.pathname === "/api/agents") {
      const [agents, config] = await Promise.all([readJson("agents.json"), readJson("config.json")]);
      return send(response, 200, { ok: true, agents, config: publicConfig(config) });
    }

    if (request.method === "GET" && url.pathname === "/api/config") {
      return send(response, 200, { ok: true, config: publicConfig(await readJson("config.json")) });
    }

    if (request.method === "POST" && url.pathname === "/api/providers/validate") {
      return send(response, 200, await validateProvider(await readBody(request)));
    }

    return send(response, 404, { ok: false, message: "Route not found." });
  } catch (error) {
    return send(response, 500, { ok: false, message: error.message });
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`agentos-daemon listening on http://127.0.0.1:${port}`);
});
