/* Tool installation stays outside the checkout; no application npm dependencies. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { execFileSync } = require('node:child_process');
const { TOOLS, CMS_ASSET, verifyCmsAsset } = require('./development-tools');
const npm = process.platform === 'win32' ? process.execPath : 'npm';
const npmPrefix = process.platform === 'win32'
    ? [process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')] : [];
if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Use Node 22 ou superior.');
fs.mkdirSync(TOOLS, { recursive: true });
function version(name) {
    try { return JSON.parse(fs.readFileSync(path.join(TOOLS, 'node_modules', name, 'package.json'), 'utf8')).version; }
    catch { return ''; }
}
if (version('decap-server') !== '3.11.6' || version('playwright-core') !== '1.57.0') {
    execFileSync(npm, [...npmPrefix, 'install', '--prefix', TOOLS, '--save-exact', '--no-audit', '--no-fund',
        'decap-server@3.11.6', 'playwright-core@1.57.0'], { cwd: TOOLS, stdio: 'inherit' });
}
const archive = path.join(TOOLS, 'decap-cms-3.3.0.tgz');
if (!fs.existsSync(archive)) {
    execFileSync(npm, [...npmPrefix, 'pack', 'decap-cms@3.3.0', '--pack-destination', TOOLS, '--ignore-scripts', '--json'],
        { cwd: TOOLS, stdio: ['ignore', 'pipe', 'inherit'] });
}
const bytes = fs.readFileSync(archive);
// Official npm dist.integrity for decap-cms@3.3.0; never accept a replacement checksum.
const integrity = 'al94wSKlehVsv4P8z4r2y8FoEiGyiDoistBn5+lbxquro+AKAwcgcC0HdnmgwCzutrVq9bjTsdYLdff6nyqVJQ==';
if (crypto.createHash('sha512').update(bytes).digest('base64') !== integrity) throw new Error('Pacote CMS não passou na verificação de integridade.');
const tar = zlib.gunzipSync(bytes);
let found = false;
for (let pos = 0; pos + 512 <= tar.length;) {
    const header = tar.subarray(pos, pos + 512);
    const name = header.subarray(0, 100).toString().replace(/\0.*$/s, '');
    if (!name) break;
    const size = parseInt(header.subarray(124, 136).toString().replace(/\0/g, '').trim(), 8);
    if (!Number.isFinite(size) || size < 0 || pos + 512 + size > tar.length) throw new Error('Arquivo tar CMS inválido.');
    if (name === 'package/dist/decap-cms.js') {
        fs.mkdirSync(path.dirname(CMS_ASSET), { recursive: true });
        fs.writeFileSync(CMS_ASSET, tar.subarray(pos + 512, pos + 512 + size));
        found = true;
        break;
    }
    pos += 512 + Math.ceil(size / 512) * 512;
}
if (!found) throw new Error('Bundle CMS não encontrado no pacote oficial.');
verifyCmsAsset();
console.log('Ferramentas prontas fora do checkout: Decap Server 3.11.6, CMS 3.3.0, Playwright Core 1.57.0.');
