# Releitura do histórico e correção de escopo — 29/10/2026

Documento de desenvolvimento, sem autorização de publicação. A releitura examinou a cadeia atual da conversa “FUNARJ credenciamento” (1.475 mensagens), localizou os trechos específicos sobre site/materiais e distinguiu as falas do usuário de propostas do assistente. Não foi feita nova auditoria integral de todos os assuntos da conversa.

## Evidências que orientam esta correção

- Mensagem do usuário `f7a1707a-82cb-4ca4-a928-ad90739aeb15`: quer estruturar a atualização com o Codex, “priorizando a ideia do nosso debate”.
- Na mensagem do usuário sobre atualização de release e mídia kit, ele propõe esses materiais “como se fosse uma página no site”. A resposta histórica explica página online como principal e PDFs como apoio. Isso não justifica uma seção composta apenas por downloads.
- O briefing proposto pelo assistente em `06cbe889-1a10-4b3e-b822-dd7fbb286de1` sugere Home; Denys Jackson; Na Ponta dos Pés; Agenda; Na Mídia; Imprensa & Contratação; Contato. Diz: “Não reescreva tudo indiscriminadamente se componentes existentes puderem ser preservados.” É uma proposta histórica, não uma aprovação automática de cada frase. O usuário agora pediu explicitamente dividir as páginas e ser fiel ao original.
- Na conversa atual, o usuário limita a referência de terceiros à arquitetura, exige sua estética original e rejeita a exposição da quantidade de bailarinos na apresentação.
- O histórico também contém a correção do usuário para usar “ballet” em vez de “baile”. Isso passa a orientar os textos novos.

## Onde a implementação anterior se desviou

A primeira proposta adotou outra composição, apesar de conservar nomes de cores e fonte. A segunda reaplicou vidro sobre essa composição. Ambas concentraram o roteiro em uma página longa. Dados de produção, horas de cursos e duração foram tratados como destaques da Home; o briefing não exigia esses números ali. Priorizar a ficha técnica como fonte resolve divergências documentais, mas não determina que cada informação deva ser exibida ao público.

## Correção implementada

- A capa volta a usar as mesmas imagens desktop/mobile de `site.json`, sem arco ou retrato lateral novo.
- Navegação e rodapé derivam do HTML original. A biografia reutiliza o painel com foto, a grade 2/3 e os três cards Missão/Objetivo/Comunidade originais, com textos revisados para evitar alegações não sustentadas.
- `css/style.css` e a raiz não são alterados. As classes Tailwind do original são compiladas localmente, com as mesmas cores e Inter, para que a revisão funcione sem CDN.
- Home curta: capa original, identificação/contatos de contratação e resumos de artista/espetáculo. Sem números de elenco, carga horária, duração ou ficha técnica.
- Sete documentos HTML navegáveis: `index.html`, `denys-jackson.html`, `na-ponta-dos-pes.html`, `agenda.html`, `na-midia.html`, `imprensa-contratacao.html` e `contato.html`, todos sob `/prototipo/`.
- Artista: biografia própria e os três cards existentes. Espetáculo: conceito, Bad/Dangerous, galeria e vídeos identificados. Na Mídia: matérias e participações contextualizadas. Imprensa: release e sinopse para leitura online, com PDFs e contatos como apoio. Contato: produção e redes.
- Agenda: canais e atendimento para consulta. Nenhuma data com serviço pendente é anunciada; a página não comprova confirmação de apresentações.
- Informações detalhadas de equipe e rider permanecem nos documentos da área profissional, sem destaque promocional na Home.

A seleção editorial continua revisável. Preservar a estética não significa restaurar “público garantido”, “maior tributo”, uma premiação internacional ou qualquer afirmação que o usuário já corrigiu.

## Fontes e atualização

`site.json`, `about.json`, `gallery.json`, `social_proof.json` e `videos.json` continuam fornecendo imagens, fontes e contatos. `home.json` agora reúne textos compartilhados entre as páginas e links profissionais. A coleção no CMS chama-se “Novo site — desenvolvimento”; mantém o identificador técnico anterior para compatibilidade.

As páginas são snapshots: após editar no CMS, executar `node scripts/build-home-prototype.js --source` para os arquivos fonte de revisão e `node scripts/build-static.js` para a saída completa. O CSS de utilitários compilado está versionado; mudanças de texto não exigem recompilação. Se classes forem alteradas, compilar Tailwind 3.4.17 com `scripts/review-tailwind.config.js`, entrada `scripts/review-utilities.css` e saída `css/review-utilities.css`; o compilador é ferramenta externa, não dependência da aplicação.

Sem deploy, alteração de domínio, merge ou push em main. Os protótipos anteriores estão superados por esta revisão e não devem ser apresentados como a versão atual.

## Entrega navegável

`node scripts/export-review.js` exporta sete HTMLs independentes, com CSS/JS/Inter/fotos incorporados, para uma pasta externa ao repositório. Extraia o pacote completo e abra index.html; manter os sete arquivos na mesma pasta. Os links externos continuam exigindo internet. A persistência de idioma entre arquivos file:// depende do navegador, embora a troca funcione em cada página.
