/**
 * Generates MSDF (Multi-channel Signed Distance Field) bitmap font atlases
 * from all unique characters found in the f-numbers app translation table.
 *
 * Produces one atlas per locale group:
 *   label-atlas-latin.{png,json}  — en / fr / de / es / it
 *   label-atlas-zh-CN.{png,json}  — Simplified Chinese
 *   label-atlas-zh-TW.{png,json}  — Traditional Chinese
 *   label-atlas-ja.{png,json}     — Japanese
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

// ── 2. Extract per-locale character sets ─────────────────────────────────────

// Always include ASCII printable chars needed for dynamic values
// (numbers, units like "mm"/"m", decimal points, etc.)
const base =
  ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
  '0123456789.,!?-\'"():;/%@#+=<>|`_^&*[]';

// Extract string values from a specific locale block in the labels object.
// Looks for lines between `  <localeKey>: {` and the next top-level `},`
function charsForLocales(localeKeys) {
  const chars = new Set(base);

  for (const localeKey of localeKeys) {
    // Match the locale block: en: { ... } or 'zh-CN': { ... }
    const escaped = localeKey.replace('-', '\\-').replace('.', '\\.');
    const blockRe = new RegExp(
      `(?:^|\\s)['"]?${escaped}['"]?\\s*:\\s*\\{([\\s\\S]*?)\\n  \\}`,
      'm'
    );
    const blockMatch = blockRe.exec(decoded);
    if (!blockMatch) continue;

    const block = blockMatch[1];
    const stringRe = /:\s*'((?:[^'\\]|\\.)*)'/g;
    let m;
    while ((m = stringRe.exec(block)) !== null) {
      const raw = m[1]
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g,  '\n')
        .replace(/\\t/g,  '\t');
      const stripped = raw.replace(/<[^>]+>/g, '');
      for (const c of stripped) {
        if (c.codePointAt(0) > 31) chars.add(c);
      }
    }
  }

  chars.delete('{');
  chars.delete('}');

  return [...chars].sort((a, b) => a.codePointAt(0) - b.codePointAt(0)).join('');
}

// ── 3. Atlas groups ───────────────────────────────────────────────────────────

const groups = [
  { name: 'latin', locales: ['en', 'fr', 'de', 'es', 'it'] },
  { name: 'zh-CN', locales: ['zh-CN'] },
  { name: 'zh-TW', locales: ['zh-TW'] },
  { name: 'ja',    locales: ['ja']    },
];

const fontPath = path.join(root, 'scripts/fonts/NotoSansJP-Medium.ttf');
const outDir   = path.join(root, 'public/apps/f-numbers/fonts');

// ── 4. Generate each atlas ────────────────────────────────────────────────────

for (const group of groups) {
  const charset = charsForLocales(group.locales);
  const outBase = path.join(outDir, `label-atlas-${group.name}`);

  console.log(`Generating ${group.name} atlas (${charset.length} chars)…`);

  await new Promise((resolve, reject) => {
    generateBMFont(
      fontPath,
      {
        outputType:   'json',
        fontSize:     48,
        textureSize:  [2048, 2048],
        charset,
        fieldType:    'msdf',
        padding:      4,
        roundDecimal: 4,
      },
      (err, textures, font) => {
        if (err) return reject(err);

        writeFileSync(`${outBase}.png`,  textures[0].texture);
        writeFileSync(`${outBase}.json`, font.data);

        const metrics = JSON.parse(font.data);
        console.log(
          `  → label-atlas-${group.name}.png (${metrics.common.scaleW}×${metrics.common.scaleH}) + .json`
        );
        resolve();
      }
    );
  });
}

console.log('Font atlas generation complete.');
