# Isolamento do CMS em desenvolvimento

Implementado em 29/10/2026 na branch `development/novo-site`. Nenhum merge em main, deploy ou alteração em Pages/DNS faz parte desta etapa.

## Destinos e proteções

- `admin/config.yml` aponta o CMS para `development/novo-site`.
- `admin/development.js` centraliza repositório/branch para ajustes e uploads, bloqueia esta versão do admin no domínio oficial e subdomínios e valida o destino YAML antes de carregar o CMS.
- O mesmo script verifica chamadas `fetch` de mutação na API GitHub antes de enviá-las. Contents exige branch explícita de desenvolvimento; atualização/criação de refs só pode atingir essa branch. Rotas de escrita desconhecidas, outros repositórios, main, branch omitida e GraphQL são recusados. Objetos Git ainda não referenciados (blob/tree/commit) são permitidos, pois só uma ref de desenvolvimento pode ser atualizada. Não existe fallback para a branch padrão.
- Em localhost, toda gravação GitHub por esse caminho é bloqueada. Upload local usa somente a API local; falha não gera envio remoto. Upload remoto não tenta usar a API localhost do visitante.
- A API auxiliar local confere a branch real do checkout a cada POST. Checkout main, detached/sem branch, outro nome ou erro de leitura retornam 409 sem gravar arquivos. GETs de diagnóstico permanecem disponíveis.
- O painel de upload remoto informa “Salvar em homologação”, sem prometer publicação no site oficial.

Essas proteções pertencem à nova versão. O admin atualmente publicado não foi atualizado. Elas evitam gravações incorretas pelos caminhos implementados; não substituem permissões do GitHub nem impedem alguém com credenciais de usar outros clientes. Proteções de branch e aprovações no GitHub ainda não foram verificadas/configuradas.

## Continuidade em outra máquina

Cada tarefa já tem ambiente isolado; usar o checkout existente, sem criar worktree por padrão. Antes de iniciar:

```bash
git branch --show-current
git status --short
```

A branch deve ser `development/novo-site`; preservar mudanças locais antes de qualquer troca. Atualizar/sincronizar somente essa branch, nunca main para “testar”. Node nativo é suficiente para os testes e build:

```bash
node scripts/test-admin-isolation.js
node scripts/test-static-build.js
node scripts/build-static.js
```

Para desenvolvimento local, a partir da raiz e em terminais persistentes:

```bash
node scripts/serve-static.js
node scripts/local-api.js
```

A API usa porta 8082; `DJ_LOCAL_API_PORT` permite uma porta alternativa, principalmente para testes (0 escolhe porta livre). O site usa 8080. Fazer GET /api/health e verificar `{ "ok": true }`; nenhuma gravação real é necessária para testar prontidão. O CMS local completo ainda requer decap-server na porta 8081 conforme o fluxo existente; sua instalação/login não foi validada nesta etapa. Não instalar dependências no checkout sem avaliar PROJECT_RULES.md.

## Publicação e verificações remotas

`.github/workflows/development-checks.yml` executa testes de isolamento, testes do HTML e build em push para development/**, com permissão contents:read e sem deploy. `.github/workflows/pages.yml` só aceita jobs na ref main, inclusive quando selecionado por disparo manual; ele não foi executado nesta tarefa. Essas alterações estão na branch de desenvolvimento, não substituem o workflow que já está em main.

Não há URL remota de homologação provisionada nesta etapa. A branch sincronizada não é uma hospedagem. Quando houver preview separado, usar os arquivos da branch de desenvolvimento e verificar a versão carregada. Não hospedar esta versão do admin sob denysjackson.com.br ou seus subdomínios, que estão bloqueados pelo guard.

## Evidência e limites

- 27 testes passaram: domínios oficiais, configuração CMS errada, mutations main/default/refs, objetos Request, outro repositório, rotas desconhecidas, localhost sem fallback, chamadas reais dos helpers de ajuste/galeria, upload CMS e API local.
- A suíte faz chamadas HTTP reais somente a uma API com arquivos e checkout Git temporários. Não envia tokens nem acessa GitHub/produção. O fixture é removido após o teste.
- Testes estáticos e build passaram, com 16 fotos.
- Login e edição reais em Sveltia/Decap não foram exercitados; nenhuma credencial foi solicitada ou usada. A integração real em navegador ainda precisa ser homologada. Se uma nova versão do CMS usar uma rota bloqueada, o salvamento será recusado; investigar a rota e testar antes de ampliar a permissão. Não remover a proteção nem criar fallback para main.
- Não afirmar que o painel oficial antigo está protegido por este código até uma publicação autorizada. Não publicar este admin de desenvolvimento como painel de produção: ele recusa o domínio oficial por projeto.


## Atualização: ambiente local homologado

A preparação foi completada após esta primeira etapa: consulte `../../DESENVOLVIMENTO.md`. O CMS local agora carrega um bundle oficial verificado do servidor, e `node scripts/develop.js` supervisiona os três serviços. A validação real em Chromium confirmou login, edição persistente após reload, upload e salvamento do painel visual em cópia temporária. Nenhum arquivo de conteúdo original foi alterado. O painel visual local usa `/api/content`, limitado aos quatro JSONs permitidos e à branch correta. As limitações anteriores de login/edição locais foram resolvidas; Sveltia remoto e hospedagem pública separada não foram provisionados/validados.
