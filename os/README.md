# Lyriq AgentOS — imagem live experimental

O AgentOS é uma imagem Linux para PC `amd64`, criada com Debian 13 e `live-build`. A sessão gráfica é KDE Plasma 6 com tema escuro, papel de parede Lyriq, ícones vetoriais Lyriq para os aplicativos principais e um cliente de IA nativo em Qt. O Debian fornece kernel, drivers, pacotes e atualizações; a experiência visual e as ferramentas do AgentOS são personalizadas. Esta é uma versão de desenvolvimento, não uma instalação validada.

## Construir

Em um host Debian 13 `amd64`, com rede, privilégios de root e pelo menos 20 GB livres:

```sh
sudo apt update
sudo apt install live-build debootstrap squashfs-tools xorriso isolinux syslinux-common grub-efi-amd64-bin python3
sudo ./build.sh
sha256sum -c live-image-amd64.hybrid.iso.sha256
```

O script cria `live-image-amd64.hybrid.iso` e seu arquivo `.sha256`. O GitHub Actions também publica ambos como artefato. As versões dos pacotes seguem o repositório Debian do dia; um snapshot fixo ainda é necessário para reprodução bit a bit.

## Testar em VM

```sh
qemu-img create -f qcow2 agentos-test.qcow2 32G
qemu-system-x86_64 -enable-kvm -m 4096 -smp 2 \
  -drive if=virtio,file=agentos-test.qcow2,format=qcow2 \
  -cdrom live-image-amd64.hybrid.iso -boot d
```

Se não houver KVM, remova `-enable-kvm`; o boot por emulação será mais lento. `smoke-boot.sh` captura o desktop em uma VM BIOS descartável. Confira visualmente a captura. O instalador gráfico está presente, mas instalação e reinicialização pelo disco virtual **ainda não foram validadas**. Nunca use um disco físico para esse teste.

## Aplicativos e IA

O desktop inclui Dolphin, Konsole, Kate, Okular, Gwenview, KCalc, Ark, Spectacle, Plasma System Monitor, Discover, Firefox ESR, Elisa e Dragon Player. O painel `Lyriq Assistente` usa Qt. São aplicativos reais mantidos pelos seus projetos; o AgentOS fornece a integração e os ícones próprios para parte deles. Os demais ícones herdam Breeze. O botão de aplicativos usa o SVG oficial `Lyriq_AgentOS_Cubo.svg` fornecido pelo usuário.

O agente de texto pode buscar arquivos por nome apenas nas pastas autorizadas e apresentar prévia para abrir aplicativos permitidos. Não recebe uma ferramenta de shell. Configure `~/.config/agentos/agent.json`, por exemplo:

```json
{"allowed_roots":["/home/usuario/Documentos"],"endpoint":"http://127.0.0.1:11434/v1/chat/completions","model":"MODELO_INSTALADO"}
```

Para um provedor externo, configure um endpoint compatível e passe a credencial somente por `AGENTOS_API_KEY` no ambiente da sessão. O texto do pedido vai ao provedor. O teste transitório com Gemini 2.5 Flash encontrou dois arquivos em múltiplas etapas, recusou busca fora da pasta autorizada e devolveu prévia para abrir navegador e editor. O painel Qt foi aberto em uma VM BIOS usando uma ISO anterior; o botão de configurações e a abertura efetiva de aplicativos ainda precisam de teste funcional na ISO atual. Nenhuma credencial é distribuída na imagem ou no código.

## Estado verificado

No commit `7002a7b`, o [GitHub Actions 40781403825](https://github.com/lyriqtech-oss/agent-os/actions/runs/40781403825) gerou a ISO, conferiu o checksum e iniciou uma VM BIOS. SHA-256 da ISO: `4e05410221fb2aa63ef3dcb1916560f3def3131bcf70a762faad7761f86c5b30`. A captura mostra o papel de parede Lyriq cobrindo o desktop inteiro e o SVG oficial no botão inferior esquerdo. O presente commit acrescenta uma verificação de pacotes de rede, Bluetooth e horário durante o build; sua ISO precisa ser gerada e testada separadamente.

UEFI, instalação em disco virtual, Secure Boot, dual boot, criptografia, atualização com reversão e compatibilidade de hardware físico permanecem pendentes de validação. O boot UEFI anterior parou no menu GRUB e não constitui prova de suporte. O cliente de IA passou em seis testes locais; a GUI abriu em VM BIOS, mas a abertura de aplicativos na ISO não foi testada ponta a ponta. NetworkManager/Plasma-nm, BlueZ/Bluedevil e systemd-timesyncd estão incluídos e agora são exigidos pelo build. Wi-Fi e Bluetooth físicos, conectividade Ethernet dentro da VM e sincronização efetiva de relógio ainda exigem testes de execução.
