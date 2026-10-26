#!/bin/sh
set -eu
if [ "$(id -u)" -ne 0 ]; then echo 'Execute como root em Debian 13.' >&2; exit 1; fi
for command in lb sha256sum; do command -v "$command" >/dev/null || { echo "Falta: $command" >&2; exit 1; }; done
cd "$(dirname "$0")"
lb config
lb build
iso=$(find . -maxdepth 1 -name '*.iso' -type f -print -quit)
[ -n "$iso" ] || { echo 'Build terminou sem ISO.' >&2; exit 1; }
sha256sum "$iso" > "$iso.sha256"
printf 'ISO: %s\nChecksum: %s.sha256\n' "$iso" "$iso"

