# Article Translation Playbook

Complete step-by-step process for translating an article into all 7 locales, including diagram i18n and native-language references.

Target locales: fr, de, es, it, ja, zh-CN, zh-TW.

## Step 1: Read and analyse the English article

- Read the English MDX file in full
- List all component imports (diagrams, islands, apps)
- Note any interactive elements with visible text (captions, labels, subscripts, overlays)

## Step 2: Ensure all components support i18n

For each imported component, check whether it already has a `locale` prop and `labels` object. If not, add them following this pattern:

```astro
interface Props { locale?: string; }
const { locale = 'en' } = Astro.props;

const labels: Record<string, Record<string, string>> = {
  en: { caption: '...', label: '...' },
  fr: { caption: '...', label: '...' },
  // ... all 8 locales
};

const t = { ...labels.en, ...(labels[locale] ?? {}) };
```

Then replace hardcoded English strings in the template with `{t.key}`.

**What to translate**: figcaptions, text labels in SVG foreignObjects, HTML overlay text, subscript labels.
**What NOT to translate**: KaTeX/LaTeX math expressions, variable names, CSS classes.

## Step 3: Create translated MDX files

For each locale, create `src/content/articles/{locale}/{filename}.mdx`:

- Translate frontmatter: `title`, `description`, `tags` (keep `pubDate`, `subjects` unchanged)
- Fix import paths: `../../components/` becomes `../../../components/`
- Add `export const locale = '{locale}';` after imports, before article body
- Add `locale={locale}` prop to every component tag
- Translate all prose, keeping LaTeX math unchanged
- **Display math must use multi-line `$$` format** — `$$` on its own line, then the expression, then `$$` on its own line. Single-line `$$...$$` is treated as inline math and won't be centred.
- Use locale-appropriate decimal separators (comma for fr/de/es/it) and quote marks (« » for fr, „ " for de, etc.)
- **CJK: no italics** — Chinese and Japanese don't use italic for emphasis (the characters aren't designed for it and look awkward when slanted). Convert `*emphasis*` to `**bold**` in zh-CN, zh-TW, and ja translations.

## Step 4 (optional): Native-language references

If the article has a Further Reading section, replace it with equivalent high-quality resources in the target language:

- Prefer authoritative sources (Wikipedia in that language, university sites, well-known educators)
- For CJK languages, prefer platforms popular in those regions (Bilibili, PanSci, etc.)
- Keep 5-7 resources per language
- Each resource should have a bold title link and a one-line description mentioning how it relates to the article topic

## Step 5: Build and verify

- Run `npm run build` to confirm all pages compile
- Spot-check that locale props are passed correctly (grep for `locale={locale}` counts)

## Parallelisation tips

- Translations for different locales are independent — use parallel agents
- Component i18n and MDX translation can also be parallelised
- Native-language resource finding benefits from parallel web searches per locale
