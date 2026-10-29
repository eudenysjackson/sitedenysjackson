# Retomada do desenvolvimento — 29/10/2026

## Estado informado pelo usuário

A revisão com sete páginas está **bem melhor, mas ainda não está boa**. Não há aprovação visual final nem autorização para publicar. O usuário pediu salvar o trabalho na nuvem para continuar depois em outra máquina. Parar neste ponto; não implementar novas mudanças visuais com base em suposições.

## Onde está o trabalho

- Repositório: eudenysjackson/sitedenysjackson.
- Branch de trabalho: `development/novo-site`. Nunca usar main para continuar esta revisão.
- Sete páginas em `prototipo/`, entrada `prototipo/index.html`.
- Pacote navegável: `docs/revisao/site-html.zip`; extrair todos os arquivos e abrir index.html. O pacote corresponde à revisão enviada ao usuário, não é publicação.
- História e critérios: `docs/planejamento/releitura-historico.md`, `brief-novo-site.md`, `auditoria-editorial.md` e `DESENVOLVIMENTO.md`.

## Direção que deve ser mantida

Reutilizar a estética e os componentes originais. As primeiras propostas que reinventavam a composição foram rejeitadas; não reaplicá-las. Preservar capa/foto originais, vidro claro, fundo azul-cinza, Inter, proporções e painéis originais. Separar Início, Denys Jackson, O espetáculo, Agenda, Na Mídia, Imprensa & Contratação e Contato. Não destacar números técnicos de elenco na Home. Release e sinopse devem poder ser lidos online; PDFs são apoio. Usar ballet nos textos novos. As correções visuais restantes ainda não foram especificadas pelo usuário.

## Como abrir em outra máquina

Com Git e Node 22 ou superior, obter o repositório na branch development/novo-site. Em checkout existente, verificar e preservar mudanças antes de atualizar. Ler AGENTS.md e DESENVOLVIMENTO.md.

```bash
node scripts/setup-development.js
node scripts/build-home-prototype.js --source
node scripts/build-static.js
node scripts/develop.js
```

Na mesma máquina, abrir localhost na porta 8080, caminho `/prototipo/index.html`. A cópia gerada fica em `/_site/prototipo/index.html`; CMS em `/admin/`. Não há endereço público de homologação provisionado. Os serviços precisam ser iniciados novamente; processos e caches locais não são preservados pelo Git. A preparação reinstala as ferramentas externas necessárias. O CSS de utilitários já está versionado, portanto abrir a revisão não exige reinstalar o compilador Tailwind.

Após editar pelo CMS, regenerar os HTMLs. A coleção chama-se Novo site — desenvolvimento; fotos continuam nas fontes CMS originais. A revisão não busca atualizações de texto por fetch.

## Validação já concluída

Testes locais e a execução remota 40936169498 passaram: isolamento do CMS, conteúdo estático, sete páginas, build, CMS real em cópia temporária e navegador em quatro larguras. O pacote HTML foi verificado com os sete arquivos navegáveis e recursos incorporados. Alterações posteriores precisam de nova validação adequada.

O bloqueio de cobrança foi removido pelo suporte GitHub no tíquete #4925448. Não reativar Copilot nem mexer em cobrança para desenvolver o site.

## Próximo passo

Retomar pela revisão que o usuário recebeu e recolher as correções específicas que ainda deseja. Não tratar “bem melhor” como aprovação da versão. Nenhum deploy, merge/push em main, mudança de domínio, Pages ou uso do painel oficial sem autorização explícita de publicação.

Não transportar chats privados, faturas, certificados ou o acervo bruto para o Git. As decisões necessárias à continuidade estão registradas nos documentos de planejamento; os materiais profissionais têm links de origem nesses documentos.
