# NovaForge cinematic 3D upgrade

This version keeps the existing NovaForge frontend and on-chain hooks, while replacing the basic procedural scene with a deeper cinematic Three.js scene.

### Scene upgrades
- Procedural shader planets with terrain/cloud layers and atmospheric glow
- Animated emissive sun with procedural surface noise and corona
- Procedural deep-space backdrop and dense starfield
- Instanced-style asteroid belt feel with varied rock geometry
- Detailed player spacecraft silhouettes with engine glow and orbital motion
- Hostile monster geometry with emissive cores, spikes and eyes
- Multiple orbital lanes and energy routes
- Cinematic camera drift and focus state
- Existing tactical HUD/planet selection remains wired to the real `Planet` data

### Install/run
```bash
npm install
npm run dev
```

No external model/texture assets are required; the visual detail is generated with Three.js geometry and GLSL shaders.
