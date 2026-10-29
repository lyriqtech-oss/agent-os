#!/usr/bin/env python3
"""Small per-user AgentOS tool service. No shell execution or root access."""
import json
import os
import socket
import stat
from collections import deque
from pathlib import Path


def authorized(path, roots):
    target = Path(path).expanduser().resolve(strict=False)
    return any(target == root or root in target.parents for root in roots)


def handle(request, roots):
    action = request.get("action")
    if action not in {"list", "find"}:
        return {"ok": False, "error": "unsupported_action"}
    path = Path(request.get("path", "")).expanduser().resolve(strict=False)
    if not authorized(path, roots):
        return {"ok": False, "error": "permission_denied"}
    if not path.is_dir():
        return {"ok": False, "error": "not_a_directory"}
    limit = min(max(int(request.get("limit", 100)), 1), 500)
    name = str(request.get("name", "")).casefold()
    entries = []
    visited = 0
    truncated = False
    try:
        queue = deque([(path, 0)])
        while queue:
            directory, depth = queue.popleft()
            for item in directory.iterdir():
                visited += 1
                if visited > 5000:
                    truncated = True
                    queue.clear()
                    break
                # Never traverse symlinks, even when their target is authorized.
                if item.is_symlink() or not authorized(item, roots):
                    continue
                info = item.stat()
                is_dir = stat.S_ISDIR(info.st_mode)
                if action == "find" and is_dir and depth < 4:
                    queue.append((item, depth + 1))
                if action == "find" and name not in item.name.casefold():
                    continue
                entries.append({"name": item.name, "path": str(item),
                                "type": "directory" if is_dir else "file",
                                "size": info.st_size, "modified": int(info.st_mtime)})
                if len(entries) >= limit:
                    truncated = bool(queue) or visited >= limit
                    queue.clear()
                    break
    except OSError as exc:
        return {"ok": False, "error": "filesystem_error", "detail": str(exc)}
    return {"ok": True, "entries": entries, "count": len(entries), "truncated": truncated}


def main():
    runtime = Path(os.environ.get("XDG_RUNTIME_DIR", f"/run/user/{os.getuid()}"))
    config = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "agentos" / "tools.json"
    if not config.is_file():
        raise SystemExit(f"Configure allowed_roots in {config} before starting")
    roots = [Path(p).expanduser().resolve(strict=True) for p in json.loads(config.read_text())["allowed_roots"]]
    if not roots:
        raise SystemExit("At least one allowed root is required")
    sockpath = runtime / "agentos-tools.sock"
    if sockpath.exists():
        sockpath.unlink()
    with socket.socket(socket.AF_UNIX) as server:
        server.bind(str(sockpath))
        os.chmod(sockpath, 0o600)
        server.listen(8)
        try:
            while True:
                conn, _ = server.accept()
                with conn:
                    data = conn.recv(65536)
                    try:
                        result = handle(json.loads(data), roots)
                    except (ValueError, TypeError, KeyError):
                        result = {"ok": False, "error": "invalid_request"}
                    conn.sendall(json.dumps(result).encode() + b"\n")
        finally:
            sockpath.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
