const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { renderReviewPages, loadReviewData, ROUTES } = require('./build-home-prototype');
const data = loadReviewData();
for (const lang of ['pt','en','es']) {
    const pages = renderReviewPages(data, lang);
    assert.equal(Object.keys(pages).length, 7);
    const titles = new Set();
    const descriptions = new Set();
    for (const [name, html] of Object.entries(pages)) {
        assert.equal((html.match(/<h1\b/g) || []).length, 1, name + ' has one H1');
        assert(html.includes('name="robots" content="noindex, nofollow"'));
        assert(!html.includes('2026-11-14'), 'Unconfirmed date must not be advertised');
        titles.add(html.match(/<title>(.*?)<\/title>/)[1]);
        descriptions.add(html.match(/name="description" content="(.*?)"/)[1]);
        for (const [route] of ROUTES) assert(html.includes('href="' + route + '"'), name + ' links to ' + route);
        for (const [,key] of [...html.matchAll(/data-i18n="home\.([a-z_0-9]+)"/g)]) {
            const localized = JSON.parse(html.match(/id="review-copy" type="application\/json">(.*?)<\/script>/s)[1]);
            assert.equal(typeof localized[key][lang], 'string', name + '/' + key);
        }
    }
    assert.equal(titles.size, 7, 'Each page has its own title');
    assert.equal(descriptions.size, 7, 'Each page has its own description');
    const home = pages['index.html'];
    assert(!/2–8|464|90 min|data-home-material|Rider técnico|dublagem interpretativa/.test(home), 'Home excludes production specifications');
    assert(!home.includes('Nossa Missão'), 'Full biography is on its own page');
    assert(!home.includes('gallery-item'), 'Full gallery is on the show page');
    assert(pages['denys-jackson.html'].includes('glass-strong p-6 md:p-10 mb-6'), 'Reuse original biography panel');
    assert(pages['denys-jackson.html'].includes('grid md:grid-cols-5 gap-8 items-start md:items-stretch'), 'Preserve original photo/text proportions');
    assert.equal((pages['denys-jackson.html'].match(/class="glass p-6"/g) || []).length, 3, 'Preserve original mission/objective/community cards');
    assert.equal((pages['imprensa-contratacao.html'].match(/data-home-material=/g) || []).length, 5);
    assert(pages['imprensa-contratacao.html'].includes(data.home.copy.artist_history[lang]), 'Release available as HTML');
    assert.equal((pages['na-ponta-dos-pes.html'].match(/data-photo=/g) || []).length, data.gallery.photos.length);
}
const edited = structuredClone(data);
edited.home.copy.artist_body.pt = '<img src=x onerror=alert(1)> & CMS </script>';
const pages = renderReviewPages(edited);
assert(pages['index.html'].includes('&lt;img src=x onerror=alert(1)&gt;'));
assert(!pages['index.html'].includes('<img src=x'));
JSON.parse(pages['index.html'].match(/id="review-copy" type="application\/json">(.*?)<\/script>/s)[1]);
assert.throws(() => renderReviewPages({ ...data, site: { ...data.site, hero_image: '/images/../private.jpg' } }), /image path/);
assert.throws(() => renderReviewPages({ ...data, home: { ...data.home, materials: { ...data.home.materials, rider: 'javascript:alert(1)' } } }), /material URL/);
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8'), context);
context.registerPageTranslations('home', edited.home.copy);
assert.equal(vm.runInContext("translations.pt['home.artist_body']", context), '&lt;img src=x onerror=alert(1)&gt; &amp; CMS &lt;/script&gt;');
console.log('OK: seven pages, original components, concise Home, online press release, CMS text escaping and PT/EN/ES.');
