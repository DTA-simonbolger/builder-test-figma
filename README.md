# builder-test-figma

Static draft website generated from Figma CSS exports.

## Cloudflare Pages deployment

This repository is prepared for Cloudflare Git deployments using either Pages or Workers static assets.

Use these Cloudflare Pages build settings:

- Framework preset: `None`
- Build command: `npm run build:cf`
- Build output directory: `dist`
- Root directory: repository root

The build is dependency-free. It copies only the production site files into `dist/`, excluding the preserved `*.figma-export.css` source dumps.

If the project is configured as a Cloudflare Worker, `wrangler.toml` also declares `[assets] directory = "./dist"` so `wrangler deploy` can upload the static site without a Worker script.

Useful local commands:

- `npm run validate` - checks deployable HTML links, asset references, and CSS brace balance.
- `npm run build` - creates and validates the Cloudflare deploy output in `dist/`.

On Windows PowerShell, if `npm` is blocked by execution policy, run the same commands with `npm.cmd`, for example `npm.cmd run build`.

Cloudflare-specific files:

- `_headers` - security, cache, and preview indexing headers.
- `_redirects` - clean URL rewrites such as `/about` to `/about.html`.
- `wrangler.toml` - declares the Pages output directory for Wrangler-compatible tooling.
- `robots.txt` - allows indexing on the production domain.
- `404.html` - custom not-found page.

## Pages

- `index.html` - homepage
- `services.html` - services page
- `services-b.html` - government approvals and panels page
- `about.html` - about page
- `team.html` - team and careers page
- `insights.html` - insights and case studies page
- `insights-b.html` - individual insights article page
- `careers.html` - careers and open roles page
- `careers-b.html` - individual job posting page
- `contact.html` - contact and enquiry page

## Source exports

The original Figma CSS dumps are preserved for reference:

- `homepage.figma-export.css`
- `services.figma-export.css`
- `services-b.figma-export.css`
- `about.figma-export.css`
- `team.figma-export.css`
- `insights.figma-export.css`
- `insights-b.figma-export.css`
- `careers.figma-export.css`
- `careers-b.figma-export.css`
- `contact.figma-export.css`

The active deployable stylesheets are:

- `homepage.css`
- `services.css`
- `services-b.css`
- `about.css`
- `team.css`
- `insights.css`
- `insights-b.css`
- `careers.css`
- `careers-b.css`
- `contact.css`
