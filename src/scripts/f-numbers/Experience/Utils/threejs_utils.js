/**
 * MSDF (Multi-channel Signed Distance Field) text renderer for Three.js.
 *
 * Font atlas and metrics are pre-baked at build time by
 * scripts/generate-font-atlas.mjs, so no font parsing happens at runtime.
 * Loading is just a PNG texture + JSON fetch — fast on any device.
 */
import * as THREE from 'three';

const ATLAS_PNG  = '/apps/f-numbers/fonts/label-atlas.png';
const ATLAS_JSON = '/apps/f-numbers/fonts/label-atlas.json';

// Shared resources — loaded once, reused by every text mesh
let fontData     = null;
let atlasTexture = null;
let loadPromise  = null;

function ensureLoaded() {
  if (loadPromise) return loadPromise;

  loadPromise = Promise.all([
    fetch(ATLAS_JSON).then(r => r.json()),
    new Promise(resolve => {
      new THREE.TextureLoader().load(ATLAS_PNG, tex => {
        // MSDF data must not be gamma-corrected or mipmapped
        tex.colorSpace      = THREE.LinearSRGBColorSpace;
        tex.minFilter       = THREE.LinearFilter;
        tex.magFilter       = THREE.LinearFilter;
        tex.generateMipmaps = false;
        resolve(tex);
      });
    }),
  ]).then(([data, tex]) => {
    fontData     = data;
    atlasTexture = tex;
  });

  return loadPromise;
}

// ── GLSL shaders ──────────────────────────────────────────────────────────────

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform sampler2D uAtlas;
  uniform vec3      uColor;
  varying vec2      vUv;

  float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
  }

  void main() {
    vec3  msdf  = texture2D(uAtlas, vUv).rgb;
    float sd    = median(msdf.r, msdf.g, msdf.b) - 0.5;
    float alpha = clamp(sd / fwidth(sd) + 0.5, 0.0, 1.0);
    if (alpha < 0.001) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ── Geometry builder ──────────────────────────────────────────────────────────

function buildGeometry(text, scale) {
  const positions = [], uvs = [], indices = [];

  const atlasW = fontData.common.scaleW;
  const atlasH = fontData.common.scaleH;

  // Index glyphs and kerning pairs for O(1) lookup
  const charMap = {};
  for (const ch of fontData.chars) charMap[ch.id] = ch;

  const kernMap = {};
  for (const k of (fontData.kernings || [])) {
    kernMap[`${k.first},${k.second}`] = k.amount;
  }

  let cursorX = 0;
  let vi = 0;
  const codePoints = [...text]; // iterate by unicode code point, not UTF-16 unit

  for (let i = 0; i < codePoints.length; i++) {
    const code = codePoints[i].codePointAt(0);
    const g    = charMap[code];

    if (!g) {
      cursorX += fontData.info.size * 0.5; // fallback advance for missing glyph
      continue;
    }

    // Apply kerning from the previous glyph
    if (i > 0) {
      const prev = codePoints[i - 1].codePointAt(0);
      cursorX += kernMap[`${prev},${code}`] ?? 0;
    }

    // Build quad (two triangles) for this glyph
    const x0 = (cursorX + g.xoffset) * scale;
    const x1 = x0 + g.width * scale;
    const y0 = -g.yoffset * scale;           // top of glyph  (y=0 = top of em)
    const y1 = y0 - g.height * scale;        // bottom of glyph

    const u0 = g.x / atlasW;
    const u1 = (g.x + g.width)  / atlasW;
    const v0 = 1 - g.y / atlasH;            // flip V: PNG y=0 is top
    const v1 = 1 - (g.y + g.height) / atlasH;

    positions.push(x0, y0, 0,  x1, y0, 0,  x1, y1, 0,  x0, y1, 0);
    uvs.push(u0, v0,  u1, v0,  u1, v1,  u0, v1);
    indices.push(vi, vi+1, vi+2,  vi, vi+2, vi+3);
    vi += 4;

    cursorX += g.xadvance;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return { geometry, totalWidth: cursorX * scale };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Creates a Three.js Group containing an MSDF text mesh.
 * The mesh is added asynchronously once the atlas has loaded (usually < 1 frame
 * on a warm cache).  The group's position, rotation, and layer mask are set
 * synchronously, so callers can treat the return value like a normal Object3D.
 *
 * Parameters match the original TextGeometry-based version.
 */
export function createTextMesh({ text, size, depth, rotation, position, color, baseline }) {
  const group = new THREE.Group();
  if (rotation) group.rotation.copy(rotation);
  group.position.copy(position);

  // Decode colour from THREE integer (e.g. 0xffffff) to a normalised vec3
  const hex = color ?? 0xffffff;
  const colorVec = new THREE.Vector3(
    ((hex >> 16) & 0xff) / 255,
    ((hex >>  8) & 0xff) / 255,
    ( hex        & 0xff) / 255,
  );

  ensureLoaded().then(() => {
    // Scale factor: we want the rendered cap-height to equal `size` world units.
    // Cap height ≈ 70 % of the font's em square.
    const scale = size / (0.7 * fontData.info.size);

    const { geometry, totalWidth } = buildGeometry(text, scale);

    const lineH = fontData.common.lineHeight * scale; // total line box height

    // ── Horizontal centering ─────────────────────────────────────────────────
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) pos[i] -= totalWidth / 2;

    // ── Vertical alignment ───────────────────────────────────────────────────
    // Raw geometry: y=0 at top of em square, y=-lineH at bottom.
    // 'middle'  → shift up by lineH/2  so centre sits at y=0
    // 'bottom'  → shift up by lineH    so bottom edge sits at y=0
    const yShift = baseline === 'bottom' ? lineH : lineH / 2;
    for (let i = 1; i < pos.length; i += 3) pos[i] += yShift;

    geometry.attributes.position.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      extensions:  { derivatives: true }, // enables fwidth() on WebGL 1
      uniforms:    { uAtlas: { value: atlasTexture }, uColor: { value: colorVec } },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite:  false,
      side:        THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    // Copy the layer mask that the caller already set on the parent group
    mesh.layers.mask = group.layers.mask;
    group.add(mesh);
  });

  // Callers (XArrowControl) call .dispose() when recycling the value label
  group.dispose = () => {
    group.children.forEach(child => {
      child.geometry?.dispose();
      child.material?.dispose();
    });
  };

  return group;
}
