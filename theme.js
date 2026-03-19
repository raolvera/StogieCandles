/* ═══════════════════════════════════════════════════════════════
   THEME.JS — Light/Dark Mode Toggle
   Handles theme switching, icon visibility, localStorage
   persistence, and footer logo recoloring via canvas.
   ═══════════════════════════════════════════════════════════════ */


/**
 * setTheme — Applies the selected theme to the page.
 * Toggles the "dark" class on <body> and shows/hides
 * the sun (light mode) and moon (dark mode) icons.
 * Two sets of icons exist: one for mobile, one for desktop.
 *
 * @param {boolean} dark — true for dark mode, false for light mode
 */
function setTheme(dark) {
    /* Add or remove the "dark" class on the body element */
    document.body.classList.toggle('dark', dark);

    /* Show sun icons in light mode, hide in dark mode */
    ['icon-sun', 'icon-sun-lg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = dark ? 'none' : '';
    });

    /* Show moon icons in dark mode, hide in light mode */
    ['icon-moon', 'icon-moon-lg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = dark ? '' : 'none';
    });
}


/**
 * recolorFooterLogos — Recolors the footer logo image to match
 * the current theme's --footer-muted color (gold #c5a059).
 *
 * How it works:
 * 1. Reads the --footer-muted CSS variable from the body
 * 2. Loads the original logo image into a temporary Image object
 * 3. Draws it onto a hidden canvas
 * 4. Uses "source-in" compositing to fill the logo shape with the target color
 * 5. Converts the canvas back to a data URL and sets it as the img src
 *
 * This approach gives exact color matching that CSS filters cannot achieve.
 * The original src is stored in data-original-src so it can be reloaded
 * when the theme changes.
 */
function recolorFooterLogos() {
    /* Get the current --footer-muted color from computed styles */
    const color = getComputedStyle(document.body).getPropertyValue('--footer-muted').trim();

    /* Process each footer logo image */
    document.querySelectorAll('.footer-logo').forEach(img => {
        /* Store the original image source on first run */
        const src = img.dataset.originalSrc || img.getAttribute('src');
        img.dataset.originalSrc = src;

        /* Create a temporary image to load the original */
        const temp = new Image();
        temp.crossOrigin = 'anonymous';

        /* Once the image loads, recolor it via canvas */
        temp.onload = () => {
            /* Create a canvas matching the image dimensions */
            const c = document.createElement('canvas');
            c.width = temp.naturalWidth;
            c.height = temp.naturalHeight;
            const ctx = c.getContext('2d');

            /* Draw the original image */
            ctx.drawImage(temp, 0, 0);

            /* "source-in" compositing: only draws where pixels already exist.
               This fills the logo shape with the solid color while
               preserving the original transparency/alpha. */
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, c.width, c.height);

            /* Replace the image src with the recolored version */
            img.src = c.toDataURL();
        };

        /* Start loading the original image */
        temp.src = src;
    });
}


/* ═══════════════════════════════════════════════════════════════
   INITIALIZATION
   On page load, check localStorage for saved theme preference
   and apply it. Also recolor footer logos to match.
   ═══════════════════════════════════════════════════════════════ */

/* Apply saved theme from localStorage (defaults to light if not set) */
setTheme(localStorage.getItem('theme') === 'dark');

/* Recolor footer logos to match the current theme */
recolorFooterLogos();


/* ═══════════════════════════════════════════════════════════════
   THEME TOGGLE EVENT LISTENERS
   Two toggle buttons: one for mobile menu, one for desktop.
   Both do the same thing — toggle dark class, swap icons,
   save preference, and recolor the footer logo.
   ═══════════════════════════════════════════════════════════════ */

['theme-toggle', 'theme-toggle-lg'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;   /* Skip if button doesn't exist on this page */

    btn.addEventListener('click', () => {
        /* Toggle the dark class and get the new state */
        const isDark = document.body.classList.toggle('dark');

        /* Update sun icon visibility */
        ['icon-sun', 'icon-sun-lg'].forEach(i => {
            const el = document.getElementById(i);
            if (el) el.style.display = isDark ? 'none' : '';
        });

        /* Update moon icon visibility */
        ['icon-moon', 'icon-moon-lg'].forEach(i => {
            const el = document.getElementById(i);
            if (el) el.style.display = isDark ? '' : 'none';
        });

        /* Save the theme preference to localStorage for persistence */
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        /* Recolor footer logos to match the new theme */
        recolorFooterLogos();
    });
});
