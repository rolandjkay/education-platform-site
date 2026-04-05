/**
 * Resizes the environment cube map faces from 1024×1024 to 256×256.
 * Overwrites the files in public/apps/f-numbers/textures/environmentMap/.
 *
 * Run automatically as part of `npm run build` via the "prebuild" script.
 * Re-run manually with `node scripts/resize-cubemap.mjs` to regenerate.
 *
 * The originals are preserved in textures/environmentMap/originals/ in case
 * you need to regenerate at a different size in future.
 */
import sharp from 'sharp';
import { existsSync, copyFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root      = path.resolve(__dirname, '..');
const envDir    = path.join(root, 'public/apps/f-numbers/textures/environmentMap');
const origDir   = path.join(envDir, 'originals');
const faces     = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
const TARGET    = 256;

mkdirSync(origDir, { recursive: true });

for (const face of faces) {
  const src  = path.join(envDir, `${face}.jpg`);
  const orig = path.join(origDir, `${face}.jpg`);

  // Back up originals the first time
  if (!existsSync(orig)) {
    copyFileSync(src, orig);
    console.log(`  Backed up ${face}.jpg → originals/`);
  }

  await sharp(orig)
    .resize(TARGET, TARGET)
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(src);

  console.log(`  Resized ${face}.jpg → ${TARGET}×${TARGET}`);
}

console.log('Cube map resize complete.');
