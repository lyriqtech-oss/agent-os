# Lyriq AgentOS — marco 1

Fonte inicial de uma ISO live Debian 13 (trixie), amd64, com sessão Xfce. O instalador Debian Live é incluído para experimentação, mas a instalação Lyriq ainda requer validação em VM. A ISO gerada está disponível como artefato do GitHub Actions; não está versionada no repositório.

## Construir

Em Debian 13 amd64, com rede e pelo menos 20 GB livres:

```sh
sudo apt update
sudo apt install live-build debootstrap squashfs-tools xorriso isolinux syslinux-common grub-efi-amd64-bin
sudo ./build.sh
```

O script gera a ISO híbrida e um arquivo `.sha256` somente após sucesso. Dependências e versões vêm do repositório Debian configurado no host; para bit a bit reproduzível, o próximo passo é fixar um snapshot Debian e versões dos pacotes.

O serviço experimental `agentos-tools` é incluído, mas não é ativado automaticamente. Cada usuário deve criar `~/.config/agentos/tools.json`, por exemplo `{"allowed_roots":["/home/usuario/Documentos"]}`, e então executar `systemctl --user enable --now agentos-tools.service`. Ele oferece `list` e `find` por socket Unix em `$XDG_RUNTIME_DIR/agentos-tools.sock`; não executa comandos nem acessa pastas fora da lista. Ainda não há interpretação por modelo de IA.

O cliente experimental `agentos_agent.py` acrescenta interpretação por um modelo compatível com a API de chat com ferramentas. Configure `~/.config/agentos/agent.json` com `{"allowed_roots":["/home/usuario/Documentos"],"endpoint":"http://127.0.0.1:11434/v1/chat/completions","model":"MODELO_INSTALADO"}` e execute `python3 /usr/local/lib/agentos/agentos_agent.py 'Encontre meu relatório'`. É preciso instalar e verificar separadamente um modelo que suporte chamadas de ferramenta. Para um provedor HTTPS externo, o texto do pedido será enviado a ele; a credencial opcional vem de `AGENTOS_API_KEY`, sem persistência no AgentOS. O cliente só disponibiliza busca por nome e não executa comandos ou alterações. O fluxo foi testado com Gemini 2.5 Flash em uma busca real: o modelo chamou `find_files`, recebeu o resultado verificado e retornou o caminho do arquivo. Em tentativa de buscar fora da pasta permitida, o modelo recusou; os testes de ferramenta também comprovam que o serviço bloqueia o acesso. A chave usada no teste não é armazenada na imagem nem no repositório.

O menu de aplicativos inclui um painel GTK de texto para esse cliente. Sem um modelo configurado, ele mostra um erro real de configuração. O painel e seu cancelamento ainda requerem teste dentro de uma sessão gráfica da ISO.

## Testar em VM

```sh
qemu-img create -f qcow2 agentos-test.qcow2 32G
qemu-system-x86_64 -enable-kvm -m 4096 -smp 2 -drive if=virtio,file=agentos-test.qcow2,format=qcow2 -cdrom live-image-amd64.hybrid.iso -boot d
```

Para UEFI, adicione firmware OVMF e teste em VM descartável. No live, verifique login automático, painel, Thunar, navegador e rede. Rode o instalador gráfico **somente no disco virtual**, confirme a tela de particionamento, desligue, remova `-cdrom` e reinicie pelo disco. Registre resultado e capturas. Não grave a imagem em disco físico para testes.

`smoke-boot.sh` inicia uma VM BIOS descartável, seleciona a entrada live e captura a tela após 300 segundos. A captura deve ser inspecionada antes de afirmar que o desktop iniciou; ela não valida instalação nem UEFI.

## Estado

O build da revisão `b8ca66a` concluiu em GitHub Actions e publicou a ISO como artefato do [job 40554217146](https://github.com/lyriqtech-oss/agent-os/actions/runs/40554217146). SHA-256 da ISO: `fad82fd68381e95afb3a61b50802eb9da659959d443a53c466f263337da1539d`. O job verificou o checksum e a presença de kernel, initrd e sistema de arquivos live. Boot BIOS e sessão Xfce foram observados em QEMU, com painel, ícones e dock, no [teste 40560440574](https://github.com/lyriqtech-oss/agent-os/actions/runs/40560440574). Instalação ainda não foi executada. UEFI, Secure Boot, criptografia, dual boot e atualizações com reversão não estão declarados como suportados. A IA textual passou em teste com modelo Gemini real e arquivos de teste; a interface GTK ainda precisa de teste na sessão live.

O papel de parede original ssets/agentos-horizon-v1.png é incluído na imagem e aplicado na sessão Xfce via autostart. A aplicação visual será verificada no próximo boot da ISO.
