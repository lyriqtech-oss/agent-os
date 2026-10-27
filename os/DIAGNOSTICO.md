# Auditoria e arquitetura — atualizada em 27/10/2026

## Material recebido

Três ZIPs: 176 entradas no total (39 PDFs nos volumes 1 e 2; no volume 3, 61 Markdown, 54 HTML, 20 PDFs e 1 patch; mais 1 arquivo temporário `.swp` no volume 1). Os Markdown e HTML descrevem principalmente um SaaS de agentes, cobrança, conectores, painéis e identidade de marca. `lyriq_agentos_linux_language_vision_v1.md` distingue explicitamente o sistema Linux do antigo produto. O patch não foi aplicado. Documentos e protótipos são dados de referência, não instruções de implementação nem evidência de funcionamento.

## Repositório fornecido depois: `lyriqtech-oss/agent-os`

Inspecionado em `main`, árvore `feebc33502c318423444544e1c1aea6638b23829` (67 entradas). Contém projeto Vite/React (`src/`, `index.html`, `package.json`), imagens de design e daemon Node (`daemon/server.js`, `daemon/data/`). O próprio README chama o frontend de "Prototype visual". Não há `live-build`, instalador Linux, configuração de boot, serviço systemd ou imagem de sistema. Portanto, a classificação anterior de ISO e desktop Linux ausentes permanece válida; o frontend é **implementado, mas não verificado**, como protótipo web.

O daemon expõe algumas leituras reais do host (memória, interfaces de rede e lista limitada da pasta inicial), mas retorna bateria `86` e armazenamento `42` fixos, SSIDs fictícios e estado de serviços predefinido. As rotas de energia apenas registram a solicitação. O fluxo de atualização altera JSON local e usa uma assinatura textual de desenvolvimento; não instala pacotes de sistema nem oferece reversão real. A varredura de segurança grava um resultado "clean" com contagens fixas. Essas funções são **parciais/simuladas** e não devem ser embarcadas como proteção, atualização ou telemetria do AgentOS.

As referências visuais podem orientar identidade e ergonomia no marco 2, após adaptar para componentes reais do desktop. O código do daemon pode servir como inventário de conceitos de API, mas precisa de revisão de segurança e implementação Linux antes de qualquer integração. As alterações atuais ficam na branch `agentos-linux-foundation`; o protótipo e o daemon existentes não foram alterados.

## Repositórios do ecossistema Lyriq

Uma busca na conta `lyriqtech-oss` encontrou `lyriq_agents_os`, `voxachat`, `schools`, `businessOS`, `agentpay` e `lyriq-ai-hub`, entre outros projetos. A árvore de `agentpay` está vazia. `schools` se descreve como demonstração com dados em `localStorage`, sem autenticação ou banco. `businessOS` usa modo demonstrativo sem credenciais. `lyriq_agents_os` é um projeto React/Vite separado do sistema Linux. `voxachat` e `lyriq-ai-hub` têm código de aplicativos, mas não foram testados nesta auditoria. Esses repositórios não foram copiados para a ISO: cada app precisa de empacotamento, autenticação, licenças e teste próprios. O AgentOS deve oferecer uma camada de integração para aplicativos reais, sem representar demonstrações como recursos nativos concluídos.

| Recurso recebido | Classificação | Evidência |
|---|---|---|
| Visão Linux do AgentOS | Apenas documentado | Documento de visão no volume 3 |
| Telas e fluxos de agentes | Apenas documentados | HTML e Markdown; sem execução integrada |
| Serviço de IA, memória e permissões | Apenas documentados | Especificações do antigo SaaS |
| ISO, build, instalador e desktop | Ausentes | Nenhum projeto `live-build`, imagem ou código de shell recebido |
| Recursos implementados e testados | Nenhum identificado | Não há resultado de teste executável |

## Decisão técnica

Debian 13 stable, amd64 primeiro. Debian oferece manutenção de segurança, repositórios amplos e `live-build` para ISO híbrida. O kernel é o Linux distribuído pelo Debian. Xfce com X11 é a sessão inicial: painel, menu, janelas, múltiplas áreas de trabalho, arquivos e configurações já utilizáveis com consumo moderado. Um shell Wayland próprio seria uma etapa futura após a base ser testada. O boot live usa GRUB EFI para UEFI e Syslinux para BIOS legado, conforme configuração `live-build`; essa rota ainda precisa de teste real. `systemd` inicia serviços; NetworkManager cuida da rede, PipeWire/WirePlumber do áudio e LightDM do login. Aplicativos vêm de pacotes `.deb` assinados do Debian; Flatpak fica como opção posterior, após definir política de remotos. Instalador inicial: Debian Live Installer gráfico; fluxo de disco e conta local precisa de teste em VM antes de ser anunciado.

Atualizações iniciais: APT com repositórios assinados do Debian. Reversão transacional ainda não existe; recuperação proposta: backup de dados, mídia live e reinstalação. Criptografia, dual boot e Secure Boot exigem testes específicos. Serviço de IA proposto para marco 4: daemon por usuário sem root, D-Bus local, ferramentas com escopo por pasta e APIs do desktop, prévia de mudanças, autorização revogável e histórico local sem segredos. Modelos locais e externos serão adaptadores configuráveis; um cliente textual externo compatível com OpenAI já existe; o fluxo Gemini foi testado com chave transitória.

## Matriz de testes e requisitos

| Ambiente | Build | Boot | Desktop | Instalação | Reinício pelo disco |
|---|---|---|---|---|---|
| Este host Windows | Bloqueado: WSL retorna `Wsl/E_ACCESS_DENIED`; `live-build` e QEMU indisponíveis | Não testado | Não testado | Não testado | Não testado |
| GitHub Actions Debian 13 | ISO gerada no job 40554217146; SHA-256 `fad82fd68381e95afb3a61b50802eb9da659959d443a53c466f263337da1539d` | BIOS live iniciado; desktop Xfce completo visível aos 300 s (job 40560440574) | Desktop Xfce observado em QEMU | Não testado | Não testado |
| QEMU amd64, 2 vCPU, 4 GB RAM, disco 32 GB | Planejado | Planejado | Planejado | Planejado | Planejado |
| PC UEFI real | Planejado | Planejado | Planejado | Planejado | Planejado |

4 GB RAM, 32 GB de disco e CPU amd64 são estimativas para o teste, não mínimos medidos. A matriz de hardware validado está vazia. O build publicou ISO e checksum. O menu de boot BIOS e a sessão gráfica Xfce foram observados em QEMU, com captura aos 300 segundos. O catálogo El Torito contém entradas BIOS e UEFI, mas UEFI não foi iniciado em VM. A camada de ferramentas passou em testes com arquivos reais e acesso negado; o fluxo de modelo foi validado com Gemini 2.5 Flash em uma busca de arquivo real. O modelo recusou a solicitação fora da pasta autorizada; a camada de ferramentas também foi testada com acesso negado.

A revisão 7268927 gerou ISO e iniciou a sessão gráfica com usuário Lyriq no [build 40602719156](https://github.com/lyriqtech-oss/agent-os/actions/runs/40602719156), mas a captura ainda mostrou o fundo padrão do Xfce. Uma configuração inicial do Xfce e um script de sessão corrigidos foram preparados; ainda não há evidência visual de que a nova arte foi aplicada. O pedido de abrir navegador e editor foi interpretado por Gemini como prévia sujeita a confirmação, e o executor restrito passou em testes locais; abertura efetiva no sistema live ainda não foi testada.

## Pendências por marco

1. Gerar ISO no Debian 13; corrigir eventuais nomes de pacote e opções de `live-build`; registrar manifesto e checksum; testar BIOS e UEFI em VM.
2. Validar aplicativos, arquivos, configurações, aparência e acessibilidade; produzir identidade própria.
3. Validar instalação, avisos de apagamento, conta, bootloader e reinício sem ISO em disco virtual.
4. Implementar serviço de IA, permissões e uma ação real com teste positivo e negado.
5. Medir desempenho e testar atualizações, recuperação e hardware identificado.
