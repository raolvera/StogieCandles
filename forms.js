/*
 * forms.js
 * Stogie Candles — Form handling + Stripe checkout
 *
 * Wires up newsletter subscriptions and the contact form to
 * Formspree endpoints. Also handles the legacy Stripe Checkout
 * redirect for any buttons still using data-price-id attributes.
 *
 * Setup:
 *   1. Create forms at https://formspree.io — one for contact,
 *      one for the newsletter — and drop the IDs below.
 *   2. Grab your Stripe publishable key from the dashboard
 *      and paste it into STRIPE_PUBLISHABLE_KEY.
 *   3. For product buttons using Payment Links (buy.stripe.com)
 *      no key is needed — those redirect directly.
 */

const FORMSPREE_CONTACT    = 'https://formspree.io/f/xeelgeaz';
const FORMSPREE_NEWSLETTER = 'https://formspree.io/f/xeelgeaz';
const STRIPE_PUBLISHABLE_KEY =
    'pk_test_51SAiHNPx23ZBg5Mh7ktknbUJtd7x5TTRC4pyTZeqa5eLQn33BeEzaCaVMEblC5JLCx5NfTztp6Wgh1ihed4QYRSu002eKPTOvM';


// Newsletter Forms
// Every page has at least one .newsletter-form. On submit we POST
// the email to Formspree and show inline feedback on the button.

document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = form.querySelector('input[type="email"]');
        const btn        = form.querySelector('button');
        const email      = emailInput.value.trim();
        if (!email) return;

        const originalText = btn.textContent;
        btn.textContent    = 'Sending...';
        btn.disabled       = true;

        try {
            const res = await fetch(FORMSPREE_NEWSLETTER, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body:    JSON.stringify({ email })
            });

            if (res.ok) {
                btn.textContent = 'Subscribed ✓';
                emailInput.value = '';
            } else {
                btn.textContent = 'Error — Try Again';
            }
        } catch {
            btn.textContent = 'Error — Try Again';
        }

        setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 3000);
    });
});


// Contact Form 

const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn          = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent    = 'Sending...';
        btn.disabled       = true;

        const data = Object.fromEntries(new FormData(contactForm));

        try {
            const res = await fetch(FORMSPREE_CONTACT, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body:    JSON.stringify(data)
            });

            if (res.ok) {
                btn.textContent = 'Message Sent ✓';
                contactForm.reset();
                setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 4000);
            } else {
                btn.textContent = 'Error — Try Again';
                setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 3000);
            }
        } catch {
            btn.textContent = 'Error — Try Again';
            setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 3000);
        }
    });
}


// Stripe Checkout (legacy)
// Kept for any future buttons that use data-price-id instead of
// direct Payment Links. Lazy-loads Stripe.js on first click.

let stripe = null;

document.querySelectorAll('.btn-stripe-checkout').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (!stripe) {
            if (typeof Stripe === 'undefined') {
                alert('Stripe is still loading. Please try again.');
                return;
            }
            stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        }

        const priceId = btn.dataset.priceId;
        if (!priceId || priceId === 'YOUR_PRICE_ID') {
            alert('This product is not yet available for purchase.');
            return;
        }

        const { error } = await stripe.redirectToCheckout({
            lineItems:  [{ price: priceId, quantity: 1 }],
            mode:       'payment',
            successUrl: window.location.origin + '/shop.html?session_id={CHECKOUT_SESSION_ID}',
            cancelUrl:  window.location.origin + '/shop.html'
        });

        if (error) alert(error.message);
    });
});
