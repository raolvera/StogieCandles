/*
 * api/checkout.js
 * Stogie Candles — Stripe Checkout Session (AWS Lambda)
 *
 * Receives a cart from the front end, creates a Stripe Checkout
 * Session with all line items, and returns the session URL.
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    // handle preflight
    const method = event.requestContext?.http?.method || event.httpMethod;
    if (method === 'OPTIONS') {
        return { statusCode: 200, headers: HEADERS, body: '' };
    }

    try {
        const body  = JSON.parse(event.body || '{}');
        const items = body.items;

        if (!items || !items.length) {
            return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Cart is empty' }) };
        }

        const origin = event.headers?.origin || 'https://stogiecandles.com';

        const session = await stripe.checkout.sessions.create({
            mode:        'payment',
            line_items:  items.map(i => ({ price: i.priceId, quantity: i.quantity || 1 })),
            success_url: `${origin}/shop.html?success=true`,
            cancel_url:  `${origin}/shop.html?canceled=true`
        });

        return {
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({ url: session.url })
        };

    } catch (err) {
        console.error('Stripe error:', err.message);
        return {
            statusCode: 500,
            headers: HEADERS,
            body: JSON.stringify({ error: err.message })
        };
    }
};
