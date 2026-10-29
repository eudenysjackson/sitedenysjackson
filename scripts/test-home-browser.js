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
        const url = 'http://127.0.0.1:' + port + '/_site/prototipo/index.html';
        await page.goto(url);
        await page.getByRole('button', { name: 'EN', exact: true }).waitFor();
        await page.waitForFunction(() => !document.querySelector('[data-lang="en"]').disabled);
        await page.evaluate(() => document.fonts.ready);
        assert(await page.evaluate(() => [...document.fonts].some(font => font.family === 'Inter' && font.status === 'loaded')));
        for (const width of [320, 390, 768, 1440]) {
            await page.setViewportSize({ width, height: 1000 });
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Overflow at ' + width);
        }
        await page.setViewportSize({ width: 1440, height: 1000 });
        assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
        assert.equal(await page.locator('[data-home-material]').count(), 5);
        // Reuse the original glass treatment, including translucency and blur.
        const glass = await page.locator('.artist > .glass').evaluate(node => {
            const css = getComputedStyle(node);
            return { background: css.backgroundColor, blur: css.backdropFilter, radius: css.borderRadius };
        });
        assert.equal(glass.background, 'rgba(255, 255, 255, 0.55)');
        assert.equal(glass.blur, 'blur(16px)');
        assert.equal(glass.radius, '20px');
        assert((await page.locator('.home-brand img').getAttribute('src')).endsWith('logopreta.png'));
        const images = await page.locator('[data-home-image]').evaluateAll(nodes => nodes.every(image => image.complete && image.naturalWidth > 0));
        assert(images, 'Local photographs must load');
        await page.locator('.bad-photo').scrollIntoViewIfNeeded();
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(artifacts, 'home-desktop.png') });
        await page.screenshot({ path: path.join(artifacts, 'home-desktop-completa.png'), fullPage: true });
        await page.locator('#artista').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(artifacts, 'home-vidro.png') });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole('button', { name: 'EN', exact: true }).click();
        assert.equal(await page.locator('html').getAttribute('lang'), 'en');
        assert.equal(await page.locator('[data-i18n="home.hire"]').first().textContent(), 'Book the show');
        await page.reload();
        await page.waitForFunction(() => document.documentElement.lang === 'en');
        await page.getByRole('button', { name: 'ES', exact: true }).click();
        assert.equal(await page.locator('[data-i18n="home.hire"]').first().textContent(), 'Contrata el espectáculo');
        await page.getByRole('button', { name: 'PT', exact: true }).click();
        await page.setViewportSize({ width: 390, height: 844 });
        const toggle = page.locator('#home-menu-toggle');
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        assert(await toggle.evaluate(node => node === document.activeElement));
        await page.getByRole('heading', { level: 1 }).click();
        await page.screenshot({ path: path.join(artifacts, 'home-mobile.png') });
        const noJs = await browser.newContext({ javaScriptEnabled: false });
        const staticPage = await noJs.newPage();
        await staticPage.goto(url);
        assert.equal(await staticPage.getByRole('heading', { level: 1 }).count(), 1);
        assert.equal(await staticPage.locator('[data-home-material]').count(), 5);
        assert((await staticPage.locator('body').innerText()).includes('Performance com fonogramas'));
        await noJs.close();
        assert.deepEqual(errors, []);
        assert.deepEqual(external, [], 'Prototype must not depend on third-party resources to render');
        console.log('OK: desktop/mobile, Inter local, images, PT/EN/ES persistence, keyboard menu and no-JS content.');
        console.log('Screenshots: ' + artifacts);
    } finally {
        if (browser) await browser.close();
        if (child.exitCode === null && child.signalCode === null) {
            const exit = once(child, 'exit'); child.kill(); await exit;
        }
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
