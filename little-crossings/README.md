# Little Crossings

## Game description

TODO: I created a variant version of Crossy Road, where the main object is same (to cross the road and get the high score). Some of the similarities are synthesized sound effects, including a chicken death sound, randomized tree placement with a connected walking route, water splash/sinking motion when the player falls in. However, the key difference is that my game has a health packs that appear in random reachable spots. Health starts decreasing at 5 per second, and each new fall into water doubles the drain rate for that run. The health bar shows a chicken profile that changes from happy to droopy when health gets low, then becomes a cute skull on death. Press R to restart, M to toggle sound, and use WASD or arrow keys to move.

## How to play

Open `index.html` in a browser or visit the GitHub Pages URL for this folder.
The game is a static HTML/CSS/JavaScript page. It has no build step and no
runtime server requirement. Three.js 0.160.0 is included in `vendor/three` with
its MIT license, so it does not need a CDN or internet connection after the
files are committed.

Click **Let's cross** or press a movement key to start.

- **WASD / arrow keys:** hop one square. Holding a key keeps hopping.
- **Space / Escape:** pause or resume.
- **R:** restart with a fresh world and full health.
- **M:** turn the synthesized sound effects on or off.
- On small screens, use the on-screen movement buttons.

Move forward across roads, rivers and train tracks. The score is the farthest
forward row reached during the run, so moving backward does not reduce it.
Cars, trains and leaving the board end the run. In rivers, ride logs and lily
pads to stay above water. Pink health packs restore 30 health, up to 100.

Energy starts draining at 5 health per second. Each distinct fall into water
doubles the drain rate for the rest of that run: 5, then 10, then 20, then 40
health per second. Staying in the same water fall does not keep doubling it.
Restarting resets the drain rate.

The health display uses a chicken portrait. It is happy above half health,
droopy at half health or lower, and changes to a cute skull when the character
dies. Vehicle hits trigger particles, a ring effect, camera shake and a delayed
game-over panel. Falling into water triggers splash droplets, ripples, sinking
and bobbing. Death plays a synthesized chicken call when sound is on.

## AI model, tools and strategy

Tools used while finishing the project:

- OpenAI Codex in ChatGPT for code inspection, refactoring and implementation.
- Terminal commands for file search, local HTTP serving and repository checks.
- Headless Google Chrome for browser smoke tests and screenshots.

Overall strategy: I rebuilt the game around a small Three.js/ECS structure,
then iterated from actual browser screenshots and tests. I focused on making the
core Crossy Road loop playable first, then added the requested polish: correct
left/right controls, WASD support, health rules, chicken HUD states, sound,
collision effects, water effects, randomized trees and a connected walking path
through grass rows.

## Known broken or unfinished

The game should run as a static GitHub Pages page in a modern WebGL browser.
Audio starts only after a browser gesture, which is normal browser behavior.
The randomized world keeps grass paths reasonably walkable, but it does not try
to guarantee a perfect route through every moving traffic or river timing.
Testing was done in Chrome; other modern browsers should work, but were not
fully tested.

## Local development notes

For normal submission, use the static files directly. The optional `server.py`
file is only a local development helper that disables browser caching while
iterating. It is not required by the game or by GitHub Pages.

Useful local checks:

- `tests/regression.html`: checks world generation, movement, collisions,
  water rules, input, state changes and restart behavior.
- `tests/smoke.html`: loads the real game and checks the chicken profile, 5/s
  starting drain, keyboard movement, pause, restart and sound toggle.
- `tests/impact-ui.html`, `tests/water-preview.html`,
  `tests/health-ui.html`, and `tests/input-energy-sound.html`: focused checks
  for individual requested features.
