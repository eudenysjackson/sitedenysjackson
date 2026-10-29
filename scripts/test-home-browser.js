/* Read-only browser checks of the built prototype; external requests are blocked. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { ROOT, TOOLS } = require('./development-tools');
const { chromium } = require(path.join(TOOLS, 'node_modules/playwright-core'));
async function main() {
    if (!fs.existsSync(path.join(ROOT, '_site/prototipo/index.html'))) throw new Error('Run node scripts/build-static.js first.');
    const artifacts = path.join(TOOLS, 'test-results/home');
    fs.mkdirSync(artifacts, { recursive: true });
    const child = spawn(process.execPath, ['scripts/serve-static.js'], {
        cwd: ROOT, env: { ...process.env, DJ_SITE_PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe']
    });
    let browser;
    try {
        const port = await new Promise((resolve, reject) => {
            let out = '';
            const timer = setTimeout(() => reject(new Error('Server readiness timeout')), 10000);
            child.stdout.on('data', data => {
                out += data;
                const match = out.match(/localhost:(\d+)/);
                if (match) { clearTimeout(timer); resolve(match[1]); }
            });
            child.once('error', reject);
            child.once('exit', code => { clearTimeout(timer); reject(new Error('Server exited: ' + code)); });
        });
        const executablePath = process.env.DJ_CHROMIUM_PATH || [
            '/usr/bin/chromium', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            'C:/Program Files/Google/Chrome/Application/chrome.exe', chromium.executablePath()
        ].find(file => fs.existsSync(file));
        browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
        const context = await browser.newContext();
        const external = [];
        await context.route('**/*', route => {
            const host = new URL(route.request().url()).hostname;
            if (['localhost', '127.0.0.1'].includes(host)) return route.continue();
            external.push(route.request().url());
            return route.abort();
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const base = 'http://127.0.0.1:' + port + '/_site/prototipo/';
        const routes = require('./build-home-prototype').ROUTES;
        const localErrors = [];
        page.on('response', response => { if (response.status() >= 400) localErrors.push(response.url()); });
        for (const [route] of routes) {
            await page.goto(base + route);
            await page.evaluate(() => document.fonts.ready);
            assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1, route);
            for (const width of [320,390,768,1440]) {
                await page.setViewportSize({ width, height: 1000 });
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route + ' overflow at ' + width);
            }
            assert.equal(await page.locator('.review-desktop-nav [aria-current="page"]').count(), 1);
            await page.screenshot({ path: path.join(artifacts, route.replace('.html','') + '-desktop.png'), fullPage: true });
            await page.setViewportSize({ width:390, height:844 });
            await page.screenshot({ path: path.join(artifacts, route.replace('.html','') + '-mobile.png'), fullPage: true });
        }
        await page.goto(base + 'denys-jackson.html');
        await page.setViewportSize({ width:1440, height:1000 });
        const glass = await page.locator('#sobre .glass-strong').evaluate(node => {
            const css = getComputedStyle(node);
            return { background:css.backgroundColor, blur:css.backdropFilter, radius:css.borderRadius };
        });
        assert.deepEqual(glass, { background:'rgba(255, 255, 255, 0.72)', blur:'blur(20px)', radius:'20px' });
        assert(await page.evaluate(() => [...document.fonts].some(font => font.family === 'Inter' && font.status === 'loaded')));
        await page.locator('.review-desktop-nav [data-lang="en"]').click();
        assert.equal(await page.locator('html').getAttribute('lang'), 'en');
        await page.locator('.review-desktop-nav a[href="imprensa-contratacao.html"]').click();
        await page.waitForFunction(() => document.documentElement.lang === 'en');
        assert.equal(await page.locator('html').getAttribute('lang'), 'en');
        assert.equal(await page.locator('[data-home-material]').count(), 5);
        await page.reload();
        await page.waitForFunction(() => document.documentElement.lang === 'en');
        assert.equal(await page.locator('html').getAttribute('lang'), 'en');
        await page.locator('.review-desktop-nav [data-lang="es"]').click();
        assert.equal(await page.getByRole('heading', {level:1}).textContent(), 'Prensa y contratación');
        await page.locator('.review-desktop-nav [data-lang="pt"]').click();
        await page.setViewportSize({ width:390, height:844 });
        const toggle = page.locator('#menu-toggle');
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        await page.keyboard.press('Shift+Tab');
        assert.equal(await page.evaluate(() => document.activeElement.dataset.lang), 'es', 'Sidebar focus is contained');
        await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        assert(await toggle.evaluate(node => node === document.activeElement));
        await page.goto(base + 'na-ponta-dos-pes.html');
        const photo = page.locator('[data-photo]').first();
        await photo.click();
        assert(await page.locator('#lightbox').evaluate(node => node.open));
        await page.keyboard.press('Escape');
        assert(await photo.evaluate(node => node === document.activeElement));
        const noJs = await browser.newContext({ javaScriptEnabled:false });
        const staticPage = await noJs.newPage();
        for (const [route] of routes) {
            await staticPage.goto(base + route);
            assert.equal(await staticPage.getByRole('heading', {level:1}).count(), 1);
            assert(await staticPage.locator('main').innerText());
        }
        await noJs.close();
        assert.deepEqual(errors, []);
        assert.deepEqual(external, [], 'Rendering must use local resources');
        assert.deepEqual(localErrors, [], 'All local resources must exist');
        console.log('OK: 7 pages at 4 widths, original glass, local Inter, cross-page languages, keyboard sidebar, gallery and no-JS content.');
        console.log('Screenshots: ' + artifacts);
    } finally {
        if (browser) await browser.close();
        if (child.exitCode === null && child.signalCode === null) {
            const exit = once(child, 'exit'); child.kill(); await exit;
        }
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
