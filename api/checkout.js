/*
 * api/checkout.js
 * Stogie Candles — Stripe Checkout Session (AWS Lambda)
 *
 * Receives a cart from the front end, creates a Stripe Checkout
 * Session with all line items, and returns the session URL.
 *
 * Deploy:
 *   1. Zip this file + node_modules (npm install stripe first)
 *   2. Upload to AWS Lambda (Node.js 20.x runtime)
 *   3. Add env var: STRIPE_SECRET_KEY
 *   4. Create an API Gateway HTTP API trigger
 *   5. Enable CORS for your domain
 *   6. Update CHECKOUT_API in shop.js with the API Gateway URL
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// your live site origin — update when you go to production
const ALLOWED_ORIGINS = [
    'https://stogiecandles.com',
    'https://www.stogiecandles.com',
    'https://raolvera.github.io',
    'http://127.0.0.1:5500',       // local dev (Live Server)
    'http://localhost:5500'
];

exports.handler = async (event) => {
    const origin = event.headers?.origin || '';
    const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    const headers = {
        'Access-Control-Allow-Origin':  corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // handle preflight
    if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const body  = JSON.parse(event.body || '{}');
        const items = body.items;

        if (!items || !items.length) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Cart is empty' }) };
        }

        const lineItems = items.map(item => ({
            price:    item.priceId,
            quantity: item.quantity || 1
        }));

        const session = await stripe.checkout.sessions.create({
            mode:        'payment',
            line_items:  lineItems,
            success_url: origin ? `${origin}/shop.html?success=true` : 'https://stogiecandles.com/shop.html?success=true',
            cancel_url:  origin ? `${origin}/shop.html?canceled=true` : 'https://stogiecandles.com/shop.html?canceled=true'
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ url: session.url })
        };

    } catch (err) {
        console.error('Stripe error:', err.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};
