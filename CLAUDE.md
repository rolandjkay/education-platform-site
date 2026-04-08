# Project Guidelines

An Astro-based education platform with articles, projects, and interactive apps, translated into 8 languages.

## Documentation

Detailed reference docs live in `docs/`. Read the relevant file before working in that area:

- [Translation playbook](docs/translation-playbook.md) — full process for translating articles: translate content, i18n diagrams/components, find native-language references
- [i18n setup](docs/i18n-setup.md) — directory structure, routing, import paths, locale list, component i18n pattern, and translation conventions
- [Diagram style guide](docs/diagram-style-guide.md) — colours, strokes, fonts, container CSS, and design tokens for SVG diagram components
- [F-numbers app architecture](docs/f-numbers-app-architecture.md) — Three.js singleton pattern, Astro island integration, layer system, MSDF text, asset pipeline
- [Android fullscreen fix](docs/android-fullscreen-fix.md) — opacity-hide + viewport meta jiggle workaround for Android Chrome layout bug on fullscreen exit

## Key conventions

- **Locales**: en (default, no URL prefix), fr, de, es, it, ja, zh-CN, zh-TW
- **Display math in MDX**: always use multi-line `$$` format (each `$$` on its own line). Single-line `$$...$$` renders as inline math and won't be centred.
- **CJK typography**: never use `*italic*` for emphasis in zh-CN, zh-TW, or ja — use `**bold**` instead. CJK characters aren't designed for italic rendering.
- **Diagram components**: static SVG in `src/components/diagrams/`, interactive islands in `src/components/islands/`. All accept an optional `locale` prop.
- **Import paths in translations**: one directory deeper than English, so use `../../../components/` instead of `../../components/`.
