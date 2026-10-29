#!/usr/bin/env python3
"""Opt-in, per-user, read-only scheduled review of authorized files."""
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from agentos_tools import handle

THRESHOLD = 100 * 1024 * 1024


def review(roots):
    findings = []
    incomplete = []
    for root in roots[:10]:
        result = handle({"action": "find", "path": str(root), "name": "", "limit": 500}, roots)
        if not result["ok"]:
            incomplete.append({"root": str(root), "error": result["error"]})
            continue
        if result["truncated"]:
            incomplete.append({"root": str(root), "error": "search_limit_reached"})
        findings.extend({"path": item["path"], "size": item["size"]} for item in result["entries"]
                        if item["type"] == "file" and item["size"] >= THRESHOLD)
    return {"checked_at": datetime.now(timezone.utc).isoformat(),
            "threshold_bytes": THRESHOLD, "large_files": findings[:100], "incomplete": incomplete}


def main():
    config = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "agentos" / "agent.json"
    roots = [Path(p).expanduser().resolve(strict=True) for p in json.loads(config.read_text())["allowed_roots"]]
    result = review(roots)
    state = Path(os.environ.get("XDG_STATE_HOME", Path.home() / ".local" / "state")) / "agentos"
    state.mkdir(mode=0o700, parents=True, exist_ok=True)
    target = state / "last-review.json"
    temp = state / "last-review.tmp"
    temp.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.chmod(temp, 0o600)
    temp.replace(target)


if __name__ == "__main__":
    main()
