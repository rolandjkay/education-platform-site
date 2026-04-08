# SVG Diagram Style Guide

Style conventions for Astro diagram components in `src/components/diagrams/`.

## Component structure

- Astro components (`.astro`) in `src/components/diagrams/`
- Wrapped in `<figure class="diagram">` with `<figcaption>`
- Supports i18n via `locale` prop and labels record (see [i18n setup](i18n-setup.md) for pattern)
- Imported into `.mdx` articles via `import Foo from '../../components/diagrams/Foo.astro';`

## SVG properties

- `width="100%"`, `height: auto` — always responsive
- `viewBox` sized to content (typically 400-800 wide, 300-430 tall)
- `aria-label="..."` and `role="img"` for accessibility
- `preserveAspectRatio="xMinYMin meet"` when needed

## Colour palette

### Subject theme colours (from design system)
- Primary brand: `#ea580c` (orange)
- Maths: `#6366f1` (indigo)
- Science: `#0891b2` (cyan)
- Finance: `#16a34a` (green)

### Diagram element colours
- **Structural lines / shapes**: `#555` (dark grey)
- **Accent / highlight lines**: Use the subject theme colour (e.g. `#6366f1` for maths articles)
- **Important markers / dots**: `#d63030` (red)
- **Light rays / optical paths**: `orange`, `#ff927d` (optics diagrams)
- **Lenses**: `blue`, opacity 0.5 (optics diagrams)
- **Annotations / muted text**: `#aaa`, `#999`
- **Primary text**: `#333`
- **Grid / axis lines**: `#e6e6e6`, `#ddd`
- **Shaded fills**: Subject colour at low opacity (e.g. `#6366f1` opacity 0.08)

## Stroke widths

- **Primary lines**: `2px` (shapes, rays, main elements)
- **Dimension / annotation lines**: `1.5px`
- **Grid / fine detail**: `1px`
- **Graph curves**: `2.5px`
- **Dashed lines**: `stroke-dasharray="6,4"` or `"5,4"` for construction lines

## Typography in SVG

- **Labels**: `font-size="14"`, `fill="#333"`
- **Axis / small labels**: `font-size="12-13"`
- **Math variables**: `font-family="serif"`, `font-style="italic"`
- **Descriptive text**: `font-family="sans-serif"`
- **Alignment**: `text-anchor="middle|start|end"` as appropriate

## Container CSS (shared across all diagrams)

```css
.diagram {
  margin: 2rem 0;
}

.diagram svg {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--radius);        /* 12px */
  background: var(--color-bg-alt);     /* #f9fafb light grey */
  padding: 1rem;
}

.diagram figcaption {
  font-family: var(--font-sans);       /* Source Sans 3 */
  font-size: 0.875rem;
  color: var(--color-text-muted);      /* #6b7280 */
  text-align: center;
  margin-top: 0.5rem;
}
```

## Design tokens (CSS variables from global.css)

- `--font-sans`: 'Source Sans 3', system-ui, sans-serif
- `--radius`: 12px
- `--color-bg-alt`: #f9fafb
- `--color-text-muted`: #6b7280
- `--color-primary`: #ea580c

## Tips

- Use `var(--color-bg-alt, #f9fafb)` with fallback when referencing CSS vars inside SVG fills
- Keep diagrams static SVG where possible; use JS only for interactive elements
- Use clip paths to constrain plot areas in graphs
- Right-angle markers: small `<rect>` with `fill="none" stroke="#aaa"`
