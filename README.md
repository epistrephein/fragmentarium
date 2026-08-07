# FragmentAstro

An [Astro](https://astro.build/) template for publishing a serialized novel
static site, built from ordered Markdown fragments.

It provides routing, archive, continuous reading, RSS feed, social metadata,
drafts and deployment.

## Usage

Requirements:

- Node.js 24+

Local development:

```sh
npm install
npm run dev
```

Commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the development server. |
| `npm run build` | Builds the static site into `dist/`. |
| `npm run preview` | Serves the `dist/` output locally. |
| `npm run new` | Creates the next Markdown fragment as a draft. |
| `npm run drafts` | Lists existing drafts, ordered by number. |
| `npm run publish <N>` | Publishes fragment `N` by removing `draft: true`. |

## Content

Fragments live in `src/content/story/` and use a consistent naming convention:

```text
fragment-001.md
fragment-002.md
fragment-003.md
```

Each file must contain this frontmatter:

```yaml
---
published: 2026-08-07
order: 1
description: A short fragment description.
draft: true
---
```

- `published` is the publication date in `YYYY-MM-DD` format.
- `order` is a unique positive integer that defines reading order.
- `description` is optional and is used in the archive and RSS feed.
- `draft: true` excludes a fragment from the site, archive, and RSS feed.

## Customization

Before using this template for a real site, update at least:

- `site` in `astro.config.mjs`
- the title, description, author name, and navigation labels in `src/layouts/Base.astro`
  and the pages in `src/pages/`
- content in `src/content/story/`
- the favicon and social image in `public/`

## Routes

Pages are generated statically:

- `/` — home page
- `/archive/` — list of published fragments
- `/read-all/` — continuous reading page
- `/fragments/:order/` — individual fragment
- `/about/` — informational page
- `/rss.xml` — RSS feed

## Deploying to GitHub Pages

The workflow in `.github/samples/deploy.yml` builds and deploys the site on
every push to `main`.

1. Push the repository to GitHub.
2. In **Settings → Pages**, select **GitHub Actions** as the publishing source.
3. Rename `.github/samples/deploy.yml` to `.github/workflows/deploy.yml`.
4. Push to `main`.

For a custom domain, set `site` to the final URL, add `public/CNAME` containing
the domain, and configure DNS with your provider.

For a project site at `https://username.github.io/repository/`, also set
`base: '/repository'` in `astro.config.mjs` and ensure internal links respect
that prefix.

## License

This project is released as open source under the terms of the [MIT License](LICENSE.md).
