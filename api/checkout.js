/*
 * api/checkout.js
 * Stogie Candles
 *
 * AWS Lambda function that creates a Stripe Checkout Session.
 * The front end sends the cart items as JSON, this function
 * passes them to Stripe, and returns the hosted checkout URL.
 *
 * Deployed to AWS Lambda (Node.js 20.x) with API Gateway
 * handling the HTTP routing and CORS.
 *
 * Environment variable needed:
 *   STRIPE_SECRET_KEY — set in the Lambda console, never in code
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/* CORS headers — using wildcard for now during development.
   Lock this down to your domain before going to production. */
const HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    /* Handle the CORS preflight request that browsers send
       before the actual POST */
    const method = event.requestContext?.http?.method || event.httpMethod;
    if (method === 'OPTIONS') {
        return { statusCode: 200, headers: HEADERS, body: '' };
    }

    try {
        const body  = JSON.parse(event.body || '{}');
        const items = body.items;

        /* Need at least one item to create a checkout session */
        if (!items || !items.length) {
            return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Cart is empty' }) };
        }

        /* Use the request origin for redirect URLs so the customer
           comes back to the right site after paying */
        const origin = event.headers?.origin || 'https://stogiecandles.com';

        /* Create the Stripe Checkout Session with all cart items */
        const session = await stripe.checkout.sessions.create({
            mode:        'payment',
            line_items:  items.map(i => ({ price: i.priceId, quantity: i.quantity || 1 })),
            success_url: `${origin}/shop.html?success=true`,
            cancel_url:  `${origin}/shop.html?canceled=true`
        });

        /* Send the checkout URL back to the browser */
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
