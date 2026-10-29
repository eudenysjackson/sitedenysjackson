# ERRORS_LOG.md — Denys Jackson Site

> Memória de cura. Antes de resolver um bug, verificar se já foi resolvido aqui.

ERR-007 (2026-09-07): HTML inicial continha placeholders de foto, agenda e galeria; conteúdo só existia após fetch no navegador. Build estático passa a preencher essas seções com JSON do CMS e remove estados vazios quando há conteúdo. Agenda preserva HTML publicado enquanto a primeira requisição não conclui. Validação: `node scripts/test-static-build.js`.

| ID | Descrição | Causa Raiz | Solução | Prevenção |
|---|---|---|---|---|
| ERR-001 | CMS: "configuration error" ao acessar /admin/ | `auth_type: pkce` e `app_id` no config.yml — GitHub NÃO suporta PKCE client-side (nem Sveltia CMS implementou) | Removidas as linhas `auth_type: pkce` e `app_id`. Usando autenticação via Personal Access Token (PAT) | Antes de configurar auth, consultar docs oficiais do backend (sveltiacms.app/en/docs/backends/github) |
| ERR-003 | Imagens quebradas (?) após upload no CMS | Repo errado (`site` vs `sitedenysjackson`) + URLs com espaços/acentos sem encode | `mediaUrl()` com encode + repo corrigido + cache-buster em todas mídias CMS | Nomes de arquivo sem espaços; JPG/WebP nos tamanhos recomendados no config |
| ERR-004 | CMS local: "Unexpected Error" no Sveltia | Sveltia usa File System Access API (seletor de pasta) — falha em alguns browsers/ambientes | Localhost usa Decap CMS + decap-server (8081); online continua Sveltia | Rodar `iniciar-local.ps1`; no admin local clicar **Entrar** (não "Repositório Local") |
| ERR-005 | Site oficial mudou sem `git push` local | (1) CMS publicou direto no GitHub (`Update 📸 Galeria`); (2) `main.js` lia `raw.githubusercontent.com/main/` antes do deploy; (3) fallback de upload usava token GitHub no localhost | Removido `GITHUB_RAW`; upload local não usa GitHub; guard bloqueia Save/Publish se decap-server (8081) estiver offline; banner laranja no admin local | Local: sempre `iniciar-local.bat`; site oficial só muda após `git push`; revert no GitHub se publicou por engano |
| ERR-006 | Email alterado no CMS não aparece no site | `content/site.json` atualizado, mas email/telefone estavam hardcoded em `index.html` e `loadSiteConfig()` não os aplicava | HTML com `#contact-email` / `#contact-phone`; JS aplica email, phone e CNPJ do CMS | Campos de contato/exibição no HTML devem vir do CMS via IDs, não texto fixo |

ERR-008 (2026-10-29, identificado, não corrigido): auditoria confirmou evento passado com status `confirmado` em “Próximos Shows”, devido ao filtro data futura OU confirmado no render estático e navegador. Reprodução isolada em memória; nenhuma agenda real alterada. Planejamento em `docs/planejamento/auditoria-editorial.md`.

ERR-009 (2026-10-29, identificado, causa operacional pendente): HTML público retornado pelo domínio é idêntico ao `index.html` fonte de 27.504 bytes, em vez da saída pré-renderizada do build. Conferir origem/artefato do GitHub Pages antes da próxima publicação autorizada; nenhuma configuração de produção foi alterada.

ERR-010 (2026-10-29, corrigido na branch de desenvolvimento): CMS e painéis de homologação fixavam main, e upload do CMS remoto tentava localhost antes de GitHub. Destinos centralizados em admin/development.js, YAML validado antes do CMS, mutações fora da branch recusadas e upload separado por modo. API local recusa gravação em checkout errado. Validação: 27 testes de isolamento + testes estáticos/build. Não aplicado ao painel oficial antigo.

ERR-011 (2026-10-29, corrigido em desenvolvimento): aviso fixo do admin cobria o botão Publicar do CMS; checagem do proxy usava GET para endpoint POST; painel de ajustes não tinha caminho de salvamento local. Aviso movido para canto sem interceptar cliques, checagem alterada para ação info, e endpoint local com whitelist de JSONs e verificação de branch implementado. Homologação real no Chromium confirmou edição, upload e ajuste, em fixture descartável.

ERR-012 (2026-10-29, bloqueio externo): GitHub Actions não iniciou job da execução 40899393785. Anotação oficial: conta bloqueada por problema de cobrança. Não tratar como falha da suíte nem tentar corrigir código para contornar. Validação local completa passou; desenvolvimento e sincronização seguem disponíveis.

ERR-013 (2026-10-29, resolvido no protótipo): setas diagonais em Unicode apareciam como glifos ausentes em uma captura com a fonte Inter Latin. Substituídas por SVGs locais decorativos, preservando o texto acessível e sem carregar biblioteca de ícones. Revisão Chromium desktop/mobile concluída.
