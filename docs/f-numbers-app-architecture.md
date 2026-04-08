# F-Numbers Three.js App Architecture

Reference for the existing Three.js app at `apps/f-numbers`.

## Key files

- **Astro page**: `src/pages/apps/f-numbers.astro` (+ i18n variants)
- **Island component**: `src/components/islands/FNumbersSimulator.astro`
- **Experience singleton**: `src/scripts/f-numbers/Experience/Experience.js`
- **App directory**: `src/scripts/f-numbers/`
- **Public assets**: `public/apps/f-numbers/`

## Architecture

Singleton `Experience` class accessed via `window.experience`:

```
Experience (singleton)
├── Controls (lil-gui, debug mode only)
├── Sizes (canvas dimension tracker, EventEmitter)
├── Time (rAF loop, EventEmitter, emits 'tick')
├── MouseEvents (centralised input: mouse + single-touch)
├── Camera (perspective + OrbitControls with damping)
├── SecondaryCamera (square overlay for sensor view)
├── Renderer (dual-pass rendering with layer system)
└── World (all scene objects)
```

## Integration with Astro

- Canvas + overlays in `.astro` island component
- Translations baked into `data-translations` and `data-locale` attributes at build time
- 8 languages supported (en, fr, de, es, it, zh-CN, zh-TW, ja)
- Mobile: lazy init behind "Launch App" button; desktop: immediate
- Canvas height: 70vh

## Three.js setup

- **Camera**: Perspective (FOV 35), position (6, 4, 8)
- **Controls**: OrbitControls with damping
- **Lighting**: Directional ("sun"), intensity 4, PCF soft shadows (1024 sq)
- **Environment**: Cubemap (6 JPG faces), SRGBColorSpace, intensity 2.5
- **Tone mapping**: CineonToneMapping, exposure 1.75
- **Pixel ratio**: capped at 2x

### Layer system
- Layer 0: Main (all visible objects)
- Layer 1: Control layer (interactive handles, not on image plane)
- Layer 2: Sensor view layer (overlay)

## Key patterns

- **EventEmitter** base class (on/off/trigger) used by Time, Sizes, Resources, MouseEvents
- **Singleton**: `Experience` stored as static instance
- **Reactive controls**: `XArrowControl` (draggable values) and `ToggleControl` (visibility)
- **MSDF text**: Custom shaders + pre-baked font atlases per locale (Latin, CJK variants)
- **Resource loading**: GLTFLoader with DRACO compression, TextureLoader, CubeTextureLoader

## Central control state

```javascript
Experience.controlParams = {
  focalLength: 1000,        // mm
  objectDistance: 5,         // m
  isTubeVisible: true,
  isCameraBodyVisible: true,
  isHemisphereVisible: false
}
```

## Update loop

```
Time.tick() -> Experience.update()
  |- Camera.update() (OrbitControls)
  |- SecondaryCamera.update() (follow focal length)
  |- World.update() (all objects)
  +- Renderer.update() (dual pass)
```

## Assets

- 2 GLTF models (DRACO compressed)
- 6 cubemap faces (JPG)
- 6 PBR textures (diffuse + normal)
- Font atlas PNG + JSON per locale (4 variants)
- DRACO wasm decoder in `public/apps/f-numbers/draco/`

## File structure

```
src/scripts/f-numbers/
├── Experience/
│   ├── Experience.js
│   ├── Camera.js, SecondaryCamera.js, Renderer.js
│   ├── Controls.js, LoadingScreen.js
│   ├── Utils/ (EventEmitter, Sizes, Time, MouseEvents, Resources, threejs_utils, utils)
│   ├── World/ (World, Environment, ImagePlane, Tube, CameraBody, Foil, Sensor,
│   │          ObjectPlane, Sun, CameraViewProvider, ImageHemisphere, LightPath,
│   │          PyramidOfVision, XArrowControl, ToggleControl, ExposureMeter,
│   │          ExposureGraph, TopBar, FlyByTour, ViewfinderOverlay, etc.)
│   └── sources.js (asset manifest)
└── script.js (entry point)
```

## Performance notes

- DRACO compression for models
- WebP textures
- MSDF shaders for crisp text at any scale
- Lazy init on mobile
- No runtime locale switching (would require re-creating text meshes)
