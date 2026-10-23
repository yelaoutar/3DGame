# A Little Universe

A Three.js spherical-planet adventure made with vanilla JavaScript and Vite.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173/. VS Code Live Server also works from the project root after installing dependencies.

```sh
npm test
npm run build
npm run preview
```

## Publish online

Follow [DEPLOY.md](DEPLOY.md) to push this project and enable the included GitHub Pages workflow. Any repository name is supported.

## Play

The game opens directly on the planet. WASD/arrows move, Space jumps, dragging rotates the camera, and M mutes sound. Click or press a key to enable browser audio. Five outline hearts at the top right fill as you collect them. The direction arrow guides you around the sphere toward the next heart and then the unlocked portal.

In the garden, approach Youssef to begin the conversation. Click the dialogue buttons to advance the alternating speech bubbles. Youssef introduces himself, she says hey, and they talk about his feelings. He opens a second portal and walks into it automatically. Follow him through the portal to reach a new flower world. Approach him, accept the bouquet, and then answer his proposal. Both answers are respected. Refresh to restart.

Dialogue uses Comic Neue, a comic lettering font from Google Fonts, with Comic Sans MS and cursive fallbacks. Keyboard/mouse gameplay is required; touch movement controls are not included.

## Source

- `scene.js`: renderer, lights, starfield and mesh utilities
- `planet.js`: initial planet, garden and flower world
- `gravity.js`: radial gravity, tangent velocity, jumping and sphere collision
- `player.js`: controls and orientation
- `character-config.js`: active model paths and height (1.65 units)
- `character.js`: GLB loading, animation blending and girl's brown hair
- `camera.js`: parallel-transported follow camera
- `collectibles.js`: hearts and particles
- `guide.js`: HUD and great-circle direction hints
- `audio.js`: procedural sound effects
- `dialogue.js`: speech bubbles anchored above the current speaker
- `story.js`: editable opening conversation
- `progression.js`: portals, boy movement, bouquet handoff and proposal
- `main.js`: animation loop and integration

Active animated characters: [Kenney Mini Characters](https://kenney.nl/assets/mini-characters), CC0. The license is bundled at `public/models/LICENSE-Kenney.txt`. The girl's model is character-female-b; the boy's is character-male-a. The user-supplied static alternatives remain in public/ but are inactive and retain their original licenses.

The controller owns a local +Y up, +Z forward character root, with feet at local Y=0. Ground collision uses the spherical surface; trees and decorations have no collision. Airborne characters are not clamped to the surface. Physics substeps are at most 1/120 second. Camera and player frames use quaternion transport to avoid fixed-world-up pole flips.

Tests cover 360-degree travel including underneath, jumping, camera stability, asset resources and animations, spherical guidance, the dialogue sequence, waiting for the girl to follow through the second portal, bouquet transfer, both proposal answers, and reset. Automated checks do not replace a visual browser playthrough.

The bouquet uses the supplied `public/models/flower_bouquet.glb`, including its embedded textures and original materials. It is preloaded during play, scaled to a handheld size, and transferred from Youssef to the girl in the gift sequence. Its original license applies.


## Youssef's voice message

The proposal asks: "Will you be my girlfriend and my future wife?"
After she chooses Yes, the celebration bubble shows an audio player for `public/Recording.m4a`. She can listen, pause and replay it. Closing the bubble stops playback. The recording is separate from M-key game sound effects.

The path is configured in `src/voice-message-config.js`. Preserve the uppercase R in `Recording.m4a` when uploading to GitHub Pages. Set VOICE_MESSAGE to null to disable the player. Push the recording along with the source changes to publish it.
