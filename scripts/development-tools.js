const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const TOOLS = process.env.DJ_DEV_TOOLS_DIR || path.join(path.dirname(ROOT), 'shared', 'dj-development-tools');
const CMS_ASSET = path.join(TOOLS, 'assets', 'decap-cms-3.3.0.js');
const CMS_SHA256 = '5e5b9c56ca14442b83d58a4494ccc7c9381d23327af4107fd875c1402623e804';
function assertDevelopment(root = ROOT) {
    const branch = execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim();
    if (branch !== 'development/novo-site') throw new Error('Use a branch development/novo-site antes de iniciar o desenvolvimento.');
}
function verifyCmsAsset() {
    if (crypto.createHash('sha256').update(fs.readFileSync(CMS_ASSET)).digest('hex') !== CMS_SHA256) {
        throw new Error('Integridade do CMS local inválida. Execute setup-development.js para restaurar o pacote oficial.');
    }
    return CMS_ASSET;
}
module.exports = { ROOT, TOOLS, CMS_ASSET, assertDevelopment, verifyCmsAsset };
