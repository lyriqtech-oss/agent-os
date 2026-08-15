const API_BASE = import.meta.env.VITE_AGENTOS_API || "http://127.0.0.1:4777";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json();
  if (!response.ok || payload.ok === false) throw new Error(payload.message || "AgentOS daemon request failed.");
  return payload;
}

export async function getDaemonState() {
  const [health, apps, agents, system, network] = await Promise.all([
    request("/api/health"),
    request("/api/apps"),
    request("/api/agents"),
    request("/api/system/status"),
    request("/api/network")
  ]);
  return { health, apps: apps.apps, agents: agents.agents, config: agents.config, system, network };
}

export function validateProvider(payload) {
  return request("/api/providers/validate", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getFiles() {
  return request("/api/files");
}

export function checkUpdates() {
  return request("/api/updates/check");
}

export function launchApp(appId) {
  return request(`/api/apps/${appId}/launch`, { method: "POST" });
}

export function requestPower(action) {
  return request("/api/power", {
    method: "POST",
    body: JSON.stringify({ action })
  });
}
