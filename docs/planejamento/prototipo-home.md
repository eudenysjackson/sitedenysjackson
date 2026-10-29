> **Superado:** este documento descreve a primeira proposta e a recoloração posterior, ambas rejeitadas pelo usuário. A revisão atual, com sete páginas e componentes originais, está documentada em [releitura-historico.md](releitura-historico.md). Não usar os screenshots anteriores como revisão atual.

# Primeira Home — revisão em desenvolvimento

A Home foi implementada em `/prototipo/` para avaliação antes de substituir a página atual. O arquivo raiz `index.html` e os JSONs anteriores de conteúdo não foram alterados. Não houve publicação, merge em main, alteração de domínio ou uso do painel oficial.

## Composição

- Identificação textual de Denys Jackson e Na Ponta dos Pés, fotografia real do acervo e chamada principal para contratação.
- Trajetória 2015/2018/2019/2026 e formação complementar, conforme release e mídia kit.
- Apresentação do espetáculo: cerca de 90 minutos, classificação livre, 2–8 bailarinos conforme a montagem e performance com fonogramas/dublagem interpretativa.
- Montagem Bad em destaque, mantendo a possibilidade documentada de alternância com Dangerous.
- Registro de palco com link do mídia kit; o vídeo não é carregado automaticamente nem incorporado nesta etapa.
- Globo, Record e Multishow como imprensa/participações, com links adicionais para EBC, O Dia e Sou Méier; sem alegação de endosso.
- Links aos cinco documentos profissionais e à pasta de imprensa. Contato usa site.json, incluindo o e-mail .com.br confirmado.
- A agenda aponta para a seção existente; nenhuma data pendente de confirmação foi anunciada no protótipo.

A arquitetura desta etapa é uma navegação por seções para revisar a Home. As páginas internas independentes do mapa aprovado como proposta ainda não foram implementadas. Não foram criadas rotas vazias nem links para páginas inexistentes. O site de referência foi mantido apenas como referência de arquitetura/distribuição; sua inspeção externa segue limitada pelas respostas registradas na auditoria. A composição deriva do briefing e dos materiais próprios, sem copiar a identidade de terceiros.

## Identidade e conteúdo

A primeira composição escura foi rejeitada pelo usuário. A revisão reutiliza `css/style.css` do site original: fundo azul-cinza em degradê, painéis `.glass` brancos com opacidade 0,55, blur 16px, borda branca e raio de 20px. Cabeçalho translúcido com logo preta, textos grafite, botões índigo e Inter. Foram removidos o título gigante em caixa alta, o ponto decorativo, o arco da foto e os títulos com frases de efeito. Inter é servida localmente no protótipo, com sua licença OFL. Foram reutilizadas três fotos já otimizadas da galeria, sem modificar arquivos de imagem.

Os textos PT/EN/ES, imagens e links de materiais ficam em `content/home.json`. A coleção **Nova Home — desenvolvimento** foi adicionada ao CMS local. `site.json` permanece a fonte dos contatos. Textos vindos do CMS são escapados na renderização estática e no registro de traduções.

Esta é uma proposta visual/editorial para revisão. Seleção final de fotos, créditos, conteúdo audiovisual, serviço das próximas apresentações e páginas internas continuam no roteiro de desenvolvimento.

## Abrir e verificar

Com o servidor local de desenvolvimento iniciado, use o caminho `/prototipo/` na porta 8080 para revisar o conteúdo fonte com atualização por JSON. Para conferir a versão pré-renderizada sem JavaScript:

```bash
node scripts/build-static.js
```

A saída fica em `_site/prototipo/index.html`, servida no caminho `/_site/prototipo/`. Ela é um snapshot do build: após editar no CMS, gere o build novamente para atualizar essa saída e seus JSONs.

O protótipo usa `noindex, nofollow`, não entra no sitemap e não constitui um endereço público de homologação. O CMS e os serviços continuam protegidos conforme DESENVOLVIMENTO.md.

## Validação

```bash
node scripts/test-home-prototype.js
node scripts/test-static-build.js
node scripts/test-admin-isolation.js
node scripts/build-static.js
node scripts/test-home-browser.js
node scripts/test-development-browser.js
```

A suíte de navegador da Home usa porta temporária, não envia formulários e bloqueia tráfego externo. Verifica ausência de rolagem horizontal em 320/390/768/1440 px, carregamento da Inter e das fotos locais, PT/EN/ES com persistência, menu por teclado e conteúdo sem JavaScript. Imagens de revisão ficam em `test-results/home` no diretório externo de ferramentas.

O teste do CMS edita um campo da nova coleção em cópia temporária e compara todos os JSONs originais ao final. Nenhum certificado, exportação de chat ou arquivo bruto do Drive foi adicionado ao repositório.

Na primeira rodada, o Actions remoto estava bloqueado por cobrança. O retorno do suporte abaixo atualiza esse diagnóstico. Verificações locais e execuções remotas continuam sendo evidências distintas.

A rodada final local passou: conteúdo estático/escape, três idiomas, build, 27 testes de isolamento, navegador desktop/mobile e edição da nova coleção no CMS real. O commit deste protótipo usa `[skip ci]` para não repetir as notificações do Actions bloqueado por cobrança; isso não representa uma execução remota aprovada e não altera as definições de testes.

## Retorno do suporte — 29/10/2026

O suporte GitHub confirmou no tíquete #4925448 que não existem cobranças pendentes e que desbloqueou a conta após identificar uma falha antiga de autorização. A confirmação veio por e-mail fornecido pelo usuário; o documento privado não é incluído no repositório. Esta informação substitui o estado anterior de bloqueio, mas não comprova, por si só, execução bem-sucedida de um workflow. A revisão visual pode acionar apenas a validação de desenvolvimento; publicação continua dependendo de autorização.
