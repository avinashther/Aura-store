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
CLOUDINARY_CLOUD_NAME="..."            # from Cloudinary (Settings, API Keys)
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_WHATSAPP_NUMBER="919876543210" # the seller's WhatsApp: country code first, no + or spaces
```

## Seeing the site on your phone (while building)

1. Put the phone on the **same network as the laptop**. A phone hotspot counts: connect the laptop to it.
2. Run `npm run dev` on the laptop. It prints a line like `Network: http://10.159.146.51:3000`.
3. Type exactly that address into the phone's browser.

If the page loads but nothing responds, restart `npm run dev` once (the allowed addresses are in `next.config.mjs`).
If the phone cannot reach the laptop at all (some hotspots and Windows Firewall block it), try a tunnel:
`npx localtunnel --port 3000` prints a public address you can open on the phone.
The easiest option of all is the real website once it is deployed.

## Roadmap

- [x] Phase 1 – Foundation: Next.js, design tokens, hero, navbar
- [x] Phase 2 – Static pages: product grid, product page, footer
- [x] Phase 3 – Database
- [x] Phase 4 – Admin panel (login, products, stock, photos)
- [x] Phase 5 – (removed) Customer login and online payment were built and then taken out: the seller sells over WhatsApp. The admin uses one shared password.
- [x] Phase 6 – Bag and "Order on WhatsApp" (customers chat with the seller; the seller closes the sale)
- [x] Phase 7 – (not needed) Online payment removed by choice


## Putting the site online (Netlify)

1. In Netlify: **Add new project → Import from GitHub →** pick this repo, branch `main`.
   Leave *Base directory* empty. *Build command* = `npm run build`. *Publish directory* = `.next`.
2. Before the first deploy, open **Environment variables** and add these (tick **Builds** and **Functions/Runtime** for each):

   | Name | What it is |
   |---|---|
   | `DATABASE_URL` | Neon connection string (the database is needed during the build too) |
   | `ADMIN_PASSWORD` | the admin login password (use a NEW one, not the one used while building) |
   | `SESSION_SECRET` | long random text, 32+ characters (use a NEW one) |
   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | from Cloudinary |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | e.g. `919876543210`. It is baked in at build time, so if you change it later you must redeploy |

3. Deploy. `npm install` automatically runs `prisma generate` (see `postinstall` in package.json), and `.nvmrc` pins Node 22.
4. Database tables are created separately, from your own computer, with `npx prisma migrate deploy`
   (using the production `DATABASE_URL`). It is NOT part of the website build.
5. Open `https://<your-site>.netlify.app/admin` and sign in with `ADMIN_PASSWORD`.
