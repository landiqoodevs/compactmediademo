# The Compact Media: public website (Part 1)

Static website: HTML + CSS + vanilla JS. No build step, no dependencies, no accounts needed.

## Structure
```
index.html          page
css/styles.css      styles
js/config.js        SETTINGS: WhatsApp number, API URL, Instagram URL
js/data.js          content (services, sample projects, sample testimonials)
js/api.js           data-access layer (the contract for the future dashboard)
js/main.js          UI logic
assets/             official logo (transparent PNGs + original JPEG)
backend/schema.sql  Supabase schema for Part 2 (optional)
compact-media-single.html  everything in one file (logo embedded)
```

## Run locally
Open `index.html` in a browser, or run `python3 -m http.server 8000` in this folder and visit http://localhost:8000.

## Deploy
Upload the folder contents to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, cPanel). Point the domain at it. No build command; publish directory is the project root.

## Configure (js/config.js)
- `WHATSAPP_NUMBER`: digits with country code, e.g. `919876543210`. Currently set to the owner's number. If empty, the contact form shows "not connected" and WhatsApp buttons are hidden. When set, form submissions open WhatsApp with the inquiry pre-filled.
- `API_BASE_URL`: backend URL. Empty = sample data in `js/data.js` and review submission disabled (shows a clear "not connected" message).

## Content rules
Items flagged `demo: true` show a DEMO badge. Remove them from `js/data.js` (or connect the API) before launch. With no testimonials, the site shows the "Be the first to share yours" empty state.

## API contract (for the dashboard)
All JSON. Public endpoints return **published items only**; drafts never leave the server.
- `GET /projects?status=published` → `[{id,title,client,category("Social Media"|"Ads"|"Design"|"Web"),cover,images[],description,challenge,strategy,execution,outcome,videoUrl,featured,published}]`
- `GET /reviews?status=published` → `[{id,name,business,service,rating(1-5),text,date,avatar,featured}]` (never include email)
- `POST /reviews` (multipart: name, business, email, service, title, rating, text, avatar, consent) → saved as `pending`; never auto-published. Server must rate-limit, validate, and check upload type/size.
`backend/schema.sql` implements this on Supabase with RLS.

## Still needed from the owner
Business WhatsApp number; real project images; real testimonials; results screenshots (not supplied as files); a form of the original reference site if exact layout matching is required.
