#!/bin/sh
set -eu
if [ "$(id -u)" -ne 0 ]; then echo 'Execute como root em Debian 13.' >&2; exit 1; fi
for command in lb sha256sum; do command -v "$command" >/dev/null || { echo "Falta: $command" >&2; exit 1; }; done
cd "$(dirname "$0")"
mkdir -p config/includes.chroot/usr/local/lib/agentos config/includes.chroot/usr/lib/systemd/user config/includes.chroot/usr/share/applications
mkdir -p config/includes.chroot/usr/share/backgrounds/lyriq config/includes.chroot/etc/xdg/autostart config/includes.chroot/usr/local/bin
cp agentos-tools/agentos_tools.py config/includes.chroot/usr/local/lib/agentos/agentos_tools.py
cp agentos-tools/agentos_agent.py config/includes.chroot/usr/local/lib/agentos/agentos_agent.py
cp agentos-tools/agentos_panel.py config/includes.chroot/usr/local/lib/agentos/agentos_panel.py
cp agentos-tools/agentos-tools.service config/includes.chroot/usr/lib/systemd/user/agentos-tools.service
cp agentos-tools/lyriq-agentos-assistant.desktop config/includes.chroot/usr/share/applications/lyriq-agentos-assistant.desktop
cp assets/agentos-horizon-v1.png config/includes.chroot/usr/share/backgrounds/lyriq/agentos-horizon-v1.png
cp desktop/agentos-wallpaper.desktop config/includes.chroot/etc/xdg/autostart/agentos-wallpaper.desktop
cp desktop/agentos-set-wallpaper config/includes.chroot/usr/local/bin/agentos-set-wallpaper
chmod 755 config/includes.chroot/usr/local/bin/agentos-set-wallpaper
sh auto/config
lb build
iso=$(find . -maxdepth 1 -name '*.iso' -type f -print -quit)
[ -n "$iso" ] || { echo 'Build terminou sem ISO.' >&2; exit 1; }
sha256sum "$iso" > "$iso.sha256"
printf 'ISO: %s\nChecksum: %s.sha256\n' "$iso" "$iso"
