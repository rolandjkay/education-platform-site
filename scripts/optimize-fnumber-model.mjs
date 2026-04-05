/**
 * One-off optimisation script for f-number.glb.
 *
 * - Removes nodes unused by the app (Camera, Sensor, Ray*)
 * - Simplifies geometry aggressively (target: ~5% of original triangles)
 * - Re-applies DRACO compression
 *
 * Run with: node scripts/optimize-fnumber-model.mjs
 *
 * NOTE: The removed nodes (Camera, Sensor, Ray x6) are preserved in the
 * original file at public/apps/f-numbers/models/Blender/f-number-original.glb
 * should they ever be needed again.
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from '@gltf-transform/extensions';
import { prune, simplify, draco } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import { fileURLToPath } from 'url';
import { copyFileSync, existsSync } from 'fs';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src  = path.join(root, 'public/apps/f-numbers/models/Blender/f-number.glb');
const orig = path.join(root, 'public/apps/f-numbers/models/Blender/f-number-original.glb');
const dst  = src;

// Back up original
if (!existsSync(orig)) {
  copyFileSync(src, orig);
  console.log('Backed up original → f-number-original.glb');
}

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  });
const document = await io.read(src);
const root3 = document.getRoot();

// ── 1. Remove unused nodes ────────────────────────────────────────────────────
const UNUSED = new Set(['Camera', 'Sensor', 'Ray', 'Ray.001', 'Ray.002', 'Ray.003', 'Ray.004', 'Ray.005']);
let removed = 0;
for (const node of root3.listNodes()) {
  if (UNUSED.has(node.getName())) {
    node.dispose();
    removed++;
  }
}
console.log(`Removed ${removed} unused nodes.`);

// ── 2. Prune orphaned meshes/accessors ────────────────────────────────────────
await document.transform(prune());

// ── 3. Simplify geometry ──────────────────────────────────────────────────────
// Note: weld() is intentionally omitted — it corrupts UV seams that the
// externally-applied foil normal map depends on.
await MeshoptSimplifier.ready;
await document.transform(
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.05, error: 0.1 })
);

// Log resulting triangle counts
for (const mesh of root3.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const idx = prim.getIndices();
    const triCount = idx ? idx.getCount() / 3 : '?';
    console.log(`  ${mesh.getName()}: ${Math.round(triCount).toLocaleString()} triangles`);
  }
}

// ── 4. Re-apply DRACO compression ────────────────────────────────────────────
await document.transform(draco());

await io.write(dst, document);
console.log('Done → f-number.glb');
