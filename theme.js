/*
 * theme.js
 * Stogie Candles
 *
 * Handles the light/dark theme toggle across the site.
 * Saves the user's preference to localStorage so it persists
 * between visits. Also recolors the footer logo using canvas
 * so it matches whichever theme is active.
 */


/* Applies the selected theme by toggling the "dark" class on the body.
   Also swaps the sun/moon icons in both the mobile and desktop nav. */
function setTheme(dark) {
    document.body.classList.toggle('dark', dark);

    // show sun in light mode, moon in dark mode
    ['icon-sun', 'icon-sun-lg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = dark ? 'none' : '';
    });
    ['icon-moon', 'icon-moon-lg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = dark ? '' : 'none';
    });
}


/* Recolors the footer logo to match the current theme.
   We only ship one logo file (darkStogie.png). This function
   draws it onto a hidden canvas, fills the shape with the
   theme's gold color using source-in compositing, then swaps
   the image src with the recolored version. */
function recolorFooterLogos() {
    const color = getComputedStyle(document.body)
        .getPropertyValue('--footer-muted').trim();

    document.querySelectorAll('.footer-logo').forEach(img => {
        // store the original src so we can reload it on theme change
        const src = img.dataset.originalSrc || img.getAttribute('src');
        img.dataset.originalSrc = src;

        const temp = new Image();
        temp.crossOrigin = 'anonymous';

        temp.onload = () => {
            const c   = document.createElement('canvas');
            c.width   = temp.naturalWidth;
            c.height  = temp.naturalHeight;
            const ctx = c.getContext('2d');

            // draw original, then fill the visible pixels with the new color
            ctx.drawImage(temp, 0, 0);
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, c.width, c.height);

            img.src = c.toDataURL();
        };

        temp.src = src;
    });
}


/* On page load, check if the user previously chose dark mode.
   If nothing is saved, default to light (warm cream palette). */
const savedTheme = localStorage.getItem('theme');
setTheme(savedTheme === 'dark');
recolorFooterLogos();


/* Toggle buttons — one in the mobile nav (#theme-toggle) and
   one in the desktop nav (#theme-toggle-lg). Both do the same
   thing: flip the theme, update icons, save preference, and
   recolor the footer logo. */
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
