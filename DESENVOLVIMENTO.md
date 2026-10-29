# Desenvolvimento do novo site

O trabalho fica na branch **development/novo-site**. O domínio oficial e main só podem receber uma versão após autorização explícita do usuário. O ambiente abaixo não faz push, merge ou deploy.

## Preparar e iniciar

Requisitos: Git e Node.js 22 ou superior (inclui npm). No checkout existente, preserve suas mudanças e confirme a branch. Em uma máquina sem checkout, clone a branch de desenvolvimento do repositório e entre na pasta. Não crie worktree por padrão.

```bash
git branch --show-current
node scripts/setup-development.js
node scripts/develop.js
```

A preparação instala ferramentas **fora do repositório**, em `../shared/dj-development-tools`, e verifica o pacote oficial do CMS por SHA-512 e o bundle extraído por SHA-256. `DJ_DEV_TOOLS_DIR` permite escolher outro diretório externo. Não há package.json, lockfile ou node_modules da aplicação.

O comando `develop.js` recusa outra branch e portas já ocupadas; não encerra processos desconhecidos. Inicia o servidor do site (8080), CMS local (8081) e API auxiliar (8082), verifica as respostas e informa **PRONTO**. Ctrl+C encerra os processos que esse comando iniciou.

No navegador da mesma máquina, abra a porta 8080 do localhost e o caminho `/admin/`. Clique **Entrar**. É login local sem token: o CMS salva os arquivos do checkout de desenvolvimento. `/admin/gallery-upload.html` envia fotos localmente e `/admin/adjust.html` salva os recortes/posições. O botão nativo “Publicar” do Decap, neste modo local, salva arquivos da pasta; não publica o domínio oficial.

O CMS local é servido de um pacote verificado em cache; não depende de baixar JavaScript do unpkg a cada abertura. A apresentação pública existente ainda usa CDNs para fontes, ícones e Tailwind.

## Validar

```bash
node scripts/test-admin-isolation.js
node scripts/test-static-build.js
node scripts/build-static.js
```

A homologação real de navegador requer Chrome/Chromium instalado e as portas 8080–8082 livres. Pare o supervisor que você iniciou antes de rodá-la:

```bash
node scripts/test-development-browser.js
```

A suíte abre uma cópia temporária, inicia os três serviços nela, entra no CMS, edita e recarrega um campo, envia uma imagem e salva posição no painel. Todo tráfego externo do navegador é bloqueado; os arquivos originais são comparados ao final. A cópia é removida após o teste. Screenshots ficam em `test-results` dentro do diretório externo de ferramentas. Use `DJ_CHROMIUM_PATH` se o navegador não estiver em um caminho detectado automaticamente. O fluxo foi executado em Linux/Node 24.19.0/Chromium; outros sistemas possuem caminhos portáveis, mas não foram executados nesta tarefa.

## Sincronizar sem publicar

Revise `git diff` e envie somente as alterações desejadas à branch de desenvolvimento:

```bash
git push origin development/novo-site
```

Não envie chats privados, certificados ou acervo bruto. O workflow de desenvolvimento valida e gera arquivos, sem deploy. Não abra merge/push para main para testar. Nunca use o painel oficial antigo para homologação: ele permanece inalterado e pode gravar em produção.

## Limites de acesso

Este é um ambiente local de desenvolvimento funcional e reproduzível. Não é um endereço público hospedado. Não foi criado serviço de hospedagem, túnel público, DNS nem segundo GitHub Pages. A plataforma deste chat não disponibiliza ferramenta de publicação de preview; portanto não há link remoto de homologação para compartilhar. O CMS remoto Sveltia, caso venha a ser usado em uma hospedagem separada, mantém sua autenticação própria e ainda requer validação real; o fluxo local acima já funciona sem essa dependência.

Na nuvem, processos não são preservados por snapshots: ao retomar, execute novamente `node scripts/develop.js`. As instruções de instalação/inicialização também ficam salvas no rascunho da configuração do ambiente; salvar o rascunho não publica uma nova imagem nem o site oficial.
