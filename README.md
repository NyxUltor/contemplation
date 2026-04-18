# contemplation

Initial portfolio framework for Nyx Ultor, built with **Vite + React + Three.js**.

## Included

- Full-page hero with atmospheric Three.js scene (fluted column + fallen-angel placeholder)
- Scroll-influenced helix camera movement and slow auto-orbit
- Portfolio sections: Hero, About, Work, Services, Hire, Footer
- Glassmorphism cards and animated background blobs
- Custom typography palette and crimson progress indicator
- Feather-style custom cursor with hover expansion

## Development

```bash
npm install
npm run dev
```

## Build and lint

```bash
npm run lint
npm run build
```

## Placeholder 3D model path

When ready, place the Blender export at:

`/public/models/fallen-angel.glb`

The hero scene attempts to load this file with `GLTFLoader`, and falls back to the built-in placeholder statue if it is not present.
