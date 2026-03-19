/* ═══════════════════════════════════════════════════════════════
   SHOP.JS — Product Filtering & Pagination
   Handles the shop page product grid filtering by collection
   and category, plus pagination for browsing products.
   ═══════════════════════════════════════════════════════════════ */


/**
 * filterMap — Maps the visible button text to the data attribute
 * values used in the HTML. Each product card has data-category
 * (bestseller, new, gift) and data-line (family, lounge, cedar,
 * roast, reserve) attributes for filtering.
 */
const filterMap = {
    'All': 'all',
    'The Family': 'family',         /* Mafia-themed collection */
    'The Lounge': 'lounge',         /* Lounge-inspired scents */
    'The Cedar Room': 'cedar',      /* Wood and fire scents */
    'The Morning Roast': 'roast',   /* Coffee and tobacco blends */
    'The Aged Reserve': 'reserve',  /* Bourbon and oak scents */
    'Bestsellers': 'bestseller',    /* Top sellers across all lines */
    'New Arrivals': 'new',          /* Recently added products */
    'Gift Sets': 'gift'             /* Bundled gift collections */
};

/* Track the currently active filter and page number */
let activeFilter = 'all';
let currentPage = 1;


/**
 * render — Updates the product grid visibility based on the
 * active filter and current page number.
 *
 * Logic:
 * - "all" filter: shows products matching the current page number
 * - Line filters (family, lounge, etc.): shows all products in that line
 * - Category filters (bestseller, new, gift): shows all in that category
 * - Pagination is only visible when "all" filter is active
 * - Section labels update to match the active filter
 */
function render() {
    /* Line-based filters match the data-line attribute */
    const lineFilters = ['family', 'lounge', 'cedar', 'roast', 'reserve'];

    /* Category-based filters match the data-category attribute */
    const catFilters = ['bestseller', 'new', 'gift'];

    /* Get all product items from the grid */
    const items = document.querySelectorAll('.product-item');

    /* Loop through each product and show/hide based on filter */
    items.forEach(item => {
        let show = false;

        if (activeFilter === 'all') {
            /* "All" view — only show items on the current page */
            show = item.dataset.page === String(currentPage);
        } else if (lineFilters.includes(activeFilter)) {
            /* Line filter — show all items in this product line */
            show = item.dataset.line === activeFilter;
        } else if (catFilters.includes(activeFilter)) {
            /* Category filter — show all items with this category */
            show = item.dataset.category === activeFilter;
        }

        /* Toggle visibility using display property */
        item.style.display = show ? '' : 'none';
    });

    /* Only show pagination when viewing "All" products */
    const showPagination = activeFilter === 'all';
    document.querySelector('.pagination').style.visibility = showPagination ? '' : 'hidden';

    /* Update section labels — show the label matching the active filter,
       hide all others. Each label has an ID like "label-family", "label-all", etc. */
    const labels = ['all', 'family', 'lounge', 'cedar', 'roast', 'reserve', 'bestseller', 'new', 'gift'];
    labels.forEach(label => {
        document.getElementById(`label-${label}`).style.display = activeFilter === label ? '' : 'none';
    });

    /* Highlight the active page button */
    document.querySelectorAll('.page-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.page) === currentPage);
    });
}


/* ═══════════════════════════════════════════════════════════════
   FILTER BUTTON EVENT LISTENERS
   Each filter button updates the active filter, resets to page 1,
   and re-renders the grid.
   ═══════════════════════════════════════════════════════════════ */

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        /* Remove active class from all filter buttons */
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));

        /* Add active class to the clicked button */
        btn.classList.add('active');

        /* Update the active filter using the filterMap lookup */
        activeFilter = filterMap[btn.textContent.trim()];

        /* Reset to page 1 when changing filters */
        currentPage = 1;

        /* Re-render the product grid */
        render();
    });
});


/* ═══════════════════════════════════════════════════════════════
   PAGINATION EVENT LISTENERS
   Page number buttons, previous, and next controls.
   Scrolls to top of grid after page change.
   ═══════════════════════════════════════════════════════════════ */

/* Page number buttons (1, 2, 3) */
document.querySelectorAll('.page-btn').forEach(b => {
    b.addEventListener('click', () => {
        currentPage = parseInt(b.dataset.page);
        render();
        /* Smooth scroll to top of the product grid */
        window.scrollTo({ top: document.getElementById('main-nav').offsetHeight, behavior: 'smooth' });
    });
});

/* Previous page button */
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        render();
        window.scrollTo({ top: document.getElementById('main-nav').offsetHeight, behavior: 'smooth' });
    }
});

/* Next page button */
document.getElementById('next-btn').addEventListener('click', () => {
    if (currentPage < 3) {
        currentPage++;
        render();
        window.scrollTo({ top: document.getElementById('main-nav').offsetHeight, behavior: 'smooth' });
    }
});


/* ═══════════════════════════════════════════════════════════════
   INITIAL RENDER
   Show the default view (all products, page 1) on page load.
   ═══════════════════════════════════════════════════════════════ */

render();
