# Inventário e comparação editorial — 29/10/2026

## Cobertura real

Foram catalogadas 2.408 entradas nas listagens públicas de 127 pastas, incluindo pastas e arquivos, sem baixar o acervo bruto. Treze pastas do acervo retornam exatamente 50 itens: a listagem pública pode representar apenas uma página; não há garantia de inventário integral do acervo. O catálogo amplo permanece no workspace, fora do Git.

A pasta profissional retornou 51 entradas: duas subpastas, seis PDFs, uma imagem “Leia primeiro”, 36 fotos (34 JPEG e dois CR2) e seis vídeos MOV. O CSV registra todas essas entradas, links, data de modificação e grau de inspeção. A data de modificação é metadata do Drive; não prova versão editorial nem aprovação.

Foram lidos integralmente os textos dos seis PDFs e inspecionados o guia inicial, páginas selecionadas do kit e miniaturas dos 34 JPEGs. PDFs escaneados em outras pastas não foram procurados por OCR em massa. Os seis MOV foram listados, não assistidos. Os RAW não foram abertos. Os sete certificados ligados ao kit foram lidos localmente; seus originais e dados pessoais não são copiados para o repositório.

## Fontes profissionais principais

| Documento | Páginas | Uso no site | Link |
|---|---:|---|---|
| Release artístico 2026 | 1 | Resumo, trajetória, apresentação para imprensa | [Release](https://drive.google.com/file/d/12s-EB2Ebq8UPh2hMpgZSWdgsLXpKbJT2/view) |
| Mídia Kit 2026 | 9 | Linha do tempo, formação, formatos, montagem, imprensa | [Mídia kit](https://drive.google.com/file/d/1AtByZEfUu7iLB3RwfpdvW74_4BgLxElW/view) |
| Sinopse 2026 | 1 | Página do espetáculo e ficha de apresentação | [Sinopse](https://drive.google.com/file/d/1TwG1evkEzEm4G8NLfuLtN8GfC9-SJfeD/view) |
| Ficha técnica e elenco 2026 | 1 | Créditos, produção e equipe variável | [Ficha técnica](https://drive.google.com/file/d/1rZC9AQk5F2yxurMFr08a0A1JPT5t4FfL/view) |
| Rider técnico 2026 | 4 | Download de produção e informações técnicas contextualizadas | [Rider](https://drive.google.com/file/d/1VCsT6gTsZ3wt3yMBIlSJpXcPNIEdYzcf/view) |
| Projeto pedagógico / SALIC 573382 | 2 | Contexto de ação formativa proposta; não tratar como programação confirmada | [Projeto pedagógico](https://drive.google.com/file/d/19KDvrdfqG71AaT7lpXxGcq6NckPczjOO/view) |

O mídia kit tem 71.087.912 bytes (cerca de 67,8 MiB). Para download no site, preparar futuramente versão otimizada e informar tamanho; não substituir o original do Drive nesta etapa.

## Matriz de atualização

| Tema | Site/repositório atual | Material 2026 | Encaminhamento |
|---|---|---|---|
| Apresentação da capa | H1 vazio, campos e botões desativados | Identificação clara de artista/espetáculo | Criar H1 e CTAs em HTML |
| Artista/produtor | Biografia longa e genérica em alguns trechos | Trajetória datada e formação cultural | Organizar biografia própria e linha do tempo |
| Formação | Texto genérico sobre estudos | 464h declaradas; soma confere nos sete certificados | Usar resumo de formação complementar, sem equiparar a diploma |
| Espetáculo | Cards centrados em Dangerous | Bad como montagem 2026; alternância Bad/Dangerous | Atualizar destaque e preservar histórico contextualizado |
| Formato | Não explica de modo direto todos os dados de contratação | 90 min, livre, fonogramas e dublagem interpretativa | Adicionar ficha clara na página do espetáculo |
| Vídeos | Dois vídeos Dangerous | Seis MOV Bad e quatro links Instagram na p. 5 do kit | Selecionar conteúdo atual; decidir edição/hospedagem antes de incorporar |
| Imprensa | Logos com alguns links, incluindo FUNARJ ligada a matéria de terceiro | Seis veículos contextualizados e links no kit | Separar imprensa, espaços e parceiros; não sugerir endosso |
| Material profissional | Sem central dedicada | PDFs, fotos e vídeos organizados | Criar página com HTML e downloads identificados |
| E-mail | contato@denysjackson.com.br | contato@denysjackson.com | Confirmar; manter decisão pendente |
| Equipe | Sem página detalhada de créditos | Kit: Júlia Maria; ficha: Júlia Mariz; cargos também diferem | Confirmar nomes/cargos, não copiar equipe antiga |
| Corpo de baile | Apresentação genérica | Ficha 2–8; mapa de palco 3–6 | Pode ser diferença entre formato e desenho-base; pedir confirmação |
| Redes | Sandwiche /denysjackson; Instagram @denysjacksonn | Kit /denysjacksonn; ficha imprime @denysjackson | Conferir destinos antes de unificar |
| Prêmio | Biografia menciona prêmios sem contexto | Kit p. 7: 1º lugar Cover Music Universe Awards 2022 | Confirmar nome/contexto; correção do usuário impede chamar internacional |
| Agenda | 14/11/2026, Mário Lago, horário vazio | PDFs não fornecem serviço confirmado desse evento | Confirmar horário/status e demais informações |
| Pedagogia | Sem conteúdo correspondente | Proposta de encontro formativo de 60 minutos para circulação 2027 | Não anunciar como evento financiado/aprovado ou já realizado |

## Verificação complementar do site publicado

As consultas públicas passaram após a mudança de rede. `https://www.denysjackson.com.br/`, `http://www.denysjackson.com.br/` e `http://denysjackson.com.br/` retornam 301 para `https://denysjackson.com.br/`. A versão sem www, robots.txt e sitemap.xml retornaram 200. O sitemap contém a raiz sem www; portanto não se deve trocar o canonical apenas porque o usuário informou www.

O corpo HTML público tem 27.504 bytes e é byte a byte idêntico ao `index.html` fonte do commit edbf2e6a5756dad16caabd9099e2bc0c16745264, não ao HTML gerado pelo build. Assim, a existência do build no Git não comprova que a versão pré-renderizada esteja servida em produção. A causa (por exemplo, origem Pages/artefato publicado) exige inspeção das configurações; não foi identificada nem alterada. Resolver antes de avaliar a entrega de conteúdo sem JavaScript na versão candidata.

Os testes de build do repositório já passaram na auditoria anterior. Isso não equivale a teste visual, medição de Core Web Vitals ou validação de edição CMS. Nenhum formulário foi enviado e nenhum vídeo foi reproduzido nesta etapa.

## Preservar / revisar / excluir do conteúdo novo

**Preservar:** nome do artista e espetáculo; identidade própria; JSONs de conteúdo; miniaturas de galeria existentes; fotografias reais; links documentados de imprensa, após conferência; formação com contexto.

**Revisar:** biografia, montagem em destaque, ficha de serviço, créditos, contatos, links sociais, metadados, acessibilidade e o mecanismo de publicação. Tratar condições técnicas como adaptáveis com a produção, sem promessa irrestrita para qualquer palco.

**Não transportar automaticamente:** textos “maior tributo”, “público garantido”, premiação internacional, equipe antiga, materiais de setlist/áudio e vídeos de referência da produção como se fossem apresentação pública final. Não usar a circulação 2027 proposta como agenda confirmada.

## Isolamento necessário antes de usar CMS em homologação

O workflow em `.github/workflows/pages.yml` executa deploy em push para main e permite disparo manual. Além de `admin/config.yml`, `admin/cms-extensions.js`, `admin/adjust.html` e `admin/gallery-upload.html` fixam main para escrita. Reconhecer modo local só por localhost/127.0.0.1 não protege um domínio remoto de homologação.

Esta branch contém documentos; nenhuma configuração de CMS, DNS, Pages ou workflow foi alterada. Não usar o CMS remoto como homologação até implementar e validar a seleção segura de branch. Proteções de branch/aprovação de ambiente no GitHub ainda precisam ser verificadas. O push de planejamento não deve ser interpretado como homologação funcional ou autorização de publicação.
