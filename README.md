# AURA store

An online clothing store, built step by step.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

## Folder guide

```
app/
  layout.js        wraps every page (fonts, <html>, metadata)
  page.js          the home page ( / )
  globals.css      colours, fonts and base styles for the whole site
components/
  Hero.jsx         the 3D AURA wordmark + button
  Header.jsx       top navigation
lib/
  letters.js       SVG outlines of the A, U, R, A letters
public/            images and files served as-is (put product photos here for now)
```

## Settings (.env)

These live in a file called `.env` in the project folder. It is private and never goes to GitHub.

```
DATABASE_URL="postgresql://..."        # from Neon (Connect button)
ADMIN_PASSWORD="..."                   # password for /admin (8+ characters)
SESSION_SECRET="..."                   # any long random text (16+ characters)
BETTER_AUTH_SECRET="..."               # long random text (32+ characters) for customer logins
BETTER_AUTH_URL="http://localhost:3000" # the site address (your real domain once deployed)
CLOUDINARY_CLOUD_NAME="..."            # from Cloudinary (Settings, API Keys)
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_WHATSAPP_NUMBER="919876543210" # the seller's WhatsApp: country code first, no + or spaces
NEXT_PUBLIC_ONLINE_CHECKOUT="false"    # "true" turns on accounts + online payment (the Razorpay settings below)
RAZORPAY_KEY_ID="rzp_test_..."          # Razorpay dashboard: Account & Settings, API Keys (use TEST keys first)
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."          # only needed once the site is online (see Razorpay Webhooks)
```

## Roadmap

- [x] Phase 1 – Foundation: Next.js, design tokens, hero, navbar
- [x] Phase 2 – Static pages: product grid, product page, footer
- [x] Phase 3 – Database
- [x] Phase 4 – Admin panel (login, products, stock, photos)
- [x] Phase 5 – Auth: customer sign up and login (admin still uses one shared password)
- [x] Phase 6 – Bag, plus "Order on WhatsApp" (customers chat with the seller; the seller closes the sale)
- [x] Phase 7 – Online payments with Razorpay: built but switched OFF (set NEXT_PUBLIC_ONLINE_CHECKOUT="true" to use it)
- [ ] Phase 8 – Delivery
