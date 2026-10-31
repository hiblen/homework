# Homework

A small static site: a homepage of subjects, each listing its homework pages.
Deployed to Cloudflare Workers (static assets) the same way as `danisbaloons`.

## Adding homework

1. Drop the HTML file into the subject's folder (e.g. `French/`).
2. Add an entry to `site.json` under that subject:
   ```json
   { "title": "November 2026", "file": "my-homework.html" }
   ```
3. To add a subject, create its folder and add a new entry to `subjects`.

`npm run build` writes the site to `dist/` and fails if a listed file is missing.

## Local

```sh
npm install
npm run dev      # build + wrangler dev on http://localhost:8787
```

## Cloudflare pipeline (Workers Builds)

In the Cloudflare dashboard: **Workers & Pages → Create → Import a repository**, pick
`hiblen/homework`, then set:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Preview command:** leave Cloudflare's default (gives preview URLs for other branches)

Every push to `main` then builds and deploys. Config lives in `wrangler.jsonc`;
add a `routes` block there if you want a custom domain.
