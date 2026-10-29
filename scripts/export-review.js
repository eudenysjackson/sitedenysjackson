/* Export the seven review pages as independent, self-contained HTML files.
   All assets are embedded; the output is a private local review, not a deploy. */
const fs = require('node:fs');
const path = require('node:path');
const { renderReviewPages, loadReviewData } = require('./build-home-prototype');
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.resolve(process.argv[2] || path.join(ROOT, '../shared/revisao-site-denys-jackson'));
if (OUTPUT === ROOT || OUTPUT.startsWith(ROOT + path.sep)) throw new Error('Export the review outside the repository.');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const cache = new Map();
function embeddedAsset(url) {
    const file = path.resolve(ROOT, decodeURI(url.replace(/^\.\.\//, '')));
    if (!file.startsWith(ROOT + path.sep)) throw new Error('Invalid export asset');
    const mime = { '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.woff2':'font/woff2' }[path.extname(file)];
    if (!mime) throw new Error('Unsupported export asset: ' + file);
    if (!cache.has(file)) cache.set(file, 'data:' + mime + ';base64,' + fs.readFileSync(file).toString('base64'));
    return cache.get(file);
}
const css = read('css/review-utilities.css') + '\n' + read('css/style.css') + '\n' + read('css/home.css').replace("url('fonts/inter-latin.woff2')", () => "url('" + embeddedAsset('../css/fonts/inter-latin.woff2') + "')");
const js = (read('js/i18n.js') + '\n' + read('js/home.js')).replace(/<\/script/gi, '<\\/script');
fs.mkdirSync(OUTPUT, { recursive: true });
for (const [name, source] of Object.entries(renderReviewPages(loadReviewData()))) {
    let html = source.replace(/<link rel="stylesheet"[^>]+>/g, '');
    html = html.replace(/<script src="\.\.\/js\/(?:i18n|home)\.js" defer><\/script>/g, '');
    html = html.replace(/\b(src|srcset|href|data-photo)="(\.\.\/images\/[^"\n]+)"/g, (_, attr, url) => attr + '="' + embeddedAsset(url) + '"');
    html = html.replace('</head>', () => '<style>' + css + '</style></head>');
    html = html.replace('</body>', () => '<script>' + js + '</script></body>');
    fs.writeFileSync(path.join(OUTPUT, name), html);
}
fs.copyFileSync(path.join(ROOT, 'css/fonts/OFL.txt'), path.join(OUTPUT, 'LICENCA-INTER.txt'));
fs.writeFileSync(path.join(OUTPUT, 'LEIA-ME.txt'), 'Revisão de desenvolvimento — Denys Jackson\n\nExtraia o ZIP inteiro e abra index.html no navegador.\nOs sete HTMLs precisam permanecer na mesma pasta para o menu funcionar.\nFotografias, Inter, estilos e interações estão incorporados nos HTMLs.\nLinks externos de matérias, redes, WhatsApp e documentos exigem internet.\nA troca de idioma funciona em cada página; persistência entre arquivos locais depende do navegador.\nNada foi publicado no domínio oficial.\n');
console.log('Portable review exported to ' + OUTPUT + ' (7 HTML files).');
