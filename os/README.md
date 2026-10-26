# Lyriq AgentOS — marco 1

Fonte inicial de uma ISO live Debian 13 (trixie), amd64, com sessão Xfce real. O instalador Debian Live é incluído para experimentação, mas a instalação Lyriq ainda requer validação em VM. Este repositório não contém uma ISO pronta.

## Construir

Em Debian 13 amd64, com rede e pelo menos 20 GB livres:

```sh
sudo apt update
sudo apt install live-build debootstrap squashfs-tools xorriso isolinux syslinux-common grub-efi-amd64-bin
sudo ./build.sh
```

O script gera a ISO híbrida e um arquivo `.sha256` somente após sucesso. Dependências e versões vêm do repositório Debian configurado no host; para bit a bit reproduzível, o próximo passo é fixar um snapshot Debian e versões dos pacotes.

## Testar em VM

```sh
qemu-img create -f qcow2 agentos-test.qcow2 32G
qemu-system-x86_64 -enable-kvm -m 4096 -smp 2 -drive if=virtio,file=agentos-test.qcow2,format=qcow2 -cdrom live-image-amd64.hybrid.iso -boot d
```

Para UEFI, adicione firmware OVMF e teste em VM descartável. No live, verifique login automático, painel, Thunar, navegador e rede. Rode o instalador gráfico **somente no disco virtual**, confirme a tela de particionamento, desligue, remova `-cdrom` e reinicie pelo disco. Registre resultado e capturas. Não grave a imagem em disco físico para testes.

## Estado

Configuração e script foram criados e revisados estaticamente. Build, boot, sessão e instalação ainda não foram executados. UEFI, Secure Boot, criptografia, dual boot, atualizações com reversão e IA não estão declarados como suportados.

