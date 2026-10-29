# External APIs & Image Sources

## Wikimedia Commons Thumbnails

When downloading images from `upload.wikimedia.org`, you **must** use one of the
standard thumbnail widths. Any other width returns HTTP 400 or 429.

**Valid sizes (px):** `20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840`

Example URL pattern:
```
https://upload.wikimedia.org/wikipedia/commons/thumb/{hash}/{Filename}.jpg/500px-{Filename}.jpg
```

**Rate limits:** ~3 requests per 10 seconds per IP. Exceeding this returns 429
for an extended cooldown period (minutes, not seconds). Space downloads with
`sleep 5` between requests.

**For this project:** Gallery painting images use 500px thumbnails, stored locally
in `public/gallery/`. If adding new paintings, download once and commit the file.
Do not hotlink — Wikimedia blocks non-standard referrers in production.
