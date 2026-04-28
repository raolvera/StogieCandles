/*
 * theme.js
 * Stogie Candles — Light/Dark mode toggle
 *
 * Controls theme switching between the warm cream (light) and
 * speakeasy dark palette. Persists user preference in localStorage
 * and recolors the footer logo via canvas compositing so it
 * always matches the active theme.
 */


// ── Theme Application ──────────────────────────────────────────

function setTheme(dark) {
    document.body.classList.toggle('dark', dark);

    // swap sun/moon icons (mobile + desktop versions)
    ['icon-sun', 'icon-sun-lg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = dark ? 'none' : '';
    });
    ['icon-moon', 'icon-moon-lg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = dark ? '' : 'none';
    });
}


// ── Footer Logo Recolor ────────────────────────────────────────
// The footer logo (darkStogie.png) ships as a single color.
// Instead of maintaining two separate files we redraw it on a
// hidden canvas using "source-in" compositing so the fill color
// always matches --footer-muted from the active theme.

function recolorFooterLogos() {
    const color = getComputedStyle(document.body)
        .getPropertyValue('--footer-muted').trim();

    document.querySelectorAll('.footer-logo').forEach(img => {
        const src = img.dataset.originalSrc || img.getAttribute('src');
        img.dataset.originalSrc = src;

        const temp = new Image();
        temp.crossOrigin = 'anonymous';

        temp.onload = () => {
            const c   = document.createElement('canvas');
            c.width   = temp.naturalWidth;
            c.height  = temp.naturalHeight;
            const ctx = c.getContext('2d');

            ctx.drawImage(temp, 0, 0);
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, c.width, c.height);

            img.src = c.toDataURL();
        };

        temp.src = src;
    });
}


// ── Init ───────────────────────────────────────────────────────
// Default to light when no preference has been saved yet.

const savedTheme = localStorage.getItem('theme');
setTheme(savedTheme === 'dark');
recolorFooterLogos();


// ── Toggle Buttons ─────────────────────────────────────────────
// Two buttons exist: #theme-toggle (mobile nav) and
// #theme-toggle-lg (desktop nav). Both do the same thing.

['theme-toggle', 'theme-toggle-lg'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark');

        ['icon-sun', 'icon-sun-lg'].forEach(i => {
            const el = document.getElementById(i);
            if (el) el.style.display = isDark ? 'none' : '';
        });
        ['icon-moon', 'icon-moon-lg'].forEach(i => {
            const el = document.getElementById(i);
            if (el) el.style.display = isDark ? '' : 'none';
        });

        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        recolorFooterLogos();
    });
});
