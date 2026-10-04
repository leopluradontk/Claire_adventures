# Treat Trail - Beta 1

One quiet side-scrolling level for Claire, Pusheen, Hello Kitty and Raspberry.
Entry point: ../treat-trail.html. No package installation, build step, binary assets or third-party runtime.

## Gameplay

Left, right, jump. Hold jump for more height. Keyboard: arrows or A/D, Space/Up/W.
Sunshine Meadow has 40 treats, 12 raised platforms, three small creek gaps,
three checkpoints and a picnic finish. No enemies, lives, timer or sound.
A fall returns Claire to a safe spot without removing collected treats.
The best completed-run score is saved locally when storage is available;
it does not sync across devices or change Treat Time's unlimited treats.
A reload starts a fresh run. Pause preserves the current run while open.

## Modules and adding levels later

- levels.js: LEVELS array, platform geometry, treat coordinates, goal, checkpoints.
- engine.js: fixed 60 Hz simulation, collisions, jump buffering, followers and scoring.
- renderer.js: vector characters, scenery and animation; SVG is embedded in the code.
- game.js: keyboard/multi-touch input, menus, save handling and main loop.
- style.css: responsive controls and layout.

Duplicate the level object with a new stable id to add a level. Load it with
`treat-trail.html?level=NEW-ID`. A proper level-selection screen can be added
when a second level is ready. Maintain the same data schema; y is a feet coordinate.
No changes to the story catalog are needed for game levels.

Bump asset versions and the root service-worker cache version when publishing.
Keep this directory in the service worker CORE list. Changes are published together
with the home-screen link; story images, story reader and catalog are separate.

## Beta testing

Tested with fixed-step simulations and Chromium desktop/tablet touch emulation.
The full 40-treat route was completed with zero rescues. Checks cover simultaneous
move+jump, release/cancel, left/right, pause/resume, restart confirmation, rescue
without score loss, and finish/replay in desktop, tablet portrait/landscape and
phone landscape layouts. These are not tests on a physical iPad or Safari.
Browser network access was restricted in the test environment, so UI tests used
an in-memory, dependency-inlined version of the same source. Service-worker
installation, migration and offline fallback are separately unit tested.

Diagnostics are available only with `?debug` via window.trailDebug.
