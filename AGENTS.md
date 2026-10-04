# Figly (figly)

Turn text into copyable figlet ASCII art and try fonts live. Next.js 16 App Router, TypeScript, Tailwind v4, no backend.

## Session Start (mandatory, run before any commit, never ask, never skip)

```bash
git config user.name "mahtamun-hoque-fahim"
git config user.email "mahtamunhoquefahim@gmail.com"
```

## Conventions

- Fonts are curated in `src/lib/fonts.ts` and loaded on demand with one dynamic import each. To add a font, add it to `FONTS` and `FONT_LOADERS`.
- Rendering lives in `src/lib/render.ts` (figlet, frames, case). UI state lives in `src/components/figly.tsx`; the share link is the URL query (`src/lib/url.ts`).
- Theme tokens (colors, hard shadows, fonts) are in `src/app/globals.css` under `@theme`.
- No emojis in code, UI text, commits, or docs.

## Current State

- v0.1: generator, font library (41 curated fonts), copy / snippet / download, share link, frames, case, invert, align, scale, wrap width.
- Not built yet: full 335-font catalog, tests, OG image.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
