# DECISIONS_LOG.md — Denys Jackson Site

> Registro de decisões arquiteturais. Antes de refatorar qualquer padrão, ler este doc primeiro.

---

### DEC-006 — Pré-renderização do conteúdo do CMS
- **Data**: 2026-09-07
- **Decisão**: gerar HTML em `_site/` com Node nativo antes de publicar pelo GitHub Actions. Substitui a ausência de build da DEC-001; mantém os JSONs como fonte de verdade e JavaScript para idiomas e interações.
- **Motivo**: crawlers sem JavaScript recebiam placeholders em lugar do conteúdo publicado.
- **Operação**: configurar Settings > Pages > Source como GitHub Actions ao ativar este workflow. Cada commit do CMS gera novamente o site. O sitemap mantém a mesma URL.

### DEC-001 — Stack: HTML estático + Tailwind CDN
- **Data**: 2026-04-11
- **Decisão**: Site em HTML puro com Tailwind Play CDN, sem build step
- **Por quê**: GitHub Pages é hospedagem estática. Sem build = deploy simples (push e pronto). Tailwind CDN permite usar todas as classes sem configuração.
- **Consequências**: Tailwind compila no browser (pequeno overhead). Não é ideal para sites com tráfego altíssimo, mas perfeito para um site institucional/tributo.
- **Revisar quando**: Se o site precisar de performance extrema ou server-side rendering

### DEC-002 — CMS: Sveltia CMS (substituiu Decap CMS)
- **Data**: 2026-04-11 (atualizado 2026-04-12)
- **Decisão**: Usar Sveltia CMS com autenticação via Personal Access Token (PAT)
- **Por quê**: Decap CMS tinha problemas com OAuth proxy (404). Sveltia CMS é drop-in replacement, mais moderno, e suporta token auth sem servidor OAuth.
- **Consequências**: Usuário precisa gerar um PAT no GitHub e colar na tela de login. Token fica salvo no localStorage do browser.
- **Revisar quando**: Se GitHub liberar PKCE client-side (roadmap issue #1153), migrar para PKCE. Ou se precisar de login OAuth, usar Sveltia CMS Authenticator no Cloudflare Workers.

### DEC-003 — i18n: Sistema próprio em JS
- **Data**: 2026-04-11
- **Decisão**: Implementar tradução (PT/EN/ES) com sistema próprio usando data attributes
- **Por quê**: Leve, sem dependências, suficiente para o volume de texto. Traduções em um único arquivo JS.
- **Consequências**: Conteúdo dinâmico (JSON) precisa de campos separados por idioma (bio_pt, bio_en, bio_es)
- **Revisar quando**: Se o site crescer significativamente em páginas ou idiomas

### DEC-004 — Conteúdo: JSON files
- **Data**: 2026-04-11
- **Decisão**: Armazenar conteúdo em arquivos JSON em /content/
- **Por quê**: Compatível com Decap CMS, fácil de versionar, simples de consumir via fetch()
- **Consequências**: Sem busca/filtro no servidor. Tudo é client-side.
- **Revisar quando**: Se o volume de dados (shows, fotos) ficar muito grande (100+ itens)

### DEC-005 — Form: mailto fallback
- **Data**: 2026-04-11
- **Decisão**: Formulário de contato usa mailto: como solução inicial
- **Por quê**: GitHub Pages não suporta server-side. mailto é a solução mais simples sem dependências externas.
- **Consequências**: Depende do cliente de email do visitante. Não funciona se não tiver email configurado.
- **Revisar quando**: Substituir por Formspree ou similar quando quiser envio automático

### DEC-007 — Planejamento e sincronização separados da produção
- **Data**: 2026-10-29
- **Decisão**: registrar inventário, briefing e revisão editorial em `development/novo-site`; sincronizar a branch remota sem merge em main ou deploy.
- **Motivo**: o usuário exige desenvolvimento/homologação e autorização explícita antes de publicar o site oficial.
- **Limite**: esta decisão não isola por si só o CMS atual, cujos destinos de escrita ainda usam main; essa separação precisa ser implementada e validada antes de edição remota em homologação.
- **Fontes**: materiais profissionais 2026 do Drive e chat histórico, diferenciando correções do usuário de propostas antigas do assistente. Divergências de contato/equipe ficam pendentes.
- **Confirmações editoriais do usuário**: e-mail contato@denysjackson.com.br; prioridade da ficha técnica 2026 para equipe; referência tributoreidopop.com.br restrita à arquitetura/distribuição, mantendo cores e tipografia próprias.

### DEC-008 — Destino único e recusa de gravações fora do desenvolvimento
- **Data**: 2026-10-29
- **Decisão**: CMS YAML e painéis usam development/novo-site; script compartilhado recusa domínio oficial e mutações fetch GitHub fora dessa branch. API local exige a branch real por POST. Não há fallback para main ou upload GitHub quando o modo local falha.
- **Validação**: 27 testes, incluindo HTTP em checkout temporário, mais suíte estática e build.
- **Operação**: CI de desenvolvimento apenas testa e gera; deploy existente só roda jobs em main. Nada foi publicado.
- **Limite**: as proteções estão nesta versão de desenvolvimento. Login/edição reais, preview remoto e permissões GitHub ainda precisam de homologação; não substituir controles de acesso por guards do navegador.

### DEC-009 — Ambiente completo com ferramentas externas e CMS local verificado
- **Data**: 2026-10-29
- **Decisão**: preparar Decap Server 3.11.6, CMS 3.3.0 e Playwright Core 1.57.0 fora do checkout; iniciar site/API/CMS por `node scripts/develop.js`. Pacote CMS conferido com SHA-512 oficial do npm e bundle com SHA-256; nenhuma verificação TLS/integridade foi desabilitada.
- **Validação**: login local, edição e persistência após reload, upload e ajuste visual em Chromium, usando cópia descartável e bloqueio de rede externa. Conteúdo original preservado.
- **Operação**: fluxo sem token; sincronização em development/novo-site. Serviços reiniciam em cada máquina/tarefa; ver DESENVOLVIMENTO.md. Nenhum preview externo ou produção foi publicado.

### DEC-010 — Protótipo da Home separado da página existente
- **Data**: 2026-10-29
- **Decisão**: primeiro protótipo em `/prototipo/`, com paleta própria, Inter local licenciada e fotografias existentes otimizadas. Manter a página raiz até revisão; não criar páginas internas vazias.
- **Conteúdo**: JSON próprio PT/EN/ES editável no CMS; contatos reaproveitam site.json. Pré-renderização no build e aprimoramento progressivo. Escapar textos do CMS e validar URLs antes de renderizar.
- **Revisão**: screenshots e testes locais; nenhuma publicação oficial autorizada. Agenda sem anunciar data pendente; fotos/vídeo sujeitos à curadoria final.

## DEC-011 — Preservar o vidro original (2026-10-29)

O usuário rejeitou a primeira proposta visual por perder o vidro do site. A Home de desenvolvimento passa a reutilizar diretamente as classes de `css/style.css`, com fundo azul-cinza, Inter e superfícies claras translúcidas. A evolução será na arquitetura e no conteúdo, preservando a estética existente. Não houve publicação.
