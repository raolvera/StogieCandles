/*
 * shop.js
 * Stogie Candles — Product filtering, pagination, modal & cart
 *
 * Drives the shop page: collection/category filter bar,
 * paginated product grid, detail modal popup, quantity selector,
 * cart drawer, and Stripe Checkout via serverless function.
 */


// ── Config ─────────────────────────────────────────────────────
// Point this to your Vercel deployment once it's live.
// During local dev you can test with the Payment Links fallback.

// Point this to your AWS API Gateway endpoint once deployed.
// Example: 'https://abc123.execute-api.us-east-1.amazonaws.com/checkout'
const CHECKOUT_API = 'https://s0xlp4wxxi.execute-api.us-east-1.amazonaws.com/checkout';


// ── Filter Map ─────────────────────────────────────────────────

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

let activeFilter = 'all';
let currentPage  = 1;


// ── Render ─────────────────────────────────────────────────────

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

    document.querySelector('.pagination').style.visibility =
        activeFilter === 'all' ? '' : 'hidden';

    const labels = ['all','family','lounge','cedar','roast','reserve','bestseller','new','gift'];
    labels.forEach(l => {
        document.getElementById(`label-${l}`).style.display =
            activeFilter === l ? '' : 'none';
    });

    document.querySelectorAll('.page-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.page) === currentPage);
    });
}


// ── Filter Buttons ─────────────────────────────────────────────

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = filterMap[btn.textContent.trim()];
        currentPage  = 1;
        render();
    });
});


// ── Pagination ─────────────────────────────────────────────────

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

render();


// ── Product Detail Modal ───────────────────────────────────────

const modal        = document.getElementById('product-modal');
const modalOverlay = modal.querySelector('.product-modal-overlay');
const modalClose   = modal.querySelector('.product-modal-close');

const lineNames = {
    family:  'The Family Collection',
    lounge:  'The Lounge Collection',
    cedar:   'The Cedar Room',
    roast:   'The Morning Roast',
    reserve: 'The Aged Reserve'
};

// store reference to the card that opened the modal
let activeModalCard = null;

function openModal(card) {
    activeModalCard = card;
    const item = card.closest('.product-item');
    const line = item.dataset.line || '';

    document.getElementById('modal-line').textContent  = lineNames[line] || 'Stogie Candles';
    document.getElementById('modal-name').textContent  = card.querySelector('.product-name').textContent;
    document.getElementById('modal-desc').textContent  = card.querySelector('.product-desc').textContent;
    document.getElementById('modal-price').textContent = card.querySelector('.product-price').textContent;
    document.getElementById('modal-scent').textContent = card.dataset.scent || '—';
    document.getElementById('modal-burn').textContent  = card.dataset.burn  || '—';
    document.getElementById('modal-wax').textContent   = card.dataset.wax   || '—';
    document.getElementById('modal-size').textContent  = card.dataset.size  || '—';
    document.getElementById('modal-wick').textContent  = card.dataset.wick  || '—';

    // reset quantity
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

document.querySelectorAll('.product-card').forEach(card => {
    [card.querySelector('.img-ph'), card.querySelector('.product-name')]
        .filter(Boolean)
        .forEach(el => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', e => { e.preventDefault(); openModal(card); });
        });
});

modalOverlay.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});


// ── Quantity Selector ──────────────────────────────────────────

document.addEventListener('click', e => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;

    const valueEl = btn.closest('.qty-selector').querySelector('.qty-value');
    let qty = parseInt(valueEl.textContent);

    if (btn.classList.contains('qty-plus')  && qty < 3) qty++;
    if (btn.classList.contains('qty-minus') && qty > 1) qty--;

    valueEl.textContent = qty;
});


// ── Cart State ─────────────────────────────────────────────────
// Cart is an array of { priceId, name, price, quantity }
// Stored in sessionStorage so it survives page refreshes but
// clears when the browser tab closes.

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


// ── Cart UI ────────────────────────────────────────────────────

const cartDrawer  = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total-price');
const cartCountEl = document.getElementById('cart-count');
const cartFab     = document.getElementById('cart-fab');
const cartCloseEl = document.getElementById('cart-close');

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
                <p class="cart-item-qty">Qty: ${item.quantity}</p>
            </div>
            <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            <button class="cart-item-remove" data-index="${i}" aria-label="Remove">&times;</button>
        </div>
    `).join('');

    cartTotalEl.textContent = '$' + getCartTotal().toFixed(2);
}

// open/close cart
cartFab.addEventListener('click', openCart);
cartCloseEl.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// remove item from cart
cartItemsEl.addEventListener('click', e => {
    const removeBtn = e.target.closest('.cart-item-remove');
    if (!removeBtn) return;
    cart.splice(parseInt(removeBtn.dataset.index), 1);
    saveCart();
    renderCart();
});

// initial render
renderCart();


// ── Add to Cart ────────────────────────────────────────────────

function addToCart(card, qtySelector) {
    const priceId = card.dataset.priceId;
    const name    = card.querySelector('.product-name').textContent;
    const priceStr = card.querySelector('.product-price').textContent;
    const price   = parseFloat(priceStr.replace('$', ''));
    const qty     = qtySelector ? parseInt(qtySelector.querySelector('.qty-value').textContent) : 1;

    // if item already in cart, update quantity (max 3 per item)
    const existing = cart.find(item => item.priceId === priceId);
    if (existing) {
        existing.quantity = Math.min(existing.quantity + qty, 3);
    } else {
        cart.push({ priceId, name, price, quantity: Math.min(qty, 3) });
    }

    saveCart();
    renderCart();

    // brief feedback on the button
    const btn = card.querySelector('.btn-add-cart') ||
                document.getElementById('modal-cart-btn');
    if (btn) {
        const orig = btn.textContent;
        btn.textContent = 'Added ✓';
        setTimeout(() => { btn.textContent = orig; }, 1500);
    }

    // open the cart drawer
    openCart();
}

// card buttons
document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-add-cart');
    if (!btn) return;

    // if it's the modal button, use the card that opened the modal
    if (btn.id === 'modal-cart-btn' && activeModalCard) {
        const qtySel = document.getElementById('modal-qty-selector');
        addToCart(activeModalCard, qtySel);
        closeModal();
        return;
    }

    // otherwise it's a card button
    const card = btn.closest('.product-card');
    if (!card) return;
    const qtySel = card.querySelector('.qty-selector');
    addToCart(card, qtySel);
});


// ── Stripe Checkout ────────────────────────────────────────────
// Posts the cart to the serverless function which creates a
// Checkout Session and returns the URL to redirect to.

document.getElementById('cart-checkout-btn').addEventListener('click', async () => {
    if (cart.length === 0) return;

    const btn = document.getElementById('cart-checkout-btn');
    const orig = btn.textContent;
    btn.textContent = 'Redirecting...';
    btn.disabled = true;

    try {
        const res = await fetch(CHECKOUT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart.map(item => ({
                    priceId:  item.priceId,
                    quantity: item.quantity
                }))
            })
        });

        const data = await res.json();

        if (data.url) {
            // clear cart before redirect
            cart = [];
            saveCart();
            window.location.href = data.url;
        } else {
            alert(data.error || 'Something went wrong. Please try again.');
            btn.textContent = orig;
            btn.disabled = false;
        }
    } catch (err) {
        alert('Could not connect to checkout. Please try again.');
        btn.textContent = orig;
        btn.disabled = false;
    }
});
