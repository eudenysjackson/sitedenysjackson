# Brief de desenvolvimento — Denys Jackson

Documento de trabalho de 29/10/2026. Conteúdo proposto para homologação; não é aprovação de publicação.

## Regra de operação

- Trabalhar na branch `development/novo-site`, mantendo `main` intacta. Sincronização remota permite continuidade entre máquinas e não autoriza deploy.
- Não executar workflow de publicação, merge em main, escrita via CMS online ou mudança de DNS/Pages sem autorização explícita para publicar a versão candidata.
- Esta etapa contém planejamento. A branch não constitui um preview remoto e o CMS ainda aponta para main. Antes de editar pelo painel em homologação, isolar também todos os destinos de escrita.
- Usar o checkout existente; não criar worktree sem pedido explícito. Não enviar exportação de chats, certificados com dados pessoais nem acervo bruto ao Git.
- Não presumir que a branch herda segredos, processos ou ferramentas de outra máquina. Conferir instruções e estado local ao retomar.

## Fontes e hierarquia editorial

1. Instruções atuais do usuário: desenvolvimento/homologação, continuidade na nuvem e publicação oficial apenas com autorização.
2. Correções do usuário no chat anexado, especialmente sobre concurso amador, dublagem interpretativa e dados antigos de equipe.
3. Materiais profissionais 2026 da [pasta de imprensa](https://drive.google.com/drive/folders/1VKnQE7eK_s35VMi1c1CLgT4x7lsawTrO), comparados entre si. Divergências ficam pendentes, sem escolha silenciosa.
4. Site existente e [acervo de produção](https://drive.google.com/drive/folders/12aafA38Vj7q62POYD_sFEx_1hLr_zgBZ) como referências de implementação e histórico, não prova automática de atualidade.

Brief histórico localizado em `conversations.json`, conversa “FUNARJ credenciamento”, ID `6a9eb3e7-0d7c-83e9-962d-48a62b99a922`, mensagem do assistente `06cbe889-1a10-4b3e-b822-dd7fbb286de1`; solicitação do usuário `f7a1707a-82cb-4ca4-a928-ad90739aeb15`. Complemento: “Revisar Search Console”, ID `6ab72341-9d14-83e9-b959-9f9f2ec7f3ae`. Sugestões antigas do assistente são propostas, não comandos ou fatos verificados.

## Objetivo e público

Transformar o site em apresentação profissional do artista e do espetáculo, ferramenta de contratação, imprensa e circulação, com conteúdo rastreável para buscas pelo nome e pelo trabalho. Priorizar contratantes/produtores e imprensa, mantendo caminhos simples para fãs encontrarem agenda, vídeos e ingressos.

Denys é a marca do artista; Na Ponta dos Pés é o espetáculo; Michael Jackson é a referência do tributo independente. Não afirmar vínculo oficial com Michael Jackson, canto ao vivo, liderança de mercado ou premiação internacional sem documentação e confirmação.

## Conteúdo sustentado pelos materiais lidos

- Trajetória iniciada em 2015 no Parque Madureira; primeiro espetáculo “Tribute to the King of Music” em 2018; nome Na Ponta dos Pés adotado em 2019 (release e mídia kit p. 2).
- Atuação como artista tributo e produtor cultural; direção e idealização devem respeitar os créditos compartilhados presentes na ficha técnica.
- Montagem de 2026 inspirada na era Bad; possibilidade de alternar Bad e Dangerous conforme espaço e histórico da casa (mídia kit pp. 4–5 e sinopse).
- Duração aproximada de 90 minutos, classificação livre, performance com fonogramas e dublagem interpretativa (sinopse e mídia kit p. 4). Não transformar em garantia de formato para toda contratação sem avaliar a casa.
- Formação complementar: 464 horas. Sete PDFs vinculados foram lidos: 160h + cinco cursos de 60h + workshop de 4h. Isso sustenta a soma declarada, não equivale a graduação ou verificação de autenticidade junto às instituições.
- Há fontes de imprensa no mídia kit p. 8, com links para Globo, Record, Multishow, Rádio Nacional/EBC, O Dia e Sou Méier. Contextualizar cada participação; não sugerir patrocínio ou endosso.

## Mapa de páginas proposto

| Página / rota proposta | Papel e conteúdo | Ação principal | Fonte inicial |
|---|---|---|---|
| Início `/` | Síntese do artista, espetáculo, montagem atual, vídeo, mídia e próxima data | Contrate o espetáculo | Release + mídia kit |
| Denys Jackson `/denys-jackson/` | Biografia, linha do tempo 2015/2018/2019/2026 e formação | Conhecer o espetáculo | Release, kit pp. 2–3 |
| Na Ponta dos Pés `/na-ponta-dos-pes/` | Sinopse, formato, Bad atual, histórico Dangerous, fotos e vídeos contextualizados | Solicitar proposta | Sinopse, kit pp. 4–6 |
| Agenda `/agenda/` | Datas confirmadas e serviço; histórico separado | Ver apresentação / ingressos | Agenda a reconfirmar |
| Na Mídia `/na-midia/` | Matérias, entrevistas e participações com contexto, data e link | Ler ou assistir | Kit p. 8 + fontes originais |
| Imprensa & Contratação `/imprensa-contratacao/` | Release em HTML, downloads, fotos de imprensa, sinopse, ficha e rider | Falar com produção | Pasta profissional 2026 |
| Contato `/contato/` | E-mail confirmado, WhatsApp, redes e formulário acessível | Contatar produção | Dados a confirmar |

Rotas são propostas, ainda não implementadas. Evitar duplicação entre imprensa e contato. Fotos/vídeos ficam inicialmente no espetáculo e mídia; uma galeria independente só será criada se o volume e a navegação justificarem. Eventos individuais exigem serviço completo, local, horário, status e conteúdo próprios. Não criar páginas vazias para SEO.

## Home: roteiro para o primeiro protótipo

1. Fotografia real de palco e H1 textual “Denys Jackson — Na Ponta dos Pés”. Apoio proposto: “Um espetáculo tributo a Michael Jackson, criado por fãs e para fãs.”
2. CTA principal “Contrate o espetáculo”; secundário “Conheça Na Ponta dos Pés”; acesso visível a material profissional. Nunca esconder essas informações somente dentro de uma arte.
3. Apresentação curta do artista, com link à biografia.
4. Espetáculo e montagem atual Bad, diferenciando Dangerous como outra montagem/histórico.
5. Vídeo selecionado da montagem atual, com poster, identificação e carregamento sob interação.
6. Trajetória e imprensa com fatos e fontes; sem superlativos não demonstrados.
7. Próxima apresentação somente com informações confirmadas e tratamento correto de eventos passados.
8. Encerramento com contratação, material profissional e contato.

Esse roteiro e as frases são propostas editoriais para revisão, não texto publicado.

## Direção visual

Inter; roxo profundo #1A1040, índigo #4338CA, dourado #C9A96E, azul-cinza #E0E6ED e grafite #1F2937. A identidade recuperada do chat também aparece no material 2026. Usar palco, iluminação e fotografias reais; não copiar álbuns, turnês ou o futuro site de referência. Evitar efeitos que ocultem conteúdo ou comprometam leitura.

As fotos oficiais examinadas são predominantemente verticais. Para desktop, considerar texto e foto lado a lado ou composição que preserve o enquadramento; para celular, manter rosto/corpo e CTA legíveis. Avaliar os originais e crédito do fotógrafo antes de produzir os recortes finais. Referência fornecida: https://tributoreidopop.com.br/. Por instrução expressa do usuário, estudar SOMENTE a distribuição de conteúdo e a arquitetura de navegação; manter cores e tipografia próprias de Denys. Não copiar textos, imagens, identidade ou código.

## Sequência e critérios de passagem

1. **Planejamento atual:** inventário, comparação editorial, fontes e dúvidas documentadas na branch remota.
2. **Isolamento técnico:** CMS e painéis apontando explicitamente ao desenvolvimento, preview separado, verificação de proteções existentes; testar sem escrever em produção.
3. **Protótipo Home:** mobile/desktop com conteúdo real, identificação e CTAs; revisar referência e direção visual com o usuário.
4. **Implementação gradual:** Home, artista e espetáculo; depois imprensa/contratação, mídia, agenda e contato. Preservar JSONs, miniaturas e renderização estática útil.
5. **Homologação:** testes funcionais, teclado, leitor de tela, responsividade, build, conteúdo, links, desempenho e SEO. Testes de envio de formulário só com coordenação explícita, por gerarem comunicação externa.
6. **Versão candidata:** apresentar mudanças e pendências; preparar rollback. Publicar apenas com autorização explícita para a versão revisada. Sincronizar trabalho não substitui essa autorização.

## Confirmações do usuário nesta sessão

- E-mail oficial para o novo site: **contato@denysjackson.com.br**. A divergência dos PDFs fica registrada para revisão futura dos materiais; nenhum PDF original foi modificado.
- Equipe: **priorizar a ficha técnica 2026**. Júlia Vieira como coordenadora de produção, Júlia Mariz como assistente e formação variável de 2 a 8 bailarinos. O mapa 3–6 é referência de desenho-base, não substitui a faixa da ficha técnica.
- Site de referência: **https://tributoreidopop.com.br/**. Uso restrito à distribuição e arquitetura, conforme esclarecimento explícito do usuário. Cores e tipografia permanecem as nossas.

## Decisões ainda pendentes

- Créditos/autorização de uso das fotos; seleção de vídeo final e sua hospedagem. Nenhum vídeo foi assistido integralmente nesta etapa.
- Confirmar serviço e situação da apresentação de 14/11/2026 antes de inseri-la no novo site.
- Confirmar nome oficial e contexto da premiação; não usar “internacional”.

As confirmações acima substituem as dúvidas iniciais de contato, equipe e referência; não perguntar novamente. Dados ainda não confirmados não serão preenchidos por suposição.
