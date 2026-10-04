# Claire Adventures 1.2.0 - Stuffy Playroom

Adds Memory Match (../memory-match.html) and Stuffy Snake (../stuffy-snake.html).
Based on main dff6b7b6e21d122dba6ed5df6e03f21266edadea (Stuffy Studios 1.1.0).
Recovery branch: backup/pre-playroom-1.2.0. The existing story, colouring, bakery,
wardrobe, Treat Time and trail files remain in place. No new image uploads are needed.

## Memory Match

Easy: 12 pairs / 24 cards. Medium: 18 / 36. Hard: 24 / 48. Expert: 30 / 60.
Adventure: seven boards with 12, 15, 18, 21, 24, 27 and 30 pairs.
There are 44 fixed illustration recipes made with the established character SVGs.
Easy always mixes four solo, four duo and four trio pictures. Higher boards add more
arrangements, groups of four, and large seasonal outfit differences. Two copies of
one recipe use the exact same SVG. Each selected design occurs exactly twice.
Card backs are identical. Character appearance does not change in a saved board.

All cards fit on the playing screen; landscape iPad is the intended dense-board layout.
At the tested 1024 x 768 landscape size, even 60 cards remain visible without scrolling.
Look closer enlarges currently revealed pictures and pauses the clock while comparing.
Flip transitions, matched ticks, gentle celebrations, pairs and move counters are included.
Mismatches stay up for 1.25 seconds; no third card can be opened until they close.
Optional Peek hint shows the board for 2.6 seconds and labels the run as helped.
Personal best moves and optional best elapsed time are separate for helped/unhelped runs.
There is no time limit or reward penalty for hints. Pause stops the clock and reveal delay.
Boards, revealed cards, matched pairs, moves and Adventure progress save locally.
Start again asks for confirmation; switching modes saves unfinished boards separately.

## Stuffy Snake

A 20 by 14 garden. Claire is the head, with a short two-friend starting tail.
Each collected friend joins the end of the tail. Existing worn outfits are reused.
All modes are selectable immediately, independent of Adventure progress:

| Mode | Step interval | Edges | Tail | Fixed flower-bed cells |
| --- | --- | --- | --- | --- |
| Beginner | 480 ms | Wrap | Safe to touch | 0 |
| Easy | 350 ms | Wrap | Collision ends round | 0 |
| Medium | 280 ms | Solid | Collision ends round | 0 |
| Hard | 225 ms | Solid | Collision ends round | 8 |
| Very Hard | 205 down to 160 ms | Solid | Collision ends round | 14 |
| Expert | 180 down to 135 ms | Solid | Collision ends round | 24 |

Very Hard and Expert reduce the step interval by 3 ms per collected friend until the cap.
Obstacle positions and mode rules never change unexpectedly during a round.
Obstacle layouts leave a connected garden with open corridors and a safe starting line.
Collectibles are chosen only from reachable free cells, never tail or flower-bed cells.
If the tail temporarily seals every free route, spawning waits until a space opens.
Filling all available cells produces a win, not a false collision or an infinite spawn loop.

Large arrow buttons, optional garden swipes and keyboard arrows/WASD steer the line.
A two-turn buffer applies at most one direction per movement tick. Reversal into the
neck is prevented. The vacating last tail cell can be entered when not collecting.
Play begins with a 3-2-1 countdown. Resume also counts down. Pause, restart confirmation,
Home, mode menu, friendly round-over/replay and collection milestones are included.
Hiding or leaving the app pauses it and saves the round; it does not resume silently.
Best scores are separate for all six difficulties. Unfinished rounds can be continued.

Adventure follows all six modes, with targets 5, 8, 10, 12, 15 and 18 friends.
Reaching a target saves stage completion, celebrates and offers the next stage.
The next stage starts with a fresh short line and countdown. Rules are shown before play.
Tap Rules to hear them using an available installed local English voice. Remote voices
are not selected; picture instructions and text remain usable without speech.

## Rewards, sound and storage

Uses the established friendship-star total: trail stars + bakery orders + playroom stars.
Completing a memory board earns one star. Snake earns a star at each new five-friend
best-score milestone for a mode, plus a one-time bonus for each Adventure stage.
Repeating a lower score or losing a round never deducts stars. Wardrobe milestone
unlocks recognise the new stars. Existing scores, recipes, outfits and favourites are not reset.

The additive localStorage key is claire-arcade:v1. Save validation checks board identities,
paired designs, legal snake cells, contiguous bodies and supported modes. A failed save
reports that saving is unavailable and uses session-only fallback rather than claiming durability.
The prior trail/studio keys and the colouring IndexedDB are not cleared or migrated.
Clearing website data removes device-local saves; source ZIPs cannot contain private device data.
Shared music/effects volume, mute, Gentle Effects and bigger-button preferences are reused.
Music uses the existing soft original tracks; all audio stops when pausing/leaving.

## Offline and modules

Cache claire-adventures-v9-playroom-1.2.0 adds both activities and their dependencies.
Old story caches are migrated; unrelated caches are untouched. Open online on each device
and wait for Saved for offline play. The same website and iPad icon are used.

designs.js: 44 immutable recipes and card composition from existing character assets.
memory-model.js: pure pairing/reveal/hint state machine and validated restoration.
snake-model.js: pure grid movement, buffering, spawning, collisions and mode definitions.
store.js: independent per-mode progress, personal bests and additive star awards.
common.js: existing settings/audio helpers, modal focus handling and celebrations.
memory-app.js / snake-app.js: UI, touch, keyboard, pause and persistence integration.
snake-art.js: canvas garden using the original character artwork and saved outfits.
style.css: responsive gallery, dense boards and controls.

## Verification and remaining device checks

336 completed Chromium UI assertions cover four viewport layouts, all board sizes,
all six Snake modes, Adventure transitions, matching and rapid taps, card bounds,
identical backs, enlarged comparisons, touch controls, automatic pause and restoration.
Additional checks include actual emulated touch swipes, sound settings, local voice
selection, blocked storage, bakery orders/rewards, wardrobe favourites, all four trails,
and colouring drawing/erasing/undo/restoration/PNG export.
3,212 model assertions cover repeated deck generation, actual SVG uniqueness, exact pairs,
matching locks, save validation, collisions, wrap, buffers, spawning, caps, wins and rewards.
48 seeded Snake simulations reach Adventure targets using routes to naturally spawned food.
All four existing trail simulations still finish with 40/40 treats and zero rescues.
83 offline/import checks cover installation, dependencies, migration and fallback.

Browser tests use source-inlined ES modules because browser network navigation is blocked
in this environment. localStorage and IndexedDB are test doubles for document recreation;
this is not native persistent iPad storage. Speech availability is also device-dependent.
No physical iPad, native Safari or live installed offline-launch test was performed.
GitHub deployment is verified separately. Test touch, audio and a save/reopen on Claire's iPad.
