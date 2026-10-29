# ARCHITECTURE_MAP.md - Denys Jackson Site

## Sitemap e descoberta

- `scripts/build-static.js`: gera `_site/` com biografia, foto, galeria, agenda, tributo, vídeos, logos e contato no HTML inicial; usa apenas Node nativo e os JSONs do CMS.
- `scripts/test-static-build.js`: verifica conteúdo sem JavaScript, edição do CMS, estados vazios e escape de texto.
- `.github/workflows/pages.yml`: testa, gera e publica o artefato em cada push na main (inclusive commits do CMS). Exige Pages com Source = GitHub Actions.
- `.gitignore`: exclui `_site/`, saída gerada localmente.

- `/sitemap.xml`: lista a pagina publica principal; atualizar quando forem criadas novas paginas. Ancoras nao sao paginas separadas.
- `/robots.txt`: permite rastreamento e informa a URL do sitemap.

> Última atualização: 2026-04-11

## Membros (UI Components)

| Componente | O que faz | Onde aparece |
|---|---|---|
| Navbar | Navegação fixa com logo (imagens), links, i18n switcher, menu mobile. Logo branca no hero, logo preta ao rolar. | Todas as páginas (topo) |
| Hero | Seção de abertura com título, CTA, background | index.html #home |
| Social Proof | Grid de logos de mídia (Globo, Multishow, etc.) | index.html #social-proof |
| About Section | Bio, foto, cards Missão/Objetivo/Comunidade | index.html #sobre |
| Tribute Section | Cards de features do show | index.html #tributo |
| Agenda Section | Lista de shows (carregada do JSON) | index.html #agenda |
| Media Section | Tabs Fotos/Vídeos, grid de galeria, vídeos embed | index.html #midias |
| Lightbox | Modal fullscreen para fotos | index.html (overlay) |
| Contact Section | Formulário + info de contato + redes sociais | index.html #contato |
| Footer | Links, copyright, logo | index.html (rodapé) |
| Back to Top | Botão flutuante para voltar ao topo | index.html (fixo) |

## Neurônios (Helpers)

| Nome | Função | Quem usa |
|---|---|---|
| `escapeHTML()` | Sanitiza strings para prevenir XSS | renderShows, loadGallery, loadVideos |
| `fetchJSON(url)` | Busca e parseia JSON com tratamento de erro | Todos os loaders de conteúdo |
| `t(key)` | Retorna tradução para o idioma atual | Qualquer lugar que precise de texto traduzido |

## Reflexos (Hooks/State)

| Nome | Estado | Uso |
|---|---|---|
| `currentLang` | Idioma ativo (pt/en/es) | i18n.js — controla traduções |
| `showsData` | Array de shows carregados | main.js — renderShows() |
| `localStorage.dj_lang` | Idioma salvo do usuário | i18n.js — persistência |

## DNA (Data Schemas)

### site.json
```json
{ "site_name": "string", "tagline": "string", "email": "string",
  "phone": "string", "cnpj": "string", "hero_image": "string",
  "social": { "instagram": "url", "facebook": "url", "youtube": "url",
              "tiktok": "url", "threads": "url", "sandwiche": "url" } }
```

### shows.json
```json
{ "shows": [{ "date": "YYYY-MM-DD", "time": "HH:MM", "venue": "string",
              "city": "string", "ticket_url": "url", "status": "confirmado|esgotado|cancelado" }] }
```

### gallery.json
```json
{ "photos": [{ "image": "path", "caption": "string" }] }
```

### videos.json
```json
{ "videos": [{ "title": "string", "youtube_id": "string", "description": "string" }] }
```

### about.json
```json
{ "main_photo": "path", "bio_pt": "text", "bio_en": "text", "bio_es": "text",
  "mission_pt": "text", "mission_en": "text", "mission_es": "text",
  "objective_pt": "text", "objective_en": "text", "objective_es": "text",
  "community_pt": "text", "community_en": "text", "community_es": "text" }
```

## Caminhos (Routing)

| Rota | Componente | URL |
|---|---|---|
| / | index.html (SPA com âncoras) | denysjackson.com.br |
| /admin/ | Decap CMS | denysjackson.com.br/admin/ |
| /#home | Hero section | âncora |
| /#sobre | About section | âncora |
| /#agenda | Schedule section | âncora |
| /#midias | Media section | âncora |
| /#contato | Contact section | âncora |

## Órgãos (Services)

| Serviço | Conexão | Uso |
|---|---|---|
| Google Fonts CDN | fonts.googleapis.com | Fonte Inter |
| Tailwind CDN | cdn.tailwindcss.com | Framework CSS |
| Font Awesome CDN | cdnjs.cloudflare.com | Ícones |
| Decap CMS CDN | unpkg.com/decap-cms | Painel admin |
| YouTube embed | youtube.com/embed/ | Vídeos |
| GitHub API | Via Decap CMS | Salvar conteúdo |

## Mapa de Conexões

```
[Usuário] → index.html → JS (main.js + i18n.js)
                            ├── fetch → content/*.json → Render HTML
                            └── i18n → translations → Update DOM

[Admin]  → admin/index.html → Decap CMS
                                ├── GitHub API → content/*.json (CRUD)
                                └── GitHub API → images/uploads/ (upload)
```

## Changelog de Integridade

| Data | Alteração |
|---|---|
| 2026-04-11 | Criação inicial do projeto: index.html, css/style.css, js/main.js, js/i18n.js, content/*.json, admin/ |


## Planejamento do novo site (homologação, 2026-10-29)

- `docs/planejamento/brief-novo-site.md`: fontes, regras de operação, mapa de páginas, roteiro da Home e sequência de homologação.
- `docs/planejamento/auditoria-editorial.md`: comparação entre site e material profissional 2026, evidências e divergências pendentes.
- `docs/planejamento/inventario-imprensa.csv`: inventário das 51 entradas da pasta profissional, links e grau de inspeção.
- `docs/planejamento/selecao-midias.md`: fotografias candidatas, vídeos identificados e fontes de imprensa para revisão.

Esses documentos não alteram a aplicação nem autorizam deploy. O CMS continua apontando para main e precisa ser isolado antes de uso em homologação remota. O build público atual copia uma lista explícita de ativos; não inclui `docs/`.
- `AGENTS.md`: regras persistentes de desenvolvimento, sincronização e autorização de publicação, incluindo isolamento do CMS.

## Isolamento do CMS em desenvolvimento (2026-10-29)

- `admin/development.js`: configuração compartilhada de branch e proteção de mutações GitHub do CMS/painéis; bloqueia domínio oficial nesta versão de desenvolvimento.
- `admin/index.html`: valida destino antes de carregar o CMS; `config.yml`, ajustes e galeria usam development/novo-site.
- `scripts/local-api.js`: recusa POST se o checkout não estiver na branch de desenvolvimento; porta padrão 8082, alternativa via DJ_LOCAL_API_PORT.
- `scripts/test-admin-isolation.js`: testes de fronteiras com chamadas simuladas e API HTTP em checkout temporário; sem gravações em produção.
- `.github/workflows/development-checks.yml`: testes/build de desenvolvimento sem deploy. `pages.yml` exige ref main nos jobs.
- `docs/planejamento/homologacao-cms.md`: operação, evidências e limites; não há preview remoto nem autenticação CMS real validada nesta etapa.

## Ambiente de desenvolvimento completo (2026-10-29)

- `DESENVOLVIMENTO.md`: entrada principal para preparar, iniciar, testar e sincronizar sem publicar.
- `scripts/development-tools.js`: local externo das ferramentas, verificação do bundle CMS e exigência de branch.
- `scripts/setup-development.js`: versões fixas do servidor CMS/testador e extração do bundle oficial com verificação SHA-512/SHA-256, fora do checkout.
- `scripts/develop.js`: supervisor de site/API/CMS com prontidão, recusa de portas ocupadas e limpeza dos próprios processos.
- `scripts/test-development-browser.js`: rodada real no Chromium em cópia temporária; testa edição persistente, upload e ajuste visual, sem rede externa nem alteração dos dados originais.
- `scripts/serve-static.js`: entrega `/admin/cms-local.js` a partir do cache verificado; porta configurável via DJ_SITE_PORT.
- `scripts/local-api.js`: `/api/content` salva apenas site/gallery/social_proof/shows JSON na branch de desenvolvimento; painel visual usa esse caminho local.
- `.github/workflows/development-checks.yml`: inclui preparação e homologação em navegador, sem deploy.

## Primeira Home em desenvolvimento (2026-10-29)

- `prototipo/index.html`: proposta de Home separada, com conteúdo PT inicial, navegação sem rotas vazias e noindex.
- `content/home.json`: textos PT/EN/ES, três imagens e cinco links profissionais; editável na coleção Nova Home — desenvolvimento.
- `css/home.css`: composição responsiva usando a paleta própria; `css/fonts/inter-latin.woff2`, `OFL.txt` e `README.md`: Inter local e licença.
- `js/home.js`: aprimoramento progressivo, menu com teclado, imagens/materiais/contato do CMS; `js/i18n.js` registra traduções de página com escape.
- `scripts/build-home-prototype.js`: pré-renderiza conteúdo e valida fontes/links; chamado pelo build estático para gerar `_site/prototipo/`.
- `scripts/test-home-prototype.js`: edição CMS, escape, links, três idiomas e repetibilidade. `scripts/test-home-browser.js`: layout em quatro larguras, fotos/fonte, idiomas, teclado, no-JS e screenshots.
- `scripts/test-development-browser.js`: inclui edição real da nova coleção em fixture. `docs/planejamento/prototipo-home.md`: escopo e instruções de revisão.

## Revisão visual da Home (2026-10-29)

- `prototipo/index.html` carrega `css/style.css` antes de `css/home.css` e reutiliza as classes de vidro originais, sem alterar a página raiz ou seu CSS compartilhado.
- `css/home.css` cuida do layout e da navegação da proposta clara. `content/home.json` usa títulos diretos em PT/EN/ES.
- `scripts/test-home-browser.js` confere também transparência, blur e raio do vidro original, logo preta e screenshot da seção Sobre.

## Revisão com páginas separadas e componentes originais (2026-10-29)

A composição anterior foi rejeitada; ver `docs/planejamento/releitura-historico.md`.

- `scripts/build-home-prototype.js`: monta sete páginas de revisão usando navegação, biografia e rodapé originais, CMS JSON e textos filtrados por público. `--source` atualiza `prototipo/`; build normal gera `_site/prototipo/`.
- `prototipo/{index,denys-jackson,na-ponta-dos-pes,agenda,na-midia,imprensa-contratacao,contato}.html`: documentos navegáveis, noindex; imprensa inclui release/sinopse HTML.
- `css/home.css`: somente adaptações para navegação entre páginas, acessibilidade, Inter local e galeria; `css/style.css` original permanece intacto.
- `css/review-utilities.css`: utilitários do original compilados com Tailwind 3.4.17; `scripts/review-tailwind.config.js` e `scripts/review-utilities.css`: configuração/entrada reproduzível, sem dependência npm na aplicação.
- `js/home.js`: idiomas a partir de JSON incorporado, menu acessível, navegação e ampliação da galeria. Sem fetch de CMS nem gravação remota.
- `content/home.json`: textos compartilhados e links profissionais; fotos vêm das fontes CMS originais. A coleção mantém o identificador home_prototype e passa a se chamar Novo site — desenvolvimento.
- `scripts/test-home-prototype.js` / `scripts/test-home-browser.js`: sete páginas, distribuição editorial, geometria original, links, três idiomas, quatro larguras, teclado e no-JS.

- `scripts/export-review.js`: exporta sete HTMLs autossuficientes para uma pasta externa de revisão; incorpora assets locais e mantém navegação por arquivos irmãos. O ZIP é artefato de entrega externo, sem deploy e sem dados privados.

## Download da revisão (2026-10-29)

- `docs/revisao/site-html.zip`: pacote das sete páginas HTML autossuficientes, com licença da fonte e instruções de abertura. Disponível na branch de desenvolvimento para download direto pelo GitHub. É snapshot para revisão; não é o site oficial nem é copiado pelo build público. Regenerar com scripts/export-review.js após uma nova versão visual.

## Ponto de retomada (2026-10-29)

- `RETOMADA.md`: estado visual ainda não aprovado, revisão entregue, branch, instruções para outra máquina, testes já concluídos e próximo passo. O usuário pediu salvar e pausar; não há autorização de publicação.
