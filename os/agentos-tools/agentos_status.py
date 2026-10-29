#!/usr/bin/env python3
"""Read live connectivity state through fixed, unprivileged system interfaces."""
import json
import subprocess


COMMANDS = {
    "network": ["nmcli", "-t", "-f", "DEVICE,TYPE,STATE,CONNECTION", "device", "status"],
    "bluetooth": ["bluetoothctl", "show"],
    "clock": ["timedatectl", "show", "--property=Timezone,NTPSynchronized,NTP,LocalRTC", "--no-pager"],
}


def status(runner=subprocess.run):
    result = {}
    for name, argv in COMMANDS.items():
        try:
            completed = runner(argv, capture_output=True, text=True, timeout=5, check=False)
            result[name] = {"available": completed.returncode == 0,
                            "output": completed.stdout.strip() if completed.returncode == 0 else "",
                            "error": completed.stderr.strip()[:300] if completed.returncode else ""}
        except (OSError, subprocess.TimeoutExpired) as exc:
            result[name] = {"available": False, "output": "", "error": str(exc)[:300]}
    return result


if __name__ == "__main__":
    print(json.dumps(status(), ensure_ascii=False))
