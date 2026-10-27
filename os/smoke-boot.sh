#!/bin/sh
# BIOS live-boot evidence in a disposable QEMU virtual machine.
set -eu
cd "$(dirname "$0")"
iso=${1:-live-image-amd64.hybrid.iso}
test -f "$iso"
qemu-img create -f qcow2 agentos-smoke.qcow2 16G
accel=tcg
if [ -r /dev/kvm ]; then accel=kvm; fi
(
  sleep 8
  printf 'sendkey ret\n'
  sleep 300
  printf 'screendump agentos-boot.ppm\n'
  sleep 2
  printf 'quit\n'
) | timeout 360 qemu-system-x86_64 \
  -machine "accel=$accel" -m 3072 -smp 2 \
  -drive "file=agentos-smoke.qcow2,format=qcow2,if=virtio" \
  -cdrom "$iso" -boot d -vga std -display none \
  -monitor stdio -serial file:agentos-boot-serial.log
test -s agentos-boot.ppm
echo 'Boot screenshot captured; inspect it before declaring boot successful.'
