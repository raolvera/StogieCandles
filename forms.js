/*
 * forms.js
 * Stogie Candles
 *
 * Handles newsletter subscriptions and the contact form.
 * All forms submit to Formspree endpoints via fetch.
 * Also includes a legacy Stripe Checkout handler for any
 * buttons that still use data-price-id attributes.
 *
 * To set up:
 *   1. Create forms at formspree.io and paste the IDs below
 *   2. Grab your Stripe publishable key from the dashboard
 */

/* Formspree endpoints */
const FORMSPREE_CONTACT    = 'https://formspree.io/f/xeelgeaz';
const FORMSPREE_NEWSLETTER = 'https://formspree.io/f/xeelgeaz';

/* Stripe publishable key (test mode) */
const STRIPE_PUBLISHABLE_KEY =
    'pk_test_51SAiHNPx23ZBg5Mh7ktknbUJtd7x5TTRC4pyTZeqa5eLQn33BeEzaCaVMEblC5JLCx5NfTztp6Wgh1ihed4QYRSu002eKPTOvM';


/* Newsletter forms
   Every page has at least one .newsletter-form. On submit we
   POST the email to Formspree and show feedback on the button
   so the user knows it went through. */
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
                btn.textContent  = 'Subscribed ✓';
                emailInput.value = '';
            } else {
                btn.textContent = 'Error — Try Again';
            }
        } catch {
            btn.textContent = 'Error — Try Again';
        }

        // reset the button after a few seconds
        setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 3000);
    });
});


/* Contact form
   Collects name, email, phone, subject, and message.
   Same pattern as newsletter — POST to Formspree, show feedback. */
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


/* Stripe Checkout (legacy)
   Kept around for any future buttons using data-price-id instead
   of the cart system. Lazy-loads Stripe on first click. */
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
