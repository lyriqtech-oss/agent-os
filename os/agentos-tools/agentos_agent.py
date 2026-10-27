#!/usr/bin/env python3
"""Optional text agent for a configured OpenAI-compatible model endpoint.

Only read-only file tools are exposed. Model output never grants permissions.
"""
import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import HTTPRedirectHandler, Request, build_opener

from agentos_tools import handle


TOOLS = [{"type": "function", "function": {"name": "find_files",
          "description": "Find file names in one authorized directory",
          "parameters": {"type": "object", "properties": {
              "path": {"type": "string"}, "name": {"type": "string"}},
              "required": ["path", "name"], "additionalProperties": False}}},
         {"type": "function", "function": {"name": "open_applications",
          "description": "Request opening approved desktop applications; requires a separate user confirmation",
          "parameters": {"type": "object", "properties": {
              "app_ids": {"type": "array", "items": {"type": "string", "enum": ["browser", "editor", "files", "terminal"]}, "minItems": 1, "maxItems": 4}},
              "required": ["app_ids"], "additionalProperties": False}}}]


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        raise HTTPError(request.full_url, code, "Model endpoint redirected", headers, fp)


def run(prompt, roots, complete):
    allowed = ", ".join(str(root) for root in roots)
    messages = [{"role": "system", "content": f"You assist with local files. Authorized roots: {allowed}. For a file search, call find_files. If no directory is specified, use the first authorized root as path. Never claim an action succeeded without a tool result."},
                {"role": "user", "content": prompt}]
    answer = complete(messages, TOOLS)
    calls = answer.get("tool_calls") or []
    if not calls:
        return {"ok": True, "answer": answer.get("content") or "", "verified": False}
    if len(calls) != 1 or calls[0].get("function", {}).get("name") not in {"find_files", "open_applications"}:
        return {"ok": False, "error": "unsupported_tool_call"}
    try:
        args = json.loads(calls[0]["function"]["arguments"])
    except (KeyError, TypeError, ValueError):
        return {"ok": False, "error": "invalid_tool_arguments"}
    if calls[0]["function"]["name"] == "open_applications":
        app_ids = args.get("app_ids")
        allowed = {"browser", "editor", "files", "terminal"}
        if set(args) != {"app_ids"} or not isinstance(app_ids, list) or not app_ids or len(app_ids) > 4 or len(set(app_ids)) != len(app_ids) or any(app_id not in allowed for app_id in app_ids):
            return {"ok": False, "error": "invalid_tool_arguments"}
        return {"ok": True, "approval_required": True, "preview": {"action": "open_applications", "app_ids": app_ids}, "verified": False}
    if set(args) != {"path", "name"} or not all(isinstance(args[k], str) for k in args):
        return {"ok": False, "error": "invalid_tool_arguments"}
    result = handle({"action": "find", "path": args["path"], "name": args["name"]}, roots)
    if not result["ok"]:
        return result
    messages.extend([{"role": "assistant", "content": answer.get("content"), "tool_calls": calls},
                     {"role": "tool", "tool_call_id": calls[0].get("id", "tool-1"), "content": json.dumps(result)}])
    final = complete(messages, TOOLS)
    if final.get("tool_calls"):
        return {"ok": False, "error": "tool_limit_reached"}
    return {"ok": True, "answer": final.get("content") or "", "verified": True, "tool_result": result}


def main():
    config_path = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "agentos" / "agent.json"
    config = json.loads(config_path.read_text())
    roots = [Path(p).expanduser().resolve(strict=True) for p in config["allowed_roots"]]
    endpoint = config["endpoint"]
    if not (endpoint.startswith("http://127.0.0.1:") or endpoint.startswith("http://localhost:") or endpoint.startswith("https://")):
        raise SystemExit("Endpoint must be local HTTP or HTTPS")
    model = config["model"]
    key = os.environ.get("AGENTOS_API_KEY")

    def complete(messages, tools):
        payload = json.dumps({"model": model, "messages": messages, "tools": tools}).encode()
        headers = {"Content-Type": "application/json"}
        if key:
            headers["Authorization"] = f"Bearer {key}"
        req = Request(endpoint, payload, headers)
        with build_opener(NoRedirect).open(req, timeout=60) as response:
            return json.load(response)["choices"][0]["message"]

    result = run(" ".join(sys.argv[1:]), roots, complete)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if not result["ok"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
