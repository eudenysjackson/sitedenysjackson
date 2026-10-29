/* No network, tokens or repository writes: browser/API boundaries use fakes. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const BRANCH = 'development/novo-site';
const API = 'https://api.github.com/repos/eudenysjackson/sitedenysjackson/';

function browser(host = 'preview.example.test') {
    const calls = [];
    const c = vm.createContext({
        URL, Request, console, btoa: value => Buffer.from(value, 'binary').toString('base64'), location: { hostname: host, href: 'https://' + host + '/admin/' },
        document: { body: { textContent: '' }, addEventListener() {} },
        fetch: async (url, options) => {
            calls.push({ url: String(url), options });
            return { ok: true, json: async () => ({ path: '/images/uploads/test.jpg' }) };
        }
    });
    c.window = c;
    vm.runInContext(read('admin/development.js'), c);
    return { c, calls };
}

for (const host of ['denysjackson.com.br', 'www.denysjackson.com.br', 'www.denysjackson.com.br.']) {
    test('production admin blocked: ' + host, () => assert.throws(() => browser(host), /bloqueado em produção/));
}

test('CMS destination must match development before initialization', () => {
    const { c } = browser();
    const config = read('admin/config.yml');
    c.DJAdmin.validateConfig(config);
    assert.throws(() => c.DJAdmin.validateConfig(config.replace(BRANCH, 'main')), /Configuração CMS bloqueada/);
    assert.throws(() => c.DJAdmin.validateConfig(config.replace('eudenysjackson/sitedenysjackson', 'other/repo')), /bloqueada/);
});

for (const [name, route, method, body] of [
    ['contents main', 'contents/content/site.json', 'PUT', { branch: 'main' }],
    ['contents default branch', 'contents/content/site.json', 'PUT', {}],
    ['delete from main', 'contents/images/uploads/test.jpg', 'DELETE', { branch: 'main' }],
    ['production ref', 'git/refs/heads/main', 'PATCH', { sha: 'test' }],
    ['encoded production ref', 'git/refs/heads/%6dain', 'PATCH', { sha: 'test' }],
    ['create production ref', 'git/refs', 'POST', { ref: 'refs/heads/main' }],
    ['unknown mutation', 'pulls', 'POST', {}]
]) {
    test('reject before network: ' + name, async () => {
        const { c, calls } = browser();
        await assert.rejects(c.fetch(API + route, { method, body: JSON.stringify(body) }), /bloqueada/);
        assert.equal(calls.length, 0);
    });
}

test('wrong repository and GraphQL writes rejected', async () => {
    const { c, calls } = browser();
    for (const url of ['https://api.github.com/repos/other/repo/contents/test', 'https://api.github.com/graphql']) {
        await assert.rejects(c.fetch(url, { method: 'POST', body: '{}' }), /bloqueada/);
    }
    assert.equal(calls.length, 0);
});

test('development contents, staging objects and only the development ref can be written', async () => {
    const { c, calls } = browser();
    for (const [route, method, body] of [
        ['contents/content/gallery.json', 'PUT', { branch: BRANCH }],
        ['git/blobs', 'POST', { content: 'test' }],
        ['git/trees', 'POST', {}],
        ['git/commits', 'POST', {}],
        ['git/refs/heads/development%2Fnovo-site', 'PATCH', { sha: 'test', force: false }],
        ['git/refs', 'POST', { ref: 'refs/heads/' + BRANCH }]
    ]) await c.fetch(API + route, { method, body: JSON.stringify(body) });
    assert.equal(calls.length, 6);
});

test('Request objects are guarded, not just URL/options calls', async () => {
    const { c, calls } = browser();
    await assert.rejects(c.fetch(new Request(API + 'contents/test', {
        method: 'PUT', body: JSON.stringify({ branch: 'main' })
    })), /bloqueada/);
    assert.equal(calls.length, 0);
});

for (const host of ['localhost', '127.0.0.1', '[::1]']) {
    test('loopback cannot fall back to GitHub writes: ' + host, async () => {
        const { c, calls } = browser(host);
        await assert.rejects(c.fetch(API + 'contents/test', {
            method: 'PUT', body: JSON.stringify({ branch: BRANCH })
        }), /Modo local/);
        assert.equal(calls.length, 0);
    });
}

for (const [file, fn, args] of [
    ['admin/adjust.html', 'ghSave', ['content/site.json', '{}', 'sha', 'test']],
    ['admin/gallery-upload.html', 'ghPut', ['content/gallery.json', 'e30=', 'test', 'sha']]
]) {
    test(file + ' saves to development and catches a changed branch', async () => {
        const { c, calls } = browser();
        const html = read(file);
        assert(html.indexOf('src="development.js"') < html.indexOf('var REPO'));
        const inline = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
            .map(m => m[1]).find(s => s.includes('var REPO'));
        vm.runInContext(inline.replace(/\n    init\(\);\s*$/, ''), c);
        await c[fn](...args);
        assert.equal(JSON.parse(calls[0].options.body).branch, BRANCH);
        c.BRANCH = 'main';
        await assert.rejects(c[fn](...args), /bloqueada/);
        assert.equal(calls.length, 1);
    });
}

function uploadBrowser(host) {
    const { c, calls } = browser(host);
    Object.assign(c, {
        LOCAL_API: 'http://localhost:8082', REPO: c.DJAdmin.repo, BRANCH,
        slugify: () => 'test', readFileBase64: async () => 'e30=',
        isLocal: () => c.DJAdmin.local, getGithubToken: () => 'FAKE_TEST_VALUE'
    });
    const src = read('admin/cms-extensions.js');
    const start = src.indexOf('    async function uploadImageFile(');
    const end = src.indexOf('\n    injectGalleryStyles();', start);
    vm.runInContext(src.slice(start, end), c);
    return { c, calls };
}

test('CMS remote upload never calls the visitor loopback API', async () => {
    const { c, calls } = uploadBrowser('preview.example.test');
    await c.uploadImageFile({ name: 'test.jpg' });
    assert.equal(calls.length, 1);
    assert(calls[0].url.startsWith(API + 'contents/images/uploads/'));
    assert.equal(JSON.parse(calls[0].options.body).branch, BRANCH);
});

test('failed local upload never falls back to GitHub', async () => {
    const { c } = uploadBrowser('localhost');
    const calls = [];
    c.fetch = async url => { calls.push(url); return { ok: false }; };
    await assert.rejects(c.uploadImageFile({ name: 'test.jpg' }), /Upload local falhou/);
    assert.deepEqual(calls, ['http://localhost:8082/api/upload']);
});

function localApi(branch) {
    let handler;
    const writes = [];
    const c = vm.createContext({
        __dirname, console: { log() {} }, Buffer, process: { env: {} },
        require(name) {
            if (name === 'http') return { createServer(fn) { handler = fn; return { listen() {} }; } };
            if (name === 'path') return path;
            if (name === 'fs') return { existsSync: () => true, writeFileSync: (...args) => writes.push(args) };
            if (name === 'child_process') return { execFileSync() {
                if (branch === null) throw new Error('not a checkout');
                return branch + '\n';
            } };
            if (name === './image-optimize') return { hasSharp: () => false, thumbRelPath: p => p };
            throw new Error(name);
        }
    });
    vm.runInContext(read('scripts/local-api.js'), c);
    async function request(url, data) {
        let status, body;
        await handler({ url, method: 'POST', on(event, fn) {
            if (event === 'data') fn(JSON.stringify(data));
            if (event === 'end') fn();
        } }, { setHeader() {}, writeHead(code) { status = code; }, end(text) { body = JSON.parse(text); } });
        return { status, body };
    }
    return { request, writes };
}

for (const branch of ['main', 'work', '', null]) {
    test('local API rejects writes in checkout ' + String(branch), async () => {
        const api = localApi(branch);
        for (const route of ['/api/gallery', '/api/upload', '/api/compress-gallery']) {
            assert.equal((await api.request(route, {})).status, 409);
        }
        assert.equal(api.writes.length, 0);
    });
}

test('local API accepts development gallery and upload without touching real files', async () => {
    const api = localApi(BRANCH);
    assert.equal((await api.request('/api/gallery', { photos: [] })).status, 200);
    assert.equal((await api.request('/api/upload', { filename: 'test.jpg', data: 'e30=' })).status, 200);
    assert.equal(api.writes.length, 2);
});

test('real HTTP API isolates files and refuses a main checkout', { timeout: 15000 }, async t => {
    const { execFileSync, spawn } = require('node:child_process');
    const { once } = require('node:events');
    const os = require('node:os');
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'dj-admin-isolation-'));
    fs.mkdirSync(path.join(fixture, 'scripts'));
    fs.mkdirSync(path.join(fixture, 'content'));
    fs.mkdirSync(path.join(fixture, 'images/uploads'), { recursive: true });
    for (const file of ['local-api.js', 'image-optimize.js']) {
        fs.copyFileSync(path.join(ROOT, 'scripts', file), path.join(fixture, 'scripts', file));
    }
    const gallery = path.join(fixture, 'content/gallery.json');
    fs.writeFileSync(gallery, '{"photos":[]}\n');
    execFileSync('git', ['init', '-b', 'main', fixture], { stdio: 'ignore' });
    const child = spawn(process.execPath, ['scripts/local-api.js'], {
        cwd: fixture, env: { ...process.env, DJ_LOCAL_API_PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe']
    });
    t.after(async () => {
        if (child.exitCode === null && child.signalCode === null) {
            const exited = once(child, 'exit');
            child.kill();
            await exited;
        }
        fs.rmSync(fixture, { recursive: true, force: true });
    });
    const port = await new Promise((resolve, reject) => {
        let output = '';
        child.stdout.on('data', data => {
            output += data;
            const match = output.match(/localhost:(\d+)/);
            if (match) resolve(match[1]);
        });
        child.once('error', reject);
        child.once('exit', code => reject(new Error('API exited before readiness: ' + code)));
    });
    const base = 'http://127.0.0.1:' + port;
    assert.deepEqual(await (await fetch(base + '/api/health')).json(), { ok: true });
    async function post(route, data) {
        return fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    }
    assert.equal((await post('/api/gallery', { photos: [{ caption: 'blocked' }] })).status, 409);
    assert.equal((await post('/api/upload', { filename: 'blocked.jpg', data: 'e30=' })).status, 409);
    assert.equal(fs.readFileSync(gallery, 'utf8'), '{"photos":[]}\n');
    assert.equal(fs.existsSync(path.join(fixture, 'images/uploads/blocked.jpg')), false);
    execFileSync('git', ['symbolic-ref', 'HEAD', 'refs/heads/' + BRANCH], { cwd: fixture });
    const data = { photos: [{ caption: 'only in temporary development fixture' }] };
    assert.equal((await post('/api/gallery', data)).status, 200);
    assert.deepEqual(JSON.parse(fs.readFileSync(gallery, 'utf8')), data);
    assert.equal((await post('/api/upload', { filename: 'test.jpg', data: 'e30=' })).status, 200);
    assert.equal(fs.readFileSync(path.join(fixture, 'images/uploads/test.jpg'), 'utf8'), '{}');
});
