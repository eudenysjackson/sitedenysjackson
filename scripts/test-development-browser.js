/* Real local CMS/browser round trip in a disposable checkout; no external requests. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn, execFileSync } = require('node:child_process');
const { once } = require('node:events');
const { ROOT, TOOLS, verifyCmsAsset } = require('./development-tools');
const { chromium } = require(path.join(TOOLS, 'node_modules', 'playwright-core'));
const artifacts = path.join(TOOLS, 'test-results');
function json(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
async function until(check, message) {
    for (let attempt = 0; attempt < 60; attempt++) {
        if (check()) return;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(message);
}
async function main() {
    verifyCmsAsset();
    fs.mkdirSync(artifacts, { recursive: true });
    const originals = Object.fromEntries(['site', 'gallery', 'shows', 'social_proof', 'home'].map(name =>
        [name, fs.readFileSync(path.join(ROOT, 'content', name + '.json'), 'utf8')]));
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'dj-cms-browser-'));
    for (const item of ['admin', 'content', 'css', 'js', 'scripts', 'index.html']) {
        fs.cpSync(path.join(ROOT, item), path.join(fixture, item), { recursive: true });
    }
    fs.mkdirSync(path.join(fixture, 'images/uploads'), { recursive: true });
    execFileSync('git', ['init', '-b', 'development/novo-site', fixture], { stdio: 'ignore' });
    const child = spawn(process.execPath, ['scripts/develop.js'], {
        cwd: fixture, env: { ...process.env, DJ_DEV_TOOLS_DIR: TOOLS }, stdio: ['ignore', 'pipe', 'pipe']
    });
    let browser;
    let errors = '';
    child.stderr.on('data', data => { errors += data; });
    try {
        await new Promise((resolve, reject) => {
            let output = '';
            const timer = setTimeout(() => reject(new Error('Startup timeout: ' + errors)), 25000);
            child.stdout.on('data', data => {
                output += data;
                if (output.includes('PRONTO:')) { clearTimeout(timer); resolve(); }
            });
            child.once('exit', code => { clearTimeout(timer); reject(new Error('Startup failed: ' + code + ' ' + errors)); });
            child.once('error', reject);
        });
        const executablePath = process.env.DJ_CHROMIUM_PATH || [
            '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            'C:/Program Files/Google/Chrome/Application/chrome.exe', chromium.executablePath()
        ].find(candidate => fs.existsSync(candidate));
        if (!executablePath) throw new Error('Defina DJ_CHROMIUM_PATH com um Chromium/Chrome instalado.');
        browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        const pageErrors = [];
        page.on('pageerror', error => pageErrors.push(error.message));
        await page.route('**/*', route => {
            const host = new URL(route.request().url()).hostname;
            return ['localhost', '127.0.0.1'].includes(host) ? route.continue() : route.abort();
        });
        await page.goto('http://localhost:8080/admin/');
        await page.getByRole('button', { name: 'Entrar', exact: true }).click();
        await page.getByText('Informações Gerais', { exact: true }).click();
        assert.equal(await page.evaluate(() => window.__DJ_GALLERY_MANAGER__), true);
        const marker = 'Desenvolvimento validado em cópia temporária';
        await page.getByLabel('Slogan', { exact: true }).fill(marker);
        await page.getByRole('button', { name: 'Publicar', exact: true }).click();
        await page.getByText('Publicar agora', { exact: true }).click();
        await until(() => json(path.join(fixture, 'content/site.json')).tagline === marker, 'CMS did not persist edit');
        await page.reload();
        await page.getByLabel('Slogan', { exact: true }).waitFor();
        assert.equal(await page.getByLabel('Slogan', { exact: true }).inputValue(), marker);
        await page.screenshot({ path: path.join(artifacts, 'cms-editor.png') });
        console.log('OK: login local, widget personalizado, edição CMS e persistência após reload.');

        await page.goto('http://localhost:8080/admin/#/collections/home_prototype');
        await page.getByText('Textos e imagens da nova Home', { exact: true }).click();
        await page.getByText('Textos por idioma', { exact: true }).filter({ visible: true }).last().getByTestId('expand-button').click();
        await page.getByText('Ir para o conteúdo', { exact: true }).filter({ visible: true }).last().getByTestId('expand-button').click();
        await page.getByLabel('Português', { exact: true }).filter({ visible: true }).first().fill('Ir ao conteúdo de teste');
        await page.getByRole('button', { name: 'Publicar', exact: true }).click();
        await page.getByText('Publicar agora', { exact: true }).click();
        await page.screenshot({ path: path.join(artifacts, 'home-cms-saved.png') });
        await until(() => json(path.join(fixture, 'content/home.json')).copy.skip.pt === 'Ir ao conteúdo de teste', 'New Home collection did not save');
        console.log('OK: coleção da nova Home edita o JSON multilíngue no CMS real.');

        await page.goto('http://localhost:8080/admin/gallery-upload.html');
        await page.locator('#file-input').setInputFiles({
            name: 'teste.png', mimeType: 'image/png',
            buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z6AAAAABJRU5ErkJggg==', 'base64')
        });
        await page.locator('#caption').fill('Upload em cópia temporária');
        await page.getByRole('button', { name: 'Salvar localmente', exact: true }).click();
        await until(() => json(path.join(fixture, 'content/gallery.json')).photos.some(p => p.caption === 'Upload em cópia temporária'), 'Upload panel did not save');
        const uploaded = json(path.join(fixture, 'content/gallery.json')).photos.find(p => p.caption === 'Upload em cópia temporária');
        assert(fs.existsSync(path.join(fixture, uploaded.image.replace(/^\//, ''))));
        console.log('OK: upload real e edição de galeria somente no fixture.');

        await page.goto('http://localhost:8080/admin/adjust.html');
        await page.locator('#hero-img').waitFor({ state: 'attached' });
        await page.locator('#hero-x').fill('37');
        await page.locator('#save-hero').click();
        await until(() => json(path.join(fixture, 'content/site.json')).hero_position.startsWith('37%'), 'Visual panel did not save locally');
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: path.join(artifacts, 'adjust-mobile.png') });
        console.log('OK: ajuste visual salvo localmente pelo painel.');
        assert.deepEqual(pageErrors, []);
    } finally {
        if (browser) await browser.close();
        if (child.exitCode === null && child.signalCode === null) {
            const exited = once(child, 'exit');
            child.kill('SIGTERM');
            await exited;
        }
        fs.rmSync(fixture, { recursive: true, force: true });
        for (const [name, original] of Object.entries(originals)) {
            assert.equal(fs.readFileSync(path.join(ROOT, 'content', name + '.json'), 'utf8'), original, 'Original changed: ' + name);
        }
    }
    console.log('PASSOU: navegador, CMS, galeria e ajustes. Nenhum conteúdo original foi alterado.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
