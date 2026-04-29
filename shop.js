/*
 * shop.js
 * Stogie Candles
 *
 * Powers the shop page: product filtering by collection and
 * category, pagination, product detail modal, quantity selectors,
 * the slide-in cart drawer, and Stripe Checkout through an
 * AWS Lambda serverless function.
 */


/* AWS API Gateway endpoint for the checkout Lambda function.
   The front end POSTs the cart here and gets back a Stripe
   Checkout URL to redirect the customer to. */
const CHECKOUT_API = 'https://s0xlp4wxxi.execute-api.us-east-1.amazonaws.com/checkout';


/* Maps the visible filter button text to the data attribute
   values on each product card. Cards use data-line for
   collections and data-category for tags like bestseller. */
const filterMap = {
    'All':              'all',
    'The Family':       'family',
    'The Lounge':       'lounge',
    'The Cedar Room':   'cedar',
    'The Morning Roast':'roast',
    'The Aged Reserve': 'reserve',
    'Bestsellers':      'bestseller',
    'New Arrivals':     'new',
    'Gift Sets':        'gift'
};

/* Track which filter is active and which page we're on */
let activeFilter = 'all';
let currentPage  = 1;


/* Shows or hides product cards based on the active filter.
   "All" view respects pagination. Collection and category
   filters show every matching card regardless of page. Also
   updates the section label and highlights the active page. */
function render() {
    const lineFilters = ['family', 'lounge', 'cedar', 'roast', 'reserve'];
    const catFilters  = ['bestseller', 'new', 'gift'];
    const items       = document.querySelectorAll('.product-item');

    items.forEach(item => {
        let show = false;
        if (activeFilter === 'all') {
            show = item.dataset.page === String(currentPage);
        } else if (lineFilters.includes(activeFilter)) {
            show = item.dataset.line === activeFilter;
        } else if (catFilters.includes(activeFilter)) {
            show = item.dataset.category === activeFilter;
        }
        item.style.display = show ? '' : 'none';
    });

    // pagination only shows in the "All" view
    document.querySelector('.pagination').style.visibility =
        activeFilter === 'all' ? '' : 'hidden';

    // swap the section label to match the active filter
    const labels = ['all','family','lounge','cedar','roast','reserve','bestseller','new','gift'];
    labels.forEach(l => {
        document.getElementById(`label-${l}`).style.display =
            activeFilter === l ? '' : 'none';
    });

    // highlight the current page number
    document.querySelectorAll('.page-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.page) === currentPage);
    });
}


/* Filter buttons — clicking one updates the active filter,
   resets to page 1, and re-renders the grid. */
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = filterMap[btn.textContent.trim()];
        currentPage  = 1;
        render();
    });
});


/* Pagination — page numbers and prev/next arrows.
   Scrolls back to the top of the grid after changing pages. */
document.querySelectorAll('.page-btn').forEach(b => {
    b.addEventListener('click', () => {
        currentPage = parseInt(b.dataset.page);
        render();
        window.scrollTo({ top: document.getElementById('main-nav').offsetHeight, behavior: 'smooth' });
    });
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; render(); }
    window.scrollTo({ top: document.getElementById('main-nav').offsetHeight, behavior: 'smooth' });
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentPage < 3) { currentPage++; render(); }
    window.scrollTo({ top: document.getElementById('main-nav').offsetHeight, behavior: 'smooth' });
});

/* First paint — show all products, page 1 */
render();


/*
 * Product Detail Modal
 *
 * Clicking a product image or name opens a popup with the full
 * details. Everything is pulled from data attributes on the card
 * so we don't need a separate data source.
 */

const modal        = document.getElementById('product-modal');
const modalOverlay = modal.querySelector('.product-modal-overlay');
const modalClose   = modal.querySelector('.product-modal-close');

/* Friendly names for each product line */
const lineNames = {
    family:  'The Family Collection',
    lounge:  'The Lounge Collection',
    cedar:   'The Cedar Room',
    roast:   'The Morning Roast',
    reserve: 'The Aged Reserve'
};

/* Keep a reference to the card that opened the modal so the
   modal's Add to Cart button knows which product to add. */
let activeModalCard = null;

function openModal(card) {
    activeModalCard = card;
    const item = card.closest('.product-item');
    const line = item.dataset.line || '';

    // populate the modal fields from the card's data
    document.getElementById('modal-line').textContent  = lineNames[line] || 'Stogie Candles';
    document.getElementById('modal-name').textContent  = card.querySelector('.product-name').textContent;
    document.getElementById('modal-desc').textContent  = card.querySelector('.product-desc').textContent;
    document.getElementById('modal-price').textContent = card.querySelector('.product-price').textContent;
    document.getElementById('modal-scent').textContent = card.dataset.scent || '—';
    document.getElementById('modal-burn').textContent  = card.dataset.burn  || '—';
    document.getElementById('modal-wax').textContent   = card.dataset.wax   || '—';
    document.getElementById('modal-size').textContent  = card.dataset.size  || '—';
    document.getElementById('modal-wick').textContent  = card.dataset.wick  || '—';

    // reset the modal quantity picker to 1
    const qtyEl = document.querySelector('#modal-qty-selector .qty-value');
    if (qtyEl) qtyEl.textContent = '1';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    activeModalCard = null;
}

/* Make the product image and name clickable to open the modal */
document.querySelectorAll('.product-card').forEach(card => {
    [card.querySelector('.img-ph'), card.querySelector('.product-name')]
        .filter(Boolean)
        .forEach(el => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', e => { e.preventDefault(); openModal(card); });
        });
});

/* Close the modal on overlay click, X button, or Escape key */
modalOverlay.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});


/* Quantity selector — the +/- buttons on product cards and
   the modal. Clamped between 1 and 3 (small batch limit). */
document.addEventListener('click', e => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;

    const valueEl = btn.closest('.qty-selector').querySelector('.qty-value');
    let qty = parseInt(valueEl.textContent);

    if (btn.classList.contains('qty-plus')  && qty < 3) qty++;
    if (btn.classList.contains('qty-minus') && qty > 1) qty--;

    valueEl.textContent = qty;
});


/*
 * Cart
 *
 * The cart is an array of objects: { priceId, name, price, quantity }
 * Stored in sessionStorage so it survives page refreshes but
 * clears when the browser tab closes. The cart drawer slides in
 * from the right and shows all items with quantity controls,
 * a running total, and checkout/clear buttons.
 */

let cart = JSON.parse(sessionStorage.getItem('sc-cart') || '[]');

function saveCart() {
    sessionStorage.setItem('sc-cart', JSON.stringify(cart));
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/* Cart drawer elements */
const cartDrawer  = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total-price');
const cartCountEl = document.getElementById('cart-count');
const cartFab     = document.getElementById('cart-fab');

function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

/* Builds the cart drawer HTML from the cart array.
   Each item gets +/- quantity buttons and a remove button. */
function renderCart() {
    const count = getCartCount();
    cartCountEl.textContent = count;
    cartCountEl.style.display = count > 0 ? '' : 'none';

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
        cartTotalEl.textContent = '$0.00';
        return;
    }

    cartItemsEl.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <p class="cart-item-name">${item.name}</p>
                <div class="cart-item-qty-controls">
                    <button data-index="${i}" data-action="minus">−</button>
                    <span>${item.quantity}</span>
                    <button data-index="${i}" data-action="plus">+</button>
                </div>
            </div>
            <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            <button class="cart-item-remove" data-index="${i}" aria-label="Remove">&times;</button>
        </div>
    `).join('');

    cartTotalEl.textContent = '$' + getCartTotal().toFixed(2);
}

/* Cart open/close listeners */
document.getElementById('cart-continue-btn').addEventListener('click', closeCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
cartFab.addEventListener('click', openCart);
cartOverlay.addEventListener('click', closeCart);

/* Handle clicks inside the cart items area.
   Covers the remove button and the per-item +/- buttons.
   Minus below 1 removes the item entirely. */
cartItemsEl.addEventListener('click', e => {
    const removeBtn = e.target.closest('.cart-item-remove');
    if (removeBtn) {
        cart.splice(parseInt(removeBtn.dataset.index), 1);
        saveCart();
        renderCart();
        return;
    }

    const qtyBtn = e.target.closest('.cart-item-qty-controls button');
    if (qtyBtn) {
        const idx    = parseInt(qtyBtn.dataset.index);
        const action = qtyBtn.dataset.action;

        if (action === 'plus' && cart[idx].quantity < 3) {
            cart[idx].quantity++;
        } else if (action === 'minus' && cart[idx].quantity > 1) {
            cart[idx].quantity--;
        } else if (action === 'minus' && cart[idx].quantity === 1) {
            // going below 1 removes the item
            cart.splice(idx, 1);
        }

        saveCart();
        renderCart();
    }
});

/* Clear the entire cart */
document.getElementById('cart-clear-btn').addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCart();
});

/* Show the cart on first load (in case there are items from a previous refresh) */
renderCart();


/* Adds a product to the cart. If the item is already there,
   it updates the quantity instead of adding a duplicate.
   Max 3 per item (small batch limit). */
function addToCart(card, qtySelector) {
    const priceId  = card.dataset.priceId;
    const name     = card.querySelector('.product-name').textContent;
    const priceStr = card.querySelector('.product-price').textContent;
    const price    = parseFloat(priceStr.replace('$', ''));
    const qty      = qtySelector ? parseInt(qtySelector.querySelector('.qty-value').textContent) : 1;

    const existing = cart.find(item => item.priceId === priceId);
    if (existing) {
        existing.quantity = Math.min(existing.quantity + qty, 3);
    } else {
        cart.push({ priceId, name, price, quantity: Math.min(qty, 3) });
    }

    saveCart();
    renderCart();

    // quick feedback on the button, then reset
    const btn = card.querySelector('.btn-add-cart') ||
                document.getElementById('modal-cart-btn');
    if (btn) {
        btn.textContent = 'Added ✓';
        setTimeout(() => { btn.textContent = 'Add to Cart'; }, 1500);
    }

    openCart();
}

/* Listen for Add to Cart clicks on both product cards and the modal */
document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-add-cart');
    if (!btn) return;

    // modal button uses the card that opened the modal
    if (btn.id === 'modal-cart-btn' && activeModalCard) {
        const qtySel = document.getElementById('modal-qty-selector');
        addToCart(activeModalCard, qtySel);
        closeModal();
        return;
    }

    // regular card button
    const card = btn.closest('.product-card');
    if (!card) return;
    const qtySel = card.querySelector('.qty-selector');
    addToCart(card, qtySel);
});


/*
 * Stripe Checkout
 *
 * When the customer clicks "Checkout with Stripe", we POST the
 * cart to the AWS Lambda function. Lambda creates a Stripe
 * Checkout Session with all the line items and returns the URL.
 * We then redirect the browser to Stripe's hosted checkout page.
 */
document.getElementById('cart-checkout-btn').addEventListener('click', async () => {
    if (cart.length === 0) return;

    const btn  = document.getElementById('cart-checkout-btn');
    const orig = btn.textContent;
    btn.textContent = 'Redirecting...';
    btn.disabled    = true;

    try {
        const res = await fetch(CHECKOUT_API, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                items: cart.map(item => ({
                    priceId:  item.priceId,
                    quantity: item.quantity
                }))
            })
        });

        const data = await res.json();

        if (data.url) {
            cart = [];
            saveCart();
            window.location.href = data.url;
        } else {
            alert(data.error || 'Something went wrong. Please try again.');
            btn.textContent = orig;
            btn.disabled    = false;
        }
    } catch (err) {
        alert('Could not connect to checkout. Please try again.');
        btn.textContent = orig;
        btn.disabled    = false;
    }
});
