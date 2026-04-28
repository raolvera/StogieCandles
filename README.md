# 🕯️ Stogie Candles

### Where Cigar Culture Meets Craft

> *Don't let the flame burn out.*

Stogie Candles is a luxury candle brand built around the speakeasy aesthetic — aged tobacco, bourbon, dark cedar, leather, and coffee captured in every burn. This is the full e-commerce experience: a seven-page responsive site with dual light/dark themes, a live product shop with multi-item Stripe checkout, and a serverless backend on AWS.

Not just a candle. A presence in the room.

---

## 🔥 Live Demo

🌐 [stogiecandles.com](https://stogiecandles.com)

---

## ⚡ The Stack

| Layer | Technology |
|---|---|
| **Front End** | HTML5, CSS3 (custom properties), Bootstrap 5.3 |
| **Interactivity** | Vanilla JavaScript — no frameworks, no bloat |
| **Payments** | Stripe Checkout Sessions (multi-item cart) |
| **Serverless API** | AWS Lambda + API Gateway |
| **Forms** | Formspree (contact + newsletter) |
| **Hosting** | GitHub Pages → AWS S3 + CloudFront |
| **Design** | Adobe Illustrator (logos), Adobe Photoshop (product imagery) |
| **Typography** | Google Fonts — Cinzel (headings) + Lora (body) |

---

## 🎯 Key Features

**Theme System**
- Warm cream/brown light mode (default) with a speakeasy dark mode toggle
- CSS custom properties power the entire color system — one variable change, site-wide effect
- Four reusable glow variables (`--glow-gold`, `--glow-gold-sm`, `--glow-fire`, `--fire`)
- Footer logo dynamically recolored via canvas compositing to match the active theme
- Flash-free theme switching with inline `<head>` preload script

**Shop & Checkout**
- Product grid with collection and category filtering (9 filter options)
- Paginated browsing across product lines
- Product detail modal with scent notes, burn time, wax type, size, and wick specs
- Quantity selector (1–3 per item) on cards and modal
- Slide-in cart drawer with add/remove, item count badge, and running total
- Multi-product Stripe Checkout via AWS Lambda — one checkout for the whole cart

**Design & UX**
- Fully responsive — desktop, tablet, and mobile
- Zigzag editorial layout on the About page
- 45% dark overlay on hero images for text readability
- 92% opacity content cards in dark mode
- Fiery orange-red hover glow on all interactive elements
- SC favicon branding across all pages
- Reduced CTA frequency — strategic placement instead of repetition

**Forms & Integration**
- Newsletter signup on every page with inline button feedback
- Contact form with name, email, phone, subject, and message
- All forms wired to Formspree with success/error states
- Stripe Payment Links as fallback for individual product purchases

---

## 📁 Project Structure

```
stogie-candles/
├── api/
│   └── checkout.js          # AWS Lambda — Stripe Checkout Session creator
├── img/                     # Logos, products, team photos, hero images
│   ├── SCdark.png           # SC favicon (dark variant)
│   ├── SClight.png          # SC favicon (light variant)
│   ├── LogoDark.png         # Full logo (light mode)
│   ├── LogoLight.png        # Full logo (dark mode)
│   ├── darkStogie.png       # Footer logo (recolored via JS)
│   ├── StogieCandle.png     # Product card image
│   ├── hero.jpeg            # Hero background
│   └── ...                  # Section images, team photos
├── index.html               # Home — hero, featured collection, brand teaser
├── shop.html                # Shop — filters, product grid, modal, cart
├── about.html               # Brand story, values, team
├── contact.html             # Contact form + info
├── faq.html                 # Frequently asked questions
├── shipping.html            # Shipping policy
├── returns.html             # Returns policy
├── style.css                # Master stylesheet — all components, both themes
├── theme.js                 # Light/dark toggle, icon swap, footer logo recolor
├── shop.js                  # Filtering, pagination, modal, cart, Stripe checkout
├── forms.js                 # Formspree integration + legacy Stripe handler
├── package.json             # Dependencies (Stripe SDK for Lambda)
├── CNAME                    # Custom domain config
└── README.md
```

---

## 🛠️ Setup & Deployment

**Local Development**
```bash
# Just open with Live Server — no build step needed
# Right-click index.html → Open with Live Server
```

**GitHub Pages**
1. Push to GitHub
2. Settings → Pages → Source: main branch
3. Add custom domain via CNAME

**AWS Lambda (Checkout API)**
1. `cd stogie-checkout && npm install stripe`
2. Zip the folder and upload to Lambda (Node.js 20.x)
3. Set handler to `checkout.handler`
4. Add env var: `STRIPE_SECRET_KEY`
5. Create HTTP API in API Gateway with POST `/checkout` route
6. Enable CORS and copy the invoke URL into `shop.js`

---

## 📋 Pages

| Page | Route | Description |
|---|---|---|
| Home | `index.html` | Hero, featured collection, signature scents, brand teaser, newsletter |
| Shop | `shop.html` | Filter bar, product grid, detail modal, cart drawer, Stripe checkout |
| About | `about.html` | Brand story, craft process, values, team members |
| Contact | `contact.html` | Message form, contact info, social links |
| FAQ | `faq.html` | Common questions about products, shipping, returns |
| Shipping | `shipping.html` | Shipping rates, processing times, tracking |
| Returns | `returns.html` | Return window, refund process, exchanges |

---

## 🎨 Design Decisions

- **Warm over dark by default** — The cream and brown palette gives the brand personality and feels like an actual lounge, not just another dark-themed site. Dark mode is there for the speakeasy vibe.
- **Cinzel + Lora** — Cinzel's sharp serifs carry authority for headings and navigation. Lora's softer curves keep body text readable and warm.
- **Gold as the accent** — `#c5a059` runs through borders, buttons, glows, and text. It ties the whole brand together without competing with the content.
- **No frameworks** — Vanilla JS keeps the site fast and dependency-free. Bootstrap handles the grid and responsive utilities.

---

## 👤 Author

**Rey Olvera**
GIT 480 — Senior Project
2026

---

<p align="center"><em>Don't let the flame burn out.</em> 🕯️</p>
