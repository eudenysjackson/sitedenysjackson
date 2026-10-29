/** Build public HTML from CMS JSON. Node built-ins only; no browser/network. */
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = name => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', name + '.json'), 'utf8'));

// Locate an element by its unique ID, counting nested tags of the same type.
function element(html, id) {
    const opening = new RegExp('<([a-z][a-z0-9]*)\\b[^>]*\\bid="' + id + '"[^>]*>', 'i').exec(html);
    if (!opening) throw new Error('Missing build target: ' + id);
    const start = opening.index;
    const inner = start + opening[0].length;
    const tags = new RegExp('</?' + opening[1] + '\\b[^>]*>', 'gi');
    tags.lastIndex = inner;
    let depth = 1, match;
    while ((match = tags.exec(html))) {
        depth += match[0].startsWith('</') ? -1 : 1;
        if (!depth) return { start, inner, end: match.index, after: tags.lastIndex };
    }
    throw new Error('Unclosed build target: ' + id);
}
function fill(html, id, content, hidden = false) {
    const e = element(html, id);
    let opening = html.slice(e.start, e.inner).replace(/\s+hidden(?=[\s>])/g, '');
    opening = opening.replace(/class="([^"]*)"/, (_, classes) => 'class="' + classes.split(/\s+/).filter(c => c !== 'hidden').join(' ') + '"');
    if (hidden) opening = opening.replace('class="', 'class="hidden ');
    return html.slice(0, e.start) + opening + content + html.slice(e.end);
}
function url(value) {
    const raw = String(value || '').trim();
    if (/^(https?:\/\/|\/[^/]|#)/i.test(raw)) return esc(encodeURI(raw));
    throw new Error('Invalid public URL: ' + raw);
}
function imageStyle(photo) {
    const pos = /^\d+(?:\.\d+)?% \d+(?:\.\d+)?%$/.test(photo.position || '') ? photo.position : '50% 50%';
    const scale = Math.max(100, Math.min(200, Number(photo.scale) || 100));
    return 'object-position:' + pos + ';transform:scale(' + scale / 100 + ')';
}
function thumbnail(image) {
    const thumb = image.replace(/\.[^/.]+$/, '-thumb.jpg');
    return image.startsWith('/images/') && fs.existsSync(path.join(ROOT, thumb.slice(1))) ? thumb : image;
}
function render(source, data) {
    const { about, gallery, shows, tribute, videos, site, social_proof } = data;
    let html = source;
    html = fill(html, 'about-photo', about.main_photo ? `<img src="${url(about.main_photo)}" alt="Denys Jackson" class="w-full h-full object-cover" decoding="async">` : '');
    html = fill(html, 'about-bio', String(about.bio_pt || '').split('\n').filter(p => p.trim()).map(p => `<p>${esc(p)}</p>`).join('\n'));
    for (const key of ['mission', 'objective', 'community']) html = fill(html, 'about-' + key, esc(about[key + '_pt']));
    const photos = gallery.photos.map(p => p.photo || p);
    html = fill(html, 'gallery-grid', photos.map((p, i) => `<div class="gallery-item" data-index="${i}" data-src="${url(p.image)}" data-caption="${esc(p.caption)}"><img src="${url(thumbnail(p.image))}" alt="${esc(p.caption || 'Denys Jackson em apresentação')}" loading="lazy" decoding="async" style="${imageStyle(p)}"><div class="overlay"><span>${esc(p.caption)}</span></div></div>`).join('\n'));
    html = fill(html, 'gallery-empty', photos.length ? '' : '<p data-i18n="media.photos_empty">Fotos serão adicionadas em breve.</p>', photos.length > 0);
    // Match the existing browser rule, including explicitly confirmed shows.
    const upcoming = shows.shows.filter(s => new Date(s.date) >= new Date() || s.status === 'confirmado').sort((a, b) => a.date.localeCompare(b.date));
    html = fill(html, 'shows-list', upcoming.map(s => {
        const date = new Date(s.date + 'T12:00:00Z');
        if (Number.isNaN(date.getTime())) throw new Error('Invalid show date: ' + s.date);
        const month = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][date.getUTCMonth()];
        const info = `<div class="show-date"><span class="day">${date.getUTCDate()}</span><span class="month">${month}</span></div><div class="show-info"><div class="venue">${esc(s.venue)}</div><div class="city">${esc(s.city)}</div>${s.time ? `<div class="time">${esc(s.time)}</div>` : ''}</div>`;
        const ticket = s.status === 'confirmado' && s.ticket_url ? `<a href="${url(s.ticket_url)}" target="_blank" rel="noopener" class="${s.banner ? 'show-banner-btn' : 'btn-primary text-sm py-2 px-4'}">Comprar ingresso</a>` : `<span class="show-status">${esc(({ esgotado: 'Esgotado', cancelado: 'Cancelado', confirmado: 'Confirmado' })[s.status] || s.status)}</span>`;
        if (s.banner) return `<div class="show-card-banner"><img src="${url(s.banner)}" alt="${esc(s.venue)}" class="show-banner-img"><div class="show-banner-overlay">${s.hide_info ? '' : `<div class="show-banner-info">${info}</div>`}${ticket}</div></div>`;
        return `<div class="show-card">${info}${ticket}</div>`;
    }).join('\n'), !upcoming.length);
    html = fill(html, 'shows-empty', upcoming.length ? '' : '<p data-i18n="schedule.empty">Em breve novos shows serão anunciados!</p><p data-i18n="schedule.follow">Siga nossas redes para não perder nenhuma novidade.</p>', upcoming.length > 0);
    html = fill(html, 'tribute-cards', tribute.cards.map(c => `<div class="glass-strong tribute-card p-6"><div class="flex items-center justify-between mb-4"><div><h3 class="text-lg font-bold text-slate-800">${esc(c.title_pt)}</h3><p class="text-sm text-dj-indigo font-medium">${esc(c.subtitle_pt)}</p></div><a href="${url(c.url || '#')}" class="btn-small" target="_blank" rel="noopener">Assistir</a></div><p class="text-slate-500 text-sm leading-relaxed">${esc(c.description_pt)}</p></div>`).join('\n'));
    html = fill(html, 'videos-grid', videos.videos.map(v => {
        const input = String(v.youtube_id || '');
        const id = /^[\w-]{11}$/.test(input) ? input : input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})(?:[?&#/]|$)/)?.[1];
        if (!id) throw new Error('Invalid YouTube ID');
        return `<div class="video-card"><a class="video-thumb" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener"><img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="${esc(v.title)}" loading="lazy"></a><div class="video-info"><h4>${esc(v.title)}</h4><p>${esc(v.description)}</p></div></div>`;
    }).join('\n'));
    html = fill(html, 'videos-empty', videos.videos.length ? '' : '<p data-i18n="media.videos_empty">Vídeos serão adicionados em breve.</p>', videos.videos.length > 0);
    html = fill(html, 'social-proof-grid', social_proof.logos.map(l => {
        const content = l.image ? `<img src="${url(l.image)}" alt="${esc(l.name)}" class="media-logo-img h-16 md:h-20 object-contain" loading="lazy" style="${imageStyle(l)}">` : esc(l.name);
        return l.url ? `<a href="${url(l.url)}" target="_blank" rel="noopener" class="glass media-logo-card p-6 block">${content}</a>` : `<div class="glass media-logo-card p-6">${content}</div>`;
    }).join('\n'));
    html = fill(html, 'contact-email', esc(site.email)).replace(/(<a\b[^>]*id="contact-email"[^>]*href=")[^"]*/, '$1mailto:' + esc(site.email));
    html = fill(html, 'contact-phone', esc(site.phone));
    let digits = String(site.phone || '').replace(/\D/g, '');
    if (digits && !digits.startsWith('55')) digits = '55' + digits;
    html = html.replace(/(<a\b[^>]*id="contact-phone"[^>]*href=")[^"]*/, '$1https://wa.me/' + digits);
    html = fill(html, 'footer-cnpj', 'CNPJ ' + esc(site.cnpj));
    html = html.replace(/<title>[^<]*<\/title>/, () => '<title>' + esc(site.site_name) + '</title>');
    // Content remains visible even when scripts are disabled or fail to load.
    html = html.replace(/class="([^"]*)"/g, (_, c) => 'class="' + c.split(/\s+/).filter(x => x !== 'fade-in').join(' ') + '"');
    return html;
}
function build(output = path.join(ROOT, '_site')) {
    output = path.resolve(output);
    if (output !== path.join(ROOT, '_site')) throw new Error('Build output must be the project _site directory');
    const data = Object.fromEntries(['about', 'gallery', 'shows', 'tribute', 'videos', 'site', 'social_proof'].map(name => [name, read(name)]));
    const html = render(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), data);
    // Publish only public assets. Git, dependencies, local APIs and backups stay out.
    fs.mkdirSync(output, { recursive: true });
    for (const name of ['admin', 'content', 'css', 'js', 'images', 'CNAME', 'robots.txt', 'sitemap.xml']) {
        fs.cpSync(path.join(ROOT, name), path.join(output, name), { recursive: true, filter: p => !p.endsWith('.bak') });
    }
    fs.writeFileSync(path.join(output, 'index.html'), html);
    require('./build-home-prototype').buildHomePrototype();
    console.log('Static HTML generated: ' + data.gallery.photos.length + ' photos; CMS content included.');
    return html;
}
module.exports = { build, render, element };
if (require.main === module) build();
