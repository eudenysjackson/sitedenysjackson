/* Development pages assembled from the original site's components and CMS data.
   Nothing in this module changes the public root, sitemap, Pages or main. */
const fs = require('node:fs');
const path = require('node:path');
const { render, element } = require('./build-static');
const ROOT = path.resolve(__dirname, '..');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = name => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', name + '.json'), 'utf8'));
const ROUTES = [
    ['index.html', 'nav_home'], ['denys-jackson.html', 'nav_artist'],
    ['na-ponta-dos-pes.html', 'nav_show'], ['agenda.html', 'nav_agenda'],
    ['na-midia.html', 'nav_media'], ['imprensa-contratacao.html', 'materials_title'],
    ['contato.html', 'nav_contact']
];
function asset(value) {
    if (!/^\/images\/[\w .()\/-]+\.(?:jpe?g|png|webp)$/i.test(value || '') || value.includes('..')) throw new Error('Invalid prototype image path');
    if (!fs.existsSync(path.join(ROOT, value.slice(1)))) throw new Error('Missing prototype image: ' + value);
    return '..' + encodeURI(value);
}
function external(value, host) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || (host && url.hostname !== host)) throw new Error('Invalid professional material URL');
    return esc(url.href);
}
function replaceContent(html, id, content) {
    const e = element(html, id);
    return html.slice(0, e.inner) + content + html.slice(e.end);
}
function extract(html, id) {
    const e = element(html, id);
    return html.slice(e.start, e.after);
}
function renderReviewPages(data, lang = 'pt') {
    if (!['pt', 'en', 'es'].includes(lang)) throw new Error('Unsupported prototype language');
    const { home, site, about, gallery, social_proof } = data;
    if (!/^[^\s<>"'@]+@[^\s<>"'@]+$/.test(site.email || '')) throw new Error('Invalid contact email');
    // Validate every managed material/image, even if a particular page omits it.
    Object.values(home.materials).forEach(value => external(value, 'drive.google.com'));
    const copy = { ...home.copy };
    for (const key of ['mission', 'objective']) copy['about_' + key] = Object.fromEntries(['pt', 'en', 'es'].map(l => [l, about[key + '_' + l] || about[key + '_pt']]));
    const text = key => {
        if (typeof copy[key]?.[lang] !== 'string') throw new Error('Missing home copy: ' + key);
        return esc(copy[key][lang]);
    };
    const span = key => `<span data-i18n="home.${key}">${text(key)}</span>`;
    const paragraph = (key, classes = 'text-slate-600 text-[15px] leading-relaxed') => `<p class="${classes}" data-i18n="home.${key}">${text(key)}</p>`;
    const heading = key => `<div class="text-center review-heading"><h1 data-i18n="home.${key}">${text(key)}</h1></div>`;
    let digits = String(site.phone || '').replace(/\D/g, '');
    if (!digits.startsWith('55')) digits = '55' + digits;
    const whatsapp = 'https://wa.me/' + digits;
    const contact = `<a class="btn-primary" href="${whatsapp}" target="_blank" rel="noopener">${span('contact_cta')}</a>`;
    const email = `<a class="review-link review-contact-link" href="mailto:${esc(site.email)}">${esc(site.email)}</a>`;
    const link = (route, key, classes = 'review-link') => `<a class="${classes}" href="${route}">${span(key)}</a>`;
    const section = content => `<section class="py-3 md:py-4"><div class="max-w-6xl mx-auto px-4">${content}</div></section>`;
    const photo = (value, alt, classes = '') => `<img src="${asset(value)}" alt="${esc(alt)}" class="${classes}" loading="lazy" decoding="async">`;
    const root = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    // Reuse the original bio/photo grid, three cards, navigation and footer.
    const original = render(root, { ...data, shows: { shows: [] } });
    let artist = extract(original, 'sobre');
    artist = artist.replace('<h2 class="section-title">Denys Jackson</h2>', `<h1 class="section-title">Denys Jackson</h1>`);
    artist = replaceContent(artist, 'about-bio', ['artist_body', 'artist_history', 'artist_work'].map(key => paragraph(key)).join(''));
    artist = replaceContent(artist, 'about-mission', span('about_mission'));
    artist = replaceContent(artist, 'about-objective', span('about_objective'));
    artist = replaceContent(artist, 'about-community', span('community_body'));
    artist = artist.replace(/src="(\/images\/[^"\n]+)"/g, (_, url) => `src="..${url}"`);
    const navMarkup = route => {
        const desktop = ROUTES.map(([url, key]) => `<a href="${url}" class="nav-link${url === route ? ' active' : ''}"${url === route ? ' aria-current="page"' : ''}>${span(key)}</a>`).join('');
        const mobile = ROUTES.map(([url, key]) => `<a href="${url}" class="mobile-nav-link"${url === route ? ' aria-current="page"' : ''}>${span(key)}</a>`).join('');
        const languages = `<div class="flex items-center gap-1 ml-4 text-xs" aria-label="Idioma">${['pt','en','es'].map(l => `<button class="lang-btn${lang === l ? ' active' : ''}" data-lang="${l}" aria-pressed="${lang === l}">${l.toUpperCase()}</button>`).join('<span class="text-slate-400" aria-hidden="true">|</span>')}</div>`;
        let nav = extract(root, 'navbar');
        const from = nav.indexOf('                <!-- Desktop Nav -->');
        const to = nav.indexOf('                <!-- Mobile Menu Button -->');
        nav = nav.slice(0, from) + `<div class="review-desktop-nav items-center review-nav-links">${desktop}${languages}</div>\n` + nav.slice(to);
        nav = nav.replace('href="#home"', 'href="index.html"').replace(/src="images\//g, 'src="../images/');
        nav = nav.replace('id="menu-toggle" class="md:hidden p-2" aria-label="Menu"', 'id="menu-toggle" class="review-menu-toggle p-2" aria-label="Menu" aria-controls="mobile-menu" aria-expanded="false"');
        if (route !== 'index.html') nav = nav.replace('id="navbar"', 'id="navbar" class="scrolled"').replace('class="scrolled" class="', 'class="scrolled ');
        return nav + `<div id="mobile-overlay" hidden></div><aside id="mobile-menu" class="review-mobile-menu" aria-label="Menu" hidden><div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-200"><strong class="text-dj-indigo">MENU</strong><button id="sidebar-close" class="p-2" aria-label="Fechar"><svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 6 12 12M6 18 18 6" stroke-width="2"/></svg></button></div><div class="flex flex-col gap-3">${mobile}</div><div class="mt-6 pt-4 border-t border-slate-200">${languages}</div></aside>`;
    };
    const pressCards = social_proof.logos.filter(logo => logo.name !== 'FUNARJ').map(logo => {
        const key = logo.name.includes('Globo') ? 'globo_context' : logo.name.includes('Record') ? 'record_context' : 'multishow_context';
        return `<article class="glass p-6"><a class="media-logo-card" href="${external(logo.url)}" target="_blank" rel="noopener">${photo(logo.image, logo.name, 'media-logo-img')}</a>${paragraph(key, 'text-slate-500 text-sm leading-relaxed mt-4')}<p class="mt-4"><a class="review-link text-sm" href="${external(logo.url)}" target="_blank" rel="noopener">${span('view_report')}</a></p></article>`;
    }).join('');
    const materialLinks = Object.keys(home.materials).map(key => `<a class="review-download" data-home-material="${key}" href="${external(home.materials[key], 'drive.google.com')}" target="_blank" rel="noopener"><span>${span(key)}</span><small>${span('pdf')}</small></a>`).join('');
    const galleries = gallery.photos.map((item, i) => {
        const p = item.photo || item;
        const thumb = p.image.replace(/\.[^/.]+$/, '-thumb.jpg');
        const image = fs.existsSync(path.join(ROOT, thumb.slice(1))) ? thumb : p.image;
        const position = /^\d+(?:\.\d+)?% \d+(?:\.\d+)?%$/.test(p.position || '') ? p.position : '50% 50%';
        return `<button class="gallery-item review-gallery-button" data-photo="${asset(p.image)}" data-caption="${esc(p.caption || 'Denys Jackson em cena')}" aria-label="${text('photo_open')} ${i + 1}"><img src="${asset(image)}" alt="${esc(p.caption || 'Denys Jackson em cena')}" loading="lazy" style="object-position:${position}"></button>`;
    }).join('');
    const lightbox = `<dialog id="lightbox" class="items-center justify-center p-4" aria-label="Fotografia"><button id="lightbox-close" class="absolute top-4 right-4 text-white text-3xl" aria-label="Fechar">×</button><img id="lightbox-img" class="max-w-full max-h-[85vh] object-contain rounded-lg" alt=""><p id="lightbox-caption" class="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-center"></p></dialog>`;
    const videos = `<div class="grid md:grid-cols-2 gap-6"><div class="glass p-6"><h3 class="text-lg font-bold text-slate-800 mb-3">Smooth Criminal</h3><a class="review-link" href="https://www.instagram.com/p/DbGCjHQBfZt/" target="_blank" rel="noopener">${span('watch')}</a></div>${data.videos.videos.map(v => {
        const id = String(v.youtube_id).match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1];
        if (!id) throw new Error('Invalid video ID');
        return `<div class="glass p-6"><h3 class="text-lg font-bold text-slate-800 mb-3">${esc(v.title)}</h3><a class="review-link" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">YouTube</a></div>`;
    }).join('')}</div>`;
    const homePage = `<section id="home" class="hero-section"><picture class="review-hero-art"><source media="(max-width:767px)" srcset="${asset(site.hero_image_mobile)}"><img src="${asset(site.hero_image)}" alt="Denys Jackson" fetchpriority="high"></picture><div class="hero-overlay"></div><h1 class="sr-only">Denys Jackson — Na Ponta dos Pés</h1></section>` + section(`<div class="text-center mb-6"><span class="section-label">Denys Jackson</span><h2 class="section-title">Na Ponta dos Pés</h2><p class="text-slate-500 mt-3">${span('independent')}</p><div class="flex flex-wrap justify-center gap-4 mt-6">${link('contato.html','hire','btn-primary')}${link('na-ponta-dos-pes.html','discover','btn-small')}${link('imprensa-contratacao.html','professional','review-link self-center')}</div></div>`) + section(`<div class="grid md:grid-cols-2 gap-6"><article class="glass-strong p-6 md:p-8"><h2 class="text-xl font-bold text-slate-800 mb-4">Denys Jackson</h2>${paragraph('artist_body')}<p class="mt-5">${link('denys-jackson.html','learn_artist')}</p></article><article class="glass-strong p-6 md:p-8"><h2 class="text-xl font-bold text-slate-800 mb-4">Na Ponta dos Pés</h2>${paragraph('show_body')}<p class="mt-5">${link('na-ponta-dos-pes.html','discover')}</p></article></div>`);
    const showPage = section(heading('show_title') + `<div class="glass-strong p-6 md:p-10 review-copy">${paragraph('show_body')}${paragraph('format')}</div><div class="grid md:grid-cols-2 gap-6 mt-6"><article class="glass p-6"><h2 class="text-lg font-bold text-slate-800 mb-3" data-i18n="home.bad_label">${text('bad_label')}</h2>${paragraph('bad_body', 'text-slate-500 text-sm leading-relaxed')}</article><article class="glass p-6"><h2 class="text-lg font-bold text-slate-800 mb-3">Bad & Dangerous</h2>${paragraph('bad_note','text-slate-500 text-sm leading-relaxed')}</article></div>`) + section(`<div class="text-center mb-6"><h2 class="section-title" data-i18n="home.gallery_title">${text('gallery_title')}</h2></div><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">${galleries}</div>`) + section(`<div class="text-center mb-6"><h2 class="section-title" data-i18n="home.video_title">${text('video_title')}</h2></div>${videos}<div class="text-center mt-8">${contact}</div>`) + lightbox;
    const agendaPage = section(heading('agenda_title') + `<div class="glass-strong p-6 md:p-10 max-w-3xl mx-auto text-center">${paragraph('agenda_body')}<div class="flex flex-wrap gap-4 justify-center mt-6"><a class="btn-primary" href="${external(site.social.instagram)}" target="_blank" rel="noopener">Instagram</a>${contact}</div></div>`);
    const mediaPage = section(heading('media_title') + `<div class="grid md:grid-cols-3 gap-6">${pressCards}</div><div class="glass p-6 md:p-8 mt-6"><h2 class="text-lg font-bold text-slate-800 mb-4">${span('media_label')}</h2><div class="flex flex-wrap gap-6"><a class="review-link" href="https://radionacional.ebc.com.br/programas/tarde-nacional-rio-de-janeiro/cover-de-michael-jackson-conquista-o-publico-no-rio" target="_blank" rel="noopener">Rádio Nacional / EBC</a><a class="review-link" href="https://odia.ig.com.br/duque-de-caxias/2026/07/7274553-teatro-raul-cortez-em-caxias-recebe-tributo-a-michael-jackson.html" target="_blank" rel="noopener">O Dia</a><a class="review-link" href="https://soumeier.com.br/todas-as-noticias/eventos/tributo-a-michael-jackson-chega-ao-imperator-no-meier/" target="_blank" rel="noopener">Sou Méier</a></div></div>`);
    const pressPage = section(heading('materials_title') + `<div class="glass-strong p-6 md:p-10 review-copy"><h2 class="text-xl font-bold text-slate-800 mb-5">${span('release')}</h2>${paragraph('artist_body')}${paragraph('artist_history')}${paragraph('artist_work')}</div><div class="glass p-6 md:p-10 mt-6 review-copy"><h2 class="text-xl font-bold text-slate-800 mb-5">${span('synopsis')} — Na Ponta dos Pés</h2>${paragraph('show_body')}${paragraph('bad_body')}${paragraph('bad_note')}${paragraph('format')}</div><div class="grid md:grid-cols-2 gap-6 mt-6"><div class="glass p-6 md:p-8"><h2 class="text-lg font-bold text-slate-800 mb-4">${span('documents_title')}</h2>${materialLinks}</div><div class="glass p-6 md:p-8"><h2 class="text-lg font-bold text-slate-800 mb-4">${span('materials_label')}</h2>${paragraph('materials_body')}<p class="mt-6"><a class="review-link" href="https://drive.google.com/drive/folders/1VKnQE7eK_s35VMi1c1CLgT4x7lsawTrO" target="_blank" rel="noopener">${span('folder')}</a></p><div class="mt-8">${contact}</div><p class="mt-6">${email}</p></div></div>`);
    const contactPage = section(heading('contact_title') + `<div class="grid md:grid-cols-2 gap-6"><div class="glass-strong p-6 md:p-10">${paragraph('contact_body')}<div class="mt-6">${contact}</div><p class="mt-6">${email}</p><p class="mt-4 text-slate-600 text-sm"><a href="${whatsapp}" target="_blank" rel="noopener">${esc(site.phone)}</a></p></div><div class="glass p-6 md:p-8"><h2 class="text-lg font-bold text-slate-800 mb-4" data-i18n="contact.social_title">Redes Sociais</h2><div class="grid sm:grid-cols-2 gap-3">${Object.entries(site.social).map(([key,url]) => `<a class="social-link" href="${external(url)}" target="_blank" rel="noopener">${esc(key === 'youtube' ? 'YouTube' : key === 'tiktok' ? 'TikTok' : key[0].toUpperCase()+key.slice(1))}</a>`).join('')}</div></div></div>`);
    const bodies = [homePage, artist, showPage, agendaPage, mediaPage, pressPage, contactPage];
    const pages = {};
    ROUTES.forEach(([route, titleKey], i) => {
        const homeRoute = i === 0;
        const nav = navMarkup(route);
        const footer = `<footer class="footer pt-4 pb-4"><div class="max-w-6xl mx-auto px-4 text-center text-xs text-slate-400"><p>© ${new Date().getFullYear()} <span data-i18n="footer.copyright">Criado por Denys Jackson</span></p><p class="mt-1">CNPJ ${esc(site.cnpj)}</p><p class="mt-3">${link('contato.html','nav_contact')} · ${link('imprensa-contratacao.html','nav_material')}</p></div></footer>`;
        // Include only text actually used on this page, excluding technical data from Home.
        const used = [...(nav + bodies[i] + footer + span('skip')).matchAll(/data-i18n="home\.([a-z_0-9]+)"/g)].map(m => m[1]);
        const localized = JSON.stringify(Object.fromEntries(used.map(key => [key, copy[key]]))).replace(/</g, () => String.fromCharCode(92) + 'u003c');
        const description = text(homeRoute ? 'hero_description' : ['hero_description','artist_body','show_body','agenda_body','media_label','materials_body','contact_body'][i]);
        pages[route] = `<!doctype html>\n<html lang="${lang === 'pt' ? 'pt-BR' : lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>${homeRoute ? 'Denys Jackson — Na Ponta dos Pés' : text(titleKey) + ' | Denys Jackson'}</title><meta name="description" content="${description}"><link rel="icon" href="${asset(site.favicon)}"><link rel="stylesheet" href="../css/review-utilities.css"><link rel="stylesheet" href="../css/style.css"><link rel="stylesheet" href="../css/home.css"><script src="../js/i18n.js" defer></script><script src="../js/home.js" defer></script></head><body class="font-inter antialiased ${homeRoute ? 'review-home' : 'review-inner'}"><a class="review-skip" href="#conteudo">${span('skip')}</a>${nav}<main id="conteudo">${bodies[i]}</main>${footer}<button id="back-to-top" class="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-dj-indigo text-white shadow-lg flex items-center justify-center" aria-label="Topo"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 12 6-6 6 6M12 6v14" stroke-width="2"/></svg></button><script id="review-copy" type="application/json">${localized}</script></body></html>\n`;
    });
    return pages;
}
function loadReviewData() {
    return Object.fromEntries(['home','about','gallery','shows','tribute','videos','site','social_proof'].map(name => [name, read(name)]));
}
function buildHomePrototype(output = path.join(ROOT, '_site', 'prototipo')) {
    const allowed = [path.join(ROOT, '_site', 'prototipo'), path.join(ROOT, 'prototipo')];
    if (!allowed.includes(path.resolve(output))) throw new Error('Invalid prototype output');
    const pages = renderReviewPages(loadReviewData());
    fs.mkdirSync(output, { recursive: true });
    for (const [name, html] of Object.entries(pages)) fs.writeFileSync(path.join(output, name), html);
    console.log('Development review generated: 7 separate pages using original components.');
}
if (require.main === module) buildHomePrototype(process.argv.includes('--source') ? path.join(ROOT, 'prototipo') : undefined);
module.exports = { renderReviewPages, buildHomePrototype, loadReviewData, ROUTES };
