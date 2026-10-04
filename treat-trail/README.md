# Treat Trail - Beta 2

One side-scrolling level: Sunshine Meadow. Claire leads Pusheen, Hello Kitty and Raspberry.
Entry point: ../treat-trail.html. Static files only: no installation, build step, external assets or runtime libraries.

## What's new

- A 5.4-second skippable finish celebration. Friends gather and dance; small pastel fireworks,
  hearts and a synthesized victory tune play before the result bar appears below the scene.
- A full-treat run has an extra heart-shaped burst. Friends keep dancing on the results screen.
- Original, looping meadow music, plus jump, pickup, checkpoint, rescue and soft firework sounds.
- Separate music/effects volume, quick mute, Gentle Effects and larger touch buttons.
- Saved unfinished adventures: continue from the last checkpoint with every collected treat retained.
- A level menu with a picture card, best score, Continue Adventure and Start Again confirmation.
- Achievement stars: 1 for completing, 2 for at least 75% of treats, 3 for every treat.
  Stars never lock access to a level. With 40 treats the thresholds are finish / 30 / 40.

## What stays the same

Left, right, jump. Hold Jump for more height. Keyboard: arrows or A/D, Space/Up/W; Escape pauses.
Sunshine Meadow still has 40 treats, 12 raised platforms, three creek gaps and three checkpoints.
The original physics engine and all level geometry are unchanged. No enemies, lives or timer.
Falling returns the group to safety without losing treats. Treat Time still has unlimited treats;
this mini-game does not spend or transfer them. Stories and story images are untouched.

## Progress and settings

Local storage only. No account, cloud save, telemetry or cross-device synchronization.
Beta 1's `claire-treat-trail-best:LEVEL-ID` key is preserved and supplies the initial stars.
Incomplete runs use `claire-treat-trail-save:LEVEL-ID` with a schema and level-data version.
Checkpoint index and collectible IDs are validated before use; world coordinates come from level data.
Saves happen on pickup, checkpoint, pause, menu, hiding and leaving the page.
Continue resumes at the safe checkpoint, not the exact position between checkpoints.
A completion clears the unfinished run; replay starts fresh without reducing the best score.
When browser storage is unavailable, play continues and the interface reports that saving is unavailable.
Settings use `claire-treat-trail-settings:v2`. Clearing website data removes these device-local saves.

## Audio and accessibility

The AudioContext is created/resumed from a Play/Continue interaction. No autoplay on arrival.
The sequencer schedules a short look-ahead of oscillator notes; sources are stopped on pause or leaving.
The victory tune uses the music slider; sound effects use the effects slider. Quiet mode mutes both.
Settings pause gameplay and audio. Backgrounding the page pauses rather than silently resuming it later.
Gentle Effects uses slow floating hearts, reduced dance movement and quieter chimes instead of noise pops.
System Reduce Motion also enables Gentle Effects. No full-screen flashes or screen shaking.
The game has keyboard focus handling, named controls, a restart confirmation and large-button option.

## Modules and future levels

- levels.js: level definitions. `music: 'meadow'` chooses the soundtrack. `version` is the save/geometry version.
- engine.js: original Beta 1 fixed-step simulation, collisions, followers and event generation; unchanged.
- renderer.js: original scenery and vector character renderer; unchanged.
- celebration.js: finish-only camera/scenery extension, dancing and bounded firework particles.
- game.js: keyboard/multi-touch, menus, state transitions, saves and the main loop.
- progress.js: validated checkpoint saves, legacy best scores, star thresholds and settings.
- audio.js: Web Audio sound effects, sequencer and original TRACKS definitions.
- style.css: base Beta 1 layout; unchanged. beta2.css adds menus, results and settings.

Add a level object to LEVELS with a stable unique ID; the menu generates its card automatically.
Add a distinct track to TRACKS in audio.js and use its key in the level's music field.
A track specifies bpm, oscillator waveform, root MIDI pitch, melody offsets and chord offsets.
Zero melody entries are rests. No additional level or soundtrack is selectable in this beta.
Changing collectible IDs or geometry should increment that level's version to invalidate incompatible saves.
New game modules must be listed in the root service-worker CORE and site-update offline checks.
Publish the full update atomically; update asset query versions and the service-worker cache name together.

## Testing and limits

Beta 2 passed 42 Chromium UI checks using the system browser with an in-memory module harness,
including desktop, tablet portrait/landscape, phone landscape, real synthesized audio signal output,
two-finger move+jump, mute, pause/resume, saves across document recreation, settings persistence,
restart confirmation, all three star thresholds, old best-score migration, celebration skip and completion.
Additional Node tests cover corrupt/versioned saves, blocked storage, geometry/physics regressions,
the full 40-treat route with zero rescues, and service-worker installation/migration/offline fallback.
The harness inlines the same ES modules because browser network navigation is restricted in this environment;
it does not test production network loading or a real device's persistent storage.
No physical iPad/Safari testing has been performed. Test sound, multi-touch and offline launch on Claire's iPad.

Debug hooks are only installed with ?debug. Beta 1 source remains in Git history for rollback.
