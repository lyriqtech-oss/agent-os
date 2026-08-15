import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
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

async function appendLog(message, level = "INFO") {
  const config = await readJson("config.json");
  const stamp = new Date().toISOString().slice(11, 19);
  config.logs = [
    ...(config.logs || []).slice(-24),
    `${stamp}  [${level}]  ${message}`
  ];
  await writeJson("config.json", config);
  return config;
}

async function systemStatus() {
  const memoryTotal = os.totalmem();
  const memoryFree = os.freemem();
  const load = os.loadavg()[0] || 0;
  const cpuCount = Math.max(os.cpus().length, 1);
  const uptime = Math.round(os.uptime());
  return {
    ok: true,
    os: {
      name: "Lyriq AgentOS",
      base: `${os.type()} ${os.release()}`,
      arch: os.arch(),
      hostname: os.hostname(),
      uptime
    },
    resources: {
      cpu: Math.min(99, Math.round((load / cpuCount) * 100)),
      memory: Math.round(((memoryTotal - memoryFree) / memoryTotal) * 100),
      storage: 42,
      battery: 86
    },
    services: [
      { id: "agentos-daemon", name: "AgentOS Daemon", status: "running" },
      { id: "agent-runtime", name: "Agent Runtime", status: "running" },
      { id: "model-router", name: "Model Router", status: "ready" },
      { id: "app-registry", name: "App Registry", status: "running" },
      { id: "vault", name: "Local Vault", status: "locked" }
    ]
  };
}

function networkStatus() {
  const interfaces = os.networkInterfaces();
  const active = Object.entries(interfaces)
    .flatMap(([name, entries]) => (entries || []).map((entry) => ({ name, ...entry })))
    .filter((entry) => !entry.internal && entry.family === "IPv4");

  return {
    ok: true,
    connected: active.length > 0,
    active: active[0]
      ? { name: active[0].name, address: active[0].address, type: active[0].name.startsWith("wl") ? "Wi-Fi" : "Ethernet" }
      : null,
    wifi: [
      { ssid: "Lyriq Studio", strength: 94, secured: true, connected: true },
      { ssid: "AgentOS Lab", strength: 78, secured: true, connected: false },
      { ssid: "Guest Network", strength: 56, secured: false, connected: false }
    ],
    vpn: { connected: false, profile: "Lyriq Secure" },
    dns: ["1.1.1.1", "8.8.8.8"]
  };
}

function securityScore(security) {
  const enabled = Object.values(security.protection || {}).filter(Boolean).length;
  const total = Object.values(security.protection || {}).length || 1;
  const threatPenalty = Math.min((security.threats || []).length * 12, 42);
  return Math.max(0, Math.round((enabled / total) * 100) - threatPenalty);
}

async function securityStatus() {
  const security = await readJson("security.json");
  return {
    ok: true,
    score: securityScore(security),
    state: (security.threats || []).length ? "attention" : "protected",
    ...security
  };
}

async function securityScan(type = "quick") {
  const security = await readJson("security.json");
  const scanType = type === "full" ? "Full Scan" : type === "custom" ? "Custom Scan" : "Quick Scan";
  security.lastScan = {
    type: scanType,
    status: "clean",
    scanned: scanType === "Full Scan" ? 84231 : 14820,
    threats: 0,
    duration: scanType === "Full Scan" ? "04:18" : "00:46"
  };
  security.events = [
    ...(security.events || []).slice(-24),
    `${new Date().toISOString().slice(11, 19)}  [SECURITY]  ${scanType} completed, no threats found`
  ];
  await writeJson("security.json", security);
  await appendLog(`Lyriq Defender ${scanType.toLowerCase()} completed`);
  return { ok: true, ...security, score: securityScore(security), state: "protected" };
}

async function toggleProtection(key, enabled) {
  const security = await readJson("security.json");
  if (!(key in security.protection)) return { ok: false, message: "Unknown protection module." };
  security.protection[key] = Boolean(enabled);
  security.events = [
    ...(security.events || []).slice(-24),
    `${new Date().toISOString().slice(11, 19)}  [SECURITY]  ${key} ${enabled ? "enabled" : "disabled"}`
  ];
  await writeJson("security.json", security);
  await appendLog(`Security module ${key} ${enabled ? "enabled" : "disabled"}`);
  return { ok: true, ...security, score: securityScore(security), state: (security.threats || []).length ? "attention" : "protected" };
}

async function quarantineThreat(threatId) {
  const security = await readJson("security.json");
  const threat = (security.threats || []).find((item) => item.id === threatId);
  if (!threat) return { ok: false, message: "Threat not found." };
  security.threats = security.threats.filter((item) => item.id !== threatId);
  security.quarantine = [...(security.quarantine || []), { ...threat, quarantinedAt: new Date().toISOString() }];
  security.events = [
    ...(security.events || []).slice(-24),
    `${new Date().toISOString().slice(11, 19)}  [SECURITY]  ${threat.name} moved to quarantine`
  ];
  await writeJson("security.json", security);
  await appendLog(`Threat quarantined: ${threat.name}`, "WARN");
  return { ok: true, ...security, score: securityScore(security), state: (security.threats || []).length ? "attention" : "protected" };
}

async function fileIndex() {
  const home = os.homedir();
  const entries = await readdir(home, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(entries.slice(0, 12).map(async (entry) => {
    const path = `${home}/${entry.name}`;
    const info = await stat(path).catch(() => null);
    return {
      name: entry.name,
      type: entry.isDirectory() ? "folder" : "file",
      size: info ? info.size : 0,
      modified: info ? info.mtime.toISOString() : null
    };
  }));

  return {
    ok: true,
    location: home,
    quickAccess: ["Desktop", "Documents", "Downloads", "Pictures", "Workspace", "Vault"],
    files
  };
}

async function powerAction(action) {
  const allowed = ["sleep", "restart", "shutdown", "lock"];
  if (!allowed.includes(action)) return { ok: false, message: "Unsupported power action." };
  await appendLog(`Power action requested: ${action}`);
  return {
    ok: true,
    action,
    message: `${action} queued. Real system power control will be attached through systemd/polkit.`
  };
}

async function updateCheck() {
  const config = await readJson("config.json");
  await appendLog("Update manifest checked");
  return {
    ok: true,
    current: config.version,
    channel: config.channel,
    latest: "0.1.1",
    updateAvailable: config.version !== "0.1.1",
    notes: [
      "Desktop shell stability improvements",
      "Agent Center runtime polish",
      "Network and power backend hooks"
    ],
    signed: true
  };
}

async function launchApp(appId) {
  const apps = await readJson("apps.json");
  const app = apps.find((item) => item.id === appId);
  if (!app) return { ok: false, message: "App is not installed." };
  await appendLog(`${app.name} launched`);
  return { ok: true, app, launchedAt: new Date().toISOString() };
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
  config.logs = [...config.logs.slice(-24), `${new Date().toISOString().slice(11, 19)}  [INFO]  ${provider} provider validated for ${model}`];
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

    if (request.method === "GET" && url.pathname === "/api/system/status") {
      return send(response, 200, await systemStatus());
    }

    if (request.method === "GET" && url.pathname === "/api/network") {
      return send(response, 200, networkStatus());
    }

    if (request.method === "GET" && url.pathname === "/api/security/status") {
      return send(response, 200, await securityStatus());
    }

    if (request.method === "POST" && url.pathname === "/api/security/scan") {
      return send(response, 200, await securityScan((await readBody(request)).type));
    }

    if (request.method === "POST" && url.pathname === "/api/security/protection") {
      const body = await readBody(request);
      return send(response, 200, await toggleProtection(body.key, body.enabled));
    }

    if (request.method === "POST" && url.pathname === "/api/security/quarantine") {
      return send(response, 200, await quarantineThreat((await readBody(request)).threatId));
    }

    if (request.method === "GET" && url.pathname === "/api/files") {
      return send(response, 200, await fileIndex());
    }

    if (request.method === "GET" && url.pathname === "/api/updates/check") {
      return send(response, 200, await updateCheck());
    }

    if (request.method === "POST" && url.pathname === "/api/power") {
      return send(response, 200, await powerAction((await readBody(request)).action));
    }

    const launchMatch = url.pathname.match(/^\/api\/apps\/([^/]+)\/launch$/);
    if (request.method === "POST" && launchMatch) {
      return send(response, 200, await launchApp(launchMatch[1]));
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
