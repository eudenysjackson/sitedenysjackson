/* Shared interactions for the development review; no production CMS/network writes. */
(function () {
    'use strict';
    document.documentElement.classList.add('review-js');
    const copy = JSON.parse(document.getElementById('review-copy').textContent);
    registerPageTranslations('home', copy);
    initLanguage();
    const nav = document.getElementById('navbar');
    const home = document.body.classList.contains('review-home');
    const top = document.getElementById('back-to-top');
    function syncScroll() {
        nav.classList.toggle('scrolled', !home || window.scrollY > 50);
        top.classList.toggle('visible', window.scrollY > 500);
    }
    window.addEventListener('scroll', syncScroll, { passive: true });
    syncScroll();
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    const close = document.getElementById('sidebar-close');
    const surroundings = [nav, document.querySelector('main'), document.querySelector('footer'), top];
    function closeMenu(restoreFocus = true) {
        menu.hidden = true;
        overlay.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        surroundings.forEach(node => { node.inert = false; });
        if (restoreFocus) toggle.focus();
    }
    toggle.addEventListener('click', () => {
        menu.hidden = false;
        overlay.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        surroundings.forEach(node => { node.inert = true; });
        close.focus();
    });
    close.addEventListener('click', () => closeMenu());
    overlay.addEventListener('click', () => closeMenu());
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(false)));
    document.addEventListener('keydown', event => {
        if (menu.hidden) return;
        if (event.key === 'Escape') closeMenu();
        if (event.key === 'Tab') {
            const items = [...menu.querySelectorAll('a,button')];
            const first = items[0], last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });
    window.addEventListener('resize', () => { if (window.innerWidth >= 1100 && !menu.hidden) closeMenu(false); });
    function syncLanguage() {
        document.querySelectorAll('.lang-btn').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.lang === currentLang));
        });
    }
    document.querySelectorAll('.lang-btn').forEach(button => button.addEventListener('click', () => {
        setLanguage(button.dataset.lang);
        syncLanguage();
    }));
    syncLanguage();
    const dialog = document.getElementById('lightbox');
    if (dialog) {
        const image = document.getElementById('lightbox-img');
        const caption = document.getElementById('lightbox-caption');
        document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
            image.src = button.dataset.photo;
            image.alt = button.dataset.caption;
            caption.textContent = button.dataset.caption;
            dialog.showModal();
        }));
        document.getElementById('lightbox-close').addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
        dialog.addEventListener('close', () => { image.removeAttribute('src'); });
    }
})();
