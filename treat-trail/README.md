# Treat Trail 1.0.0

First non-beta release. Open ../treat-trail.html from Claire Adventures.
No installation, build step, accounts, external game assets or new image uploads.

## Four adventures

1. Sunshine Meadow: the original 40-treat level, pink dress and lavender bows, soft meadow melody.
2. Pumpkin Patch: golden leaves, hay-bale platforms and a pumpkin-barn finish. Claire wears an orange sweater and overalls; the friends wear autumn accessories. Original plucky Pumpkin Parade music.
3. Snowflake Trail: snowy pines, snow-bank platforms and a cocoa lodge. Claire has a warm coat, boots and earmuffs; friends have knitted hats and scarves. Original Snowflake Music Box melody.
4. Sunny Seaside: palm trees, sandy islands and a beach hut. Claire has a turquoise sundress and sun hat; friends have sun hats, a visor and beachwear. Original syncopated Seaside Skip music.

Each level has 40 treats, 12 raised platforms, three little gaps and three safe checkpoints.
160 treats across four separately designed layouts. All four levels are immediately selectable.
The three new soundtracks differ in melody, tempo, key, note length and accompaniment.
Pusheen, Hello Kitty and Raspberry follow Claire in a train and retain the same identity in every outfit.

## Play and finish

Left, right, jump. Hold Jump for more height. Keyboard: arrows/A/D and Space/Up/W.
Touch supports simultaneous direction and jump; bigger buttons are available in Settings.
There are no enemies, lives, timers or penalties for falling. Collected treats are kept after a rescue.
Each finish has the same short skippable fireworks-and-dancing celebration, with themed scenery/outfits.
Three achievement stars: finish / collect at least 30 / collect all 40.
Results offer Next adventure (except on the final trail), Play again and Level menu.
Next adventure resumes any saved run in that next level instead of deleting it.

## Saves and compatibility

Beta 2 meadow geometry, collectible IDs, level version, physics engine and storage keys are unchanged.
Existing meadow progress, best scores, stars, audio settings and accessibility preferences remain compatible.
Each adventure has its own device-local checkpoint save and best score.
Continue restores the last safe checkpoint, retaining all collected treats.
Nothing is synchronized between devices. Clearing website data removes local saves.
Stories, story images and Treat Time are unchanged. Treat Time's treats remain unlimited and separate.

## Sound, access and updates

Audio begins only after Play/Continue/Next is tapped. Music and effects have separate sliders and quick mute.
Opening Settings, pausing or leaving the game stops sound. No music autoplays in the story library.
Gentle Effects (also selected by system Reduce Motion) reduces dancing, uses hearts instead of fireworks
and disables falling snow/leaves. There are no full-screen flashes or screen shakes.
Versioned modules and cache claire-adventures-v6-trail-1.0.0 add offline coverage for all four adventures.
Open online on each device and wait for Saved for offline play before using it offline.
Updating does not clear localStorage. Existing story-page caches are migrated rather than discarded.

## Modular source

- levels.js: geometry, collectibles, safe points, descriptions and music/theme keys.
- themes.js: four scene palettes, scenery, goals and 16 character outfit variants.
- renderer.js: reusable canvas renderer; uses themes.js for the active level.
- engine.js: unchanged fixed-step movement, collisions and follower breadcrumbs.
- celebration.js: dancing and bounded particles using the current outfits.
- audio.js: four original synthesized tracks and sound effects.
- progress.js: unchanged validated per-level saves and settings.
- game.js: input, menus, Next adventure, state transitions, audio and save hooks.
- style.css and release.css: responsive layout and scrollable four-level menu.

Add a level with a unique stable id, theme/music key and safe geometry. Increment that level's version
only when collectible IDs or geometry change. Add new modules to the service-worker and offline checks.

## Release verification and limits

All four deterministic physics routes collected 40/40 treats with zero rescues.
244 Chromium UI assertions passed (61 each in desktop, tablet landscape, tablet portrait and phone landscape).
Checks cover level cards, old meadow saves, soundtrack/outfit changes, nonzero bounded audio output,
simultaneous move+jump, touch release, settings/pause, fireworks, stars, Next adventure, button bounds,
independent best scores and no runtime exceptions. Data checks cover 16 outfit variants, 4 melodies,
independent checkpoint saves and retained treats after rescue. Previous progress/physics tests also pass.
Service-worker unit tests cover core installation, old-cache migration, unrelated-cache preservation,
query-normalized offline fallbacks and network-first updates.

Browser network navigation is restricted in this environment. UI tests used an in-memory module harness
with the same source and a localStorage test double, not production network navigation or real persistent
browser storage. No physical iPad or native Safari test was performed. Test touch, sound and offline
startup on Claire's iPad after publishing. The source remains in Git history for rollback.
