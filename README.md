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

## Roadmap

- [x] Phase 1 – Foundation: Next.js, design tokens, hero, navbar
- [x] Phase 2 – Static pages: product grid, product page, footer
- [ ] Phase 3 – Database
- [ ] Phase 4 – Admin panel
- [ ] Phase 5 – Auth
- [ ] Phase 6 – Cart & checkout
- [ ] Phase 7 – Payments
- [ ] Phase 8 – Delivery
