/* Foreground supervisor: Ctrl+C stops only its own children. Never deploys or pushes. */
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { ROOT, TOOLS, assertDevelopment, verifyCmsAsset } = require('./development-tools');
async function main() {
    assertDevelopment();
    verifyCmsAsset();
    const decap = path.join(TOOLS, 'node_modules', 'decap-server', 'dist', 'index.js');
    if (!fs.existsSync(decap)) throw new Error('Execute node scripts/setup-development.js primeiro.');
    for (const port of [8080, 8081, 8082]) {
        await new Promise((resolve, reject) => {
            const probe = net.createServer();
            probe.once('error', () => reject(new Error('Porta ' + port + ' ocupada. Nenhum processo existente foi encerrado.')));
            probe.listen(port, () => probe.close(resolve));
        });
    }
    const children = [];
    let stopping = false;
    function stop(code) {
        if (stopping) return;
        stopping = true;
        process.exitCode = code;
        for (const child of children) if (child.exitCode === null) child.kill();
    }
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop(0));
    for (const [name, script, extra] of [
        ['site', path.join(ROOT, 'scripts/serve-static.js'), { DJ_SITE_PORT: '8080' }],
        ['api', path.join(ROOT, 'scripts/local-api.js'), { DJ_LOCAL_API_PORT: '8082' }],
        ['cms', decap, { PORT: '8081', BIND_HOST: '127.0.0.1', MODE: 'fs', GIT_REPO_DIRECTORY: ROOT, ORIGIN: 'http://localhost:8080' }]
    ]) {
        const child = spawn(process.execPath, [script], { cwd: ROOT, env: { ...process.env, ...extra }, stdio: ['ignore', 'pipe', 'pipe'] });
        children.push(child);
        child.stdout.on('data', data => process.stdout.write('[' + name + '] ' + data));
        child.stderr.on('data', data => process.stderr.write('[' + name + '] ' + data));
        child.on('error', error => { console.error(error.message); stop(1); });
        child.on('exit', code => { if (!stopping) { console.error(name + ' encerrou (' + code + ').'); stop(1); } });
    }
    for (let attempt = 0; attempt < 40; attempt++) {
        if (stopping) return;
        try {
            const [site, api, cms] = await Promise.all([
                fetch('http://127.0.0.1:8080/admin/cms-local.js'),
                fetch('http://127.0.0.1:8082/api/health'),
                fetch('http://127.0.0.1:8081/api/v1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"action":"info"}' })
            ]);
            if (site.ok && api.ok && cms.ok && (await api.json()).ok) {
                console.log('PRONTO: site, API e CMS local respondem. Nenhum conteúdo foi publicado.');
                return;
            }
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.error('Serviços não ficaram prontos no prazo.');
    stop(1);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
