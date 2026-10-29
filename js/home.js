/* Home prototype: progressive enhancement; the built page is readable without JS. */
(function () {
    'use strict';
    document.documentElement.classList.add('home-js');
    let homeData = null;
    const menu = document.getElementById('home-nav');
    const toggle = document.getElementById('home-menu-toggle');
    toggle.hidden = false;
    function closeMenu() {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        menu.classList.toggle('is-open', open);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            closeMenu();
            toggle.focus();
        }
    });
    function syncLanguageButtons() {
        if (homeData) document.querySelectorAll('[data-home-image]').forEach(image => {
            const key = image.dataset.homeImage + '_alt';
            image.alt = homeData.copy[key][currentLang] || homeData.copy[key].pt;
        });
        document.querySelectorAll('.lang-btn').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.lang === currentLang));
        });
    }
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', () => { setLanguage(button.dataset.lang); syncLanguageButtons(); });
    });
    Promise.all([
        fetch('../content/home.json', { cache: 'no-cache' }).then(response => {
            if (!response.ok) throw new Error('Home content unavailable');
            return response.json();
        }),
        fetch('../content/site.json', { cache: 'no-cache' }).then(response => response.ok ? response.json() : null).catch(() => null)
    ]).then(([data, site]) => {
        homeData = data;
        registerPageTranslations('home', data.copy);
        document.querySelectorAll('[data-home-image]').forEach(image => {
            const value = data.images[image.dataset.homeImage];
            if (!String(value).includes('..') && /^\/images\/[\w .()\/-]+\.(?:jpe?g|png|webp)$/i.test(value || '')) image.src = '..' + encodeURI(value);
        });
        document.querySelectorAll('[data-home-material]').forEach(link => {
            try {
                const url = new URL(data.materials[link.dataset.homeMaterial]);
                if (url.protocol === 'https:' && url.hostname === 'drive.google.com') link.href = url.href;
            } catch { /* Retain the pre-rendered link. */ }
        });
        if (site && /^[^\s<>"'@]+@[^\s<>"'@]+$/.test(site.email || '')) {
            document.querySelectorAll('[data-home-contact="email"]').forEach(link => {
                link.href = 'mailto:' + site.email;
                link.textContent = site.email;
            });
        }
        if (site && site.phone) {
            let digits = site.phone.replace(/\D/g, '');
            if (!digits.startsWith('55')) digits = '55' + digits;
            document.querySelectorAll('[data-home-contact="whatsapp"]').forEach(link => { link.href = 'https://wa.me/' + digits; });
        }
        initLanguage();
        syncLanguageButtons();
        document.querySelectorAll('.lang-btn').forEach(button => { button.disabled = false; });
    }).catch(() => { /* Keep the complete Portuguese fallback if a request fails. */ });
})();
