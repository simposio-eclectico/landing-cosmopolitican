# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The website for **Cosmopolitican** ("Tu revista con Clase"), a Chilean digital magazine (`revista`). Built with Astro. The `revista` content collection is the actual product — a monthly issue (`Nº 01`, etc.) made of articles, columns, interviews and video pieces organized by section. See `docs/revista-editorial.md` for the editorial line/positioning if content decisions come up.

## Commands

- `pnpm dev` — local dev server at `localhost:4321`
- `pnpm build` — runs `clean:astro` → `validate:images` → `astro build`; always run this (or at least `validate:images`) after touching `src/content/revista/**` or `src/content.config.ts`
- `pnpm validate:images` — standalone check of image/frontmatter rules in revista content (`scripts/validate-images.mjs`)
- `pnpm preview` — serve the production build locally
- `pnpm astro check` — type-check `.astro` files
- `pnpm lint` — formats with Biome (`pnpx @biomejs/biome format --write`); Biome (not ESLint/Prettier) is the formatter/linter, tabs, double quotes, import organization on

No test runner is configured in this repo.

## Architecture

### Content collections (`src/content.config.ts`)
Two collections: `blog` (unused starter leftover) and `revista` (the real one). The `revista` schema has cross-field `.refine()` validation enforced at build time:
- `imageAlt` required whenever `image` is set
- `imageCaption` required when `theme: "featured"` has an `image`
- `imageCredit` required whenever `imageLicense` is set

`menuSection` is a fixed enum (`editorial`, `reportajes`, `columnas`, `entrevistas`, `podcast`, `internacional`) defined in `src/consts.ts` (`MENU_SECTIONS`) — this drives both the schema and the top nav (`TOP_NAV_MENU_SECTIONS`).

### Content file layout
`src/content/revista/{menuSection}/{slug}.mdx`, e.g. `src/content/revista/reportajes/modo-avion.mdx` (flat — content is not organized into per-issue folders; `issueNumber` is just a frontmatter field, not a directory). This applies to every `menuSection` including `editorial`: there is one editorial article per issue, they all accumulate under `src/content/revista/editorial/{slug}.mdx`, and the hero on the homepage always shows the most recent one by `pubDate` (see `getLeadArticle` in `src/lib/revistaMenu.ts`) — never a fixed slug. Images referenced by an article live in `src/assets/revista/imagenes/{slug}/`, relative-pathed from the MDX. `theme: "featured"` articles get the special hero treatment; `format: "video"` articles render through `VideoArticle`/`VideoPlayer` instead of the normal article body.

### Importing articles
Articles are typically authored externally (Word → AI-generated MDX via the prompt in `docs/prompt-articulos.md`) and then imported. There's a Cursor skill for this at `.cursor/skills/import-revista-articulo/` (script: `scripts/import-articulo.mjs`) that copies the MDX into place — flattening away any per-issue folder (`n01`, `n02`, …) the source may include, since the repo doesn't organize content that way — maps loose images into `src/assets/revista/imagenes/{slug}/`, and flags `PENDIENTE:` placeholders that still need editor input (captions/credits) before the schema `.refine()` checks will pass. Follow that skill's workflow when handling an "import this article" style request instead of hand-rolling the file moves.

### Page/routing structure
- `src/pages/revista/[slug].astro` — single article page; resolves `Content` via `render(post)`, computes reading time (`@lib/articuloMeta`), related articles (`@lib/revistaMenu`), and picks hero/video/summary components based on `post.data.theme`/`format`.
- `src/pages/revista/seccion/[menuSection].astro` — per-section listing.
- `src/pages/revista/numeros.astro`, `src/pages/revista/index.astro` — issue/index listings.
- `src/layouts/ElegantLayout.astro` — the shared shell: builds the nav, the mobile drawer menu (`@lib/revistaMenu`), and the client-side search index (`@lib/searchIndex`) from the full `revista` collection on every page render.

### `src/lib/` helpers (each is narrowly scoped, read before duplicating logic)
`revistaMenu.ts` (drawer/nav/related-articles derivation from the collection), `revistaImages.ts`, `searchIndex.ts` (builds the data behind `SearchModal`), `articuloMeta.ts` (word count/reading time), `imageMeta.ts`, `videoArticle.ts`, `spotifyEmbed.ts`, `summaryMarkdown.ts`, `revistaMdxComponents.ts` (components auto-available inside MDX bodies, e.g. `ArticleFigure` — also registered in `astro.config.mjs`'s `mdx()` integration), `authorMeta.ts` (author slug generation and href generation).

### Feature flags & env
`src/lib/featureFlags.ts` wraps `astro:env/client` vars (schema in `astro.config.mjs`). Public env vars: `PUBLIC_SHOW_SECTION_DESCRIPTIONS`, `PUBLIC_GA_MEASUREMENT_ID`, `PUBLIC_META_PIXEL_ID` — see `.env.example`. `SHOW_UNDER_CONSTRUCTION` in `src/consts.ts` gates the under-construction UI (`UnderConstruction.astro`).

### Path aliases (`tsconfig.json`)
`@components/*`, `@layouts/*`, `@assets/*`, `@styles/*`, `@lib/*`, `@consts` → `src/consts.ts`.

### Design reference
Visual system (colors, type scale, grid) for the "Especial" cover layout is fully specified in `docs/guia-diseno-web.md` — consult it before making styling decisions in `src/styles/` or revista components rather than guessing values.

### Author pages
Dynamic author pages at `/revista/autor/{autor-slug}` auto-generate from the unique authors in the collection. Each page:
- Lists all articles by that author, sorted by date (newest first)
- Shows author name, article count, and a clean reading list
- Author names in article headers are clickable links to their pages
- URLs auto-generate from author names using `getAuthorSlug()` (handles accents, spaces, etc.)

Helper: `getAuthorHref(authorName)` returns the URL for a given author.

### Deployment
GitHub Actions (`.github/workflows/build.yml`) builds on push to `main` and deploys `dist/` to GitHub Pages. `dist/` is committed output from local builds and should not be hand-edited.
