#!/usr/bin/env python3
"""Explicitly approved desktop actions; never execute model-provided shell text."""
import json
import subprocess
import sys


APPLICATIONS = {
    "browser": "firefox-esr",
    "editor": "org.kde.kate",
    "files": "org.kde.dolphin",
    "terminal": "org.kde.konsole",
}


def launch(app_ids, runner=subprocess.run):
    if not isinstance(app_ids, list) or not app_ids or len(app_ids) > 4:
        return {"ok": False, "error": "invalid_app_list"}
    if len(set(app_ids)) != len(app_ids) or any(app_id not in APPLICATIONS for app_id in app_ids):
        return {"ok": False, "error": "app_not_allowed"}
    results = []
    for app_id in app_ids:
        try:
            completed = runner(["gtk-launch", APPLICATIONS[app_id]], check=False, capture_output=True, text=True, timeout=15)
            results.append({"app": app_id, "launch_requested": completed.returncode == 0,
                            "error": completed.stderr.strip() if completed.returncode else None})
        except (OSError, subprocess.TimeoutExpired) as exc:
            results.append({"app": app_id, "launch_requested": False, "error": str(exc)})
    return {"ok": all(item["launch_requested"] for item in results), "results": results}


if __name__ == "__main__":
    print(json.dumps(launch(sys.argv[1:]), ensure_ascii=False))
