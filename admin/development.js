/* Shared destination and write guards for the development admin. */
(function () {
    'use strict';
    var repo = 'eudenysjackson/sitedenysjackson';
    var branch = 'development/novo-site';
    var host = location.hostname.toLowerCase().replace(/\.$/, '');
    var local = ['localhost', '127.0.0.1', '[::1]', '::1'].indexOf(host) !== -1;
    var production = host === 'denysjackson.com.br' || host.endsWith('.denysjackson.com.br');
    if (production) {
        document.body.textContent = 'Este painel de desenvolvimento não pode ser usado no domínio oficial.';
        throw new Error('Admin de desenvolvimento bloqueado em produção.');
    }

    function assertRemoteWrite() {
        if (local) throw new Error('Modo local: gravação no GitHub bloqueada.');
    }

    function validateConfig(text) {
        var backend = /^backend:\s*\n((?:[ \t]+[^\n]*\n|\s*\n)*)/m.exec(text + '\n');
        function field(name) {
            var match = backend && new RegExp('^  ' + name + ': +([^\\n#]+)', 'm').exec(backend[1]);
            return match ? match[1].trim() : '';
        }
        if (field('name') !== 'github' || field('repo') !== repo || field('branch') !== branch) {
            throw new Error('Configuração CMS bloqueada: destino diferente da branch de desenvolvimento.');
        }
    }

    // Guard the CMS's own REST writes as well as the custom panels' fetch calls.
    // New/unknown write routes fail closed; no authentication value is inspected.
    var nativeFetch = window.fetch.bind(window);
    window.fetch = async function (input, options) {
        var url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, location.href);
        var method = ((options && options.method) || input.method || 'GET').toUpperCase();
        if (url.hostname === 'api.github.com' && method !== 'GET' && method !== 'HEAD') {
            assertRemoteWrite();
            var raw = options && options.body;
            if (raw === undefined && typeof input.clone === 'function') raw = await input.clone().text();
            var body;
            try { body = JSON.parse(raw || '{}'); } catch (e) { throw new Error('Gravação GitHub bloqueada: corpo inválido.'); }
            var prefix = '/repos/' + repo + '/';
            var pathname = decodeURIComponent(url.pathname);
            var route = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : '';
            var allowed = false;
            if (route.startsWith('contents/') && ['PUT', 'DELETE'].indexOf(method) !== -1) {
                allowed = body.branch === branch;
            } else if (['git/blobs', 'git/trees', 'git/commits'].indexOf(route) !== -1 && method === 'POST') {
                allowed = true; // Unreferenced objects; publishing requires a permitted ref update below.
            } else if (route === 'git/refs/heads/' + branch && method === 'PATCH') {
                allowed = !body.force;
            } else if (route === 'git/refs' && method === 'POST') {
                allowed = body.ref === 'refs/heads/' + branch;
            }
            if (!allowed) throw new Error('Gravação GitHub bloqueada: somente a branch de desenvolvimento é permitida.');
        }
        return nativeFetch(input, options);
    };

    window.DJAdmin = Object.freeze({
        repo: repo,
        branch: branch,
        local: local,
        assertRemoteWrite: assertRemoteWrite,
        validateConfig: validateConfig
    });
})();
