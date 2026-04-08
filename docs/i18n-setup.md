# i18n and Translation Setup

How article/project translations work — directory structure, routing, import paths, locale list, and conventions.

## Supported locales

Configured in `astro.config.mjs`:
- **en** (default, no URL prefix)
- fr, de, es, it, zh-CN, zh-TW, ja

`prefixDefaultLocale: false` — English URLs have no `/en/` prefix.

## Directory structure

Translations live in language subdirectories with **identical filenames**:

```
src/content/articles/
├── pi.mdx              → /articles/pi
├── fr/pi.mdx           → /fr/articles/pi
├── de/pi.mdx           → /de/articles/pi
└── ...
```

Same pattern for `projects/` and `apps/`.

## Routing

- `/src/pages/articles/[...slug].astro` — serves English only
- `/src/pages/[locale]/articles/[...slug].astro` — serves translations, falls back to English if translation doesn't exist

## Import paths

Because translations are one directory deeper, component imports use `../../../components/` instead of `../../components/`.

## i18n utilities

`src/i18n/utils.ts` has helpers:
- `getContentLocale(id)` — extracts locale from file path
- `getContentSlug(id)` — strips locale prefix to get base slug
- `localePath(path, locale)` — builds correct URL
- `getLocaleArticles(locale)` — gets articles for a locale (falls back to English)

## UI strings

`src/i18n/ui.ts` — all navigation/label strings in all 8 languages.

## Diagram/component i18n strategy

Astro diagram components (`.astro` files in `components/diagrams/` and `components/islands/`) use a **locale prop + labels object** pattern:

1. **Component side** — accept an optional `locale` prop, define a `labels` Record with translations for all 8 locales, merge with English fallback:
   ```astro
   interface Props { locale?: string; }
   const { locale = 'en' } = Astro.props;

   const labels: Record<string, Record<string, string>> = {
     en: { caption: '...', otherKey: '...' },
     fr: { caption: '...', otherKey: '...' },
     // ... all 8 locales
   };

   const t = { ...labels.en, ...(labels[locale] ?? {}) };
   ```
   Then use `{t.caption}`, `{t.otherKey}` etc. in the template. KaTeX math expressions stay in the component (not translated).

2. **MDX side** — each translated MDX file exports its locale and passes it to every component:
   ```mdx
   export const locale = 'fr';

   <PiSquareDiagram locale={locale} />
   <SphericalCapExplorer locale={locale} />
   ```

3. **What to translate**: figcaptions, text labels inside SVG foreignObjects, subscript labels in HTML overlays. Mathematical expressions (KaTeX) are **not** translated.

## Translation conventions

- Same `pubDate` as English
- Same `subjects` as English
- Translate `title`, `description`, `tags`
- Keep all LaTeX math, component tags, and URLs unchanged
- Use locale-appropriate decimal separators in prose (comma for FR/DE/ES/IT)
- Adjust quote marks to locale convention (« » for French, „ " for German, etc.)
