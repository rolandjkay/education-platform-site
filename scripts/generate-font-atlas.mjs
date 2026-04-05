/**
 * Generates an MSDF (Multi-channel Signed Distance Field) bitmap font atlas
 * from all unique characters found in the f-numbers app translation table.
 *
 * Outputs two files into public/apps/f-numbers/fonts/:
 *   label-atlas.png   — MSDF texture atlas
 *   label-atlas.json  — BMFont metrics (glyph positions, advances, kerning)
 *
 * Run automatically as part of `npm run build` via the "prebuild" script.
 * Re-run manually with `node scripts/generate-font-atlas.mjs` whenever
 * translation strings change.
 */
import generateBMFont from 'msdf-bmfont-xml';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root      = path.resolve(__dirname, '..');

// ── 1. Read the Astro component that holds all translation strings ────────────
const source = readFileSync(
  path.join(root, 'src/components/islands/FNumbersSimulator.astro'),
  'utf-8'
);

// Decode \uXXXX escape sequences so we get the actual unicode characters
const decoded = source.replace(
  /\\u([0-9a-fA-F]{4})/g,
  (_, hex) => String.fromCharCode(parseInt(hex, 16))
);

// ── 2. Collect unique characters ─────────────────────────────────────────────
const chars = new Set();

// Always include ASCII printable chars needed for dynamic values
// (numbers, units like "mm"/"m", decimal points, etc.)
const base =
  ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
  '0123456789.,!?-\'"():;/%@#+=<>|`_^&*[]';
for (const c of base) chars.add(c);

// Extract string values from the labels object (matches: key: 'value')
const stringRegex = /:\s*'((?:[^'\\]|\\.)*)'/g;
let match;
while ((match = stringRegex.exec(decoded)) !== null) {
  const raw = match[1]
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g,  '\n')
    .replace(/\\t/g,  '\t');

  // Strip HTML tags (<strong>, etc.) — those strings go into DOM, not 3D text
  const stripped = raw.replace(/<[^>]+>/g, '');

  for (const c of stripped) {
    if (c.codePointAt(0) > 31) chars.add(c); // skip control chars
  }
}

// Remove template placeholders that will never appear as rendered glyphs
chars.delete('{');
chars.delete('}');

const charset = [...chars]
  .sort((a, b) => a.codePointAt(0) - b.codePointAt(0))
  .join('');

console.log(`Collecting ${chars.size} unique characters for MSDF atlas…`);

// ── 3. Generate the atlas ─────────────────────────────────────────────────────
const fontPath = path.join(root, 'scripts/fonts/NotoSansJP-Medium.ttf');
const outBase  = path.join(root, 'public/apps/f-numbers/fonts/label-atlas');

generateBMFont(
  fontPath,
  {
    outputType:  'json',
    fontSize:    48,
    textureSize: [2048, 2048],
    charset,
    fieldType:   'msdf',
    padding:     4,
    roundDecimal: 4,
  },
  (err, textures, font) => {
    if (err) throw err;

    // font.data is already a JSON string; textures[0].texture is a PNG Buffer
    writeFileSync(`${outBase}.png`,  textures[0].texture);
    writeFileSync(`${outBase}.json`, font.data);

    const metrics = JSON.parse(font.data);
    console.log(`Atlas saved: label-atlas.png (${metrics.common.scaleW}×${metrics.common.scaleH}) + label-atlas.json`);
  }
);
