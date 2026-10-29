const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function imageUrl(value) {
    if (!/^\/images\/[\w .()\/-]+\.(?:jpe?g|png|webp)$/i.test(value || '') || value.includes('..')) throw new Error('Invalid prototype image path');
    return '..' + encodeURI(value);
}
function materialUrl(value) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com') throw new Error('Invalid professional material URL');
    return url.href;
}
function renderHome(source, data, site, lang = 'pt') {
    if (!['pt', 'en', 'es'].includes(lang)) throw new Error('Unsupported prototype language');
    let html = source.replace(/<(h[1-6]|p|span)(\b[^>]*\bdata-i18n="home\.([a-z_0-9]+)"[^>]*)>[\s\S]*?<\/\1>/g, (_, tag, attrs, key) => {
        if (!data.copy[key] || typeof data.copy[key][lang] !== 'string') throw new Error('Missing home copy: ' + key);
        return '<' + tag + attrs + '>' + escape(data.copy[key][lang]) + '</' + tag + '>';
    });
    html = html.replace(/<img\b[^>]*\bdata-home-image="([a-z_]+)"[^>]*>/g, (tag, key) => tag
        .replace(/\bsrc="[^"]*"/, () => 'src="' + escape(imageUrl(data.images[key])) + '"')
        .replace(/\balt="[^"]*"/, () => 'alt="' + escape(data.copy[key + '_alt'][lang]) + '"'));
    html = html.replace(/<a\b[^>]*\bdata-home-material="([a-z_]+)"[^>]*>/g, (tag, key) => tag
        .replace(/\bhref="[^"]*"/, () => 'href="' + escape(materialUrl(data.materials[key])) + '"'));
    if (!/^[^\s<>"'@]+@[^\s<>"'@]+$/.test(site.email || '')) throw new Error('Invalid contact email');
    html = html.replace(/(<a\b[^>]*\bdata-home-contact="email"[^>]*>)[^<]*<\/a>/g, (tag, open) => open
        .replace(/\bhref="[^"]*"/, () => 'href="mailto:' + escape(site.email) + '"') + escape(site.email) + '</a>');
    let digits = String(site.phone || '').replace(/\D/g, '');
    if (!digits.startsWith('55')) digits = '55' + digits;
    html = html.replace(/<a\b[^>]*\bdata-home-contact="whatsapp"[^>]*>/g, tag => tag.replace(/\bhref="[^"]*"/, 'href="https://wa.me/' + digits + '"'));
    return html.replace(/<html lang="[^"]*">/, '<html lang="' + (lang === 'pt' ? 'pt-BR' : lang) + '">');
}
function buildHomePrototype(output = path.join(ROOT, '_site', 'prototipo')) {
    if (path.resolve(output) !== path.join(ROOT, '_site', 'prototipo')) throw new Error('Invalid prototype output');
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/home.json'), 'utf8'));
    const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
    for (const value of Object.values(data.images)) {
        imageUrl(value);
        if (!fs.existsSync(path.join(ROOT, value.slice(1)))) throw new Error('Missing prototype photo: ' + value);
    }
    const html = renderHome(fs.readFileSync(path.join(ROOT, 'prototipo/index.html'), 'utf8'), data, site);
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, 'index.html'), html);
    console.log('Home prototype generated from CMS JSON.');
}
if (require.main === module) buildHomePrototype();
module.exports = { renderHome, buildHomePrototype };
