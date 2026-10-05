# Claire Adventures 1.3.0 - Stuffy Clubhouse and Music & Dance

Based on 1.2.0 commit 74e0e9996a154b7374b403418272e90fb6b5054b.
Recovery branch: backup/pre-clubhouse-stage-1.3.0.
Entry points: ../clubhouse.html and ../music-dance.html, linked at the top of the home activity menu.
Both are complete interactive activities. No new image uploads, subscriptions or external runtime.

## Stuffy Clubhouse

A furnished 960 x 600 room starts with 12 placed items and 18 owned items across 16 free furniture
styles, including two art frames and two chairs. Decorate with sofas, beds, rugs, tables, lamps,
toy boxes, shelves, plants, chairs, cushions, bunting, a clock, wall light, music player and tea trolley.
Choose five wallpapers and four floors, day/night lighting, and an optional clubhouse name.

Select an item and tap a new spot, drag it, or use Move for an explicit green placement preview.
Rotate in 15-degree steps. Rotated bounds are clamped to the wall/floor zone, so an item cannot
be stranded outside the room. Put away returns it to reusable storage. Undo reverses the last
30 decorating changes in the current room/session, including art, display, wallpaper and lighting.
Each additional room has a separate furnished layout. Layouts and all inventory unlocks autosave.

Claire is the only child. Invite any combination of Pusheen, Hello Kitty and Raspberry. The existing
SVG character bodies, faces, hair, gills and fitted wardrobe are reused. Friends wander, sit, nap,
play and respond individually: Pusheen wiggles, Hello Kitty waves, Raspberry bounces and Claire spins.
Tea party gathers everyone at a table. Share treats displays the selected bakery creation in their
hands. Tuck in gathers sleepy stuffies at a bed with blankets. Play together wakes everyone.
There are no needs, attendance rewards, unhappy-away states or penalties.

My art reads Coloring Time and makes an independent PNG copy in a frame. It never rewrites the
original picture. Two frames are ready immediately; place stored frames before choosing pictures.
The bakery display similarly copies a served creation from the existing shelf. It stays available
in the bakery. The saved Dress-Up outfits appear here, with a Use latest looks button.
The music player offers all six tracks and links to named shows saved in Music & Dance.

## Music & Dance

Choose any of the four established characters, up to four performers, with group or individual
move control. Four stage themes are free: Rainbow, Garden, Winter Sparkle and Beach. There are
six original synthesized tracks, including the four existing melodies and new Rainbow Hop and
Stuffy Swing. Different tempos range from 78 to 116 bpm. Sound is generated locally with Web Audio;
no music files, licensed-song downloads or network voice services are used.

Free Dance: Spin, Jump, Wave, Wiggle, Clap and Pose buttons, adapted to the original character shapes.
A finite 12-move Auto dance lets everyone perform together. Warm lighting and soft applause finish
shows without flashing. Drum, bongo, eight piano keys and two bells are always available. Instrument
rate/voice limits and restrained gains keep overlapping notes gentle.

Make a Show: start with eight slots; choose 12, 16 or 24. Tap a slot and a move; tap Who to assign it
to a performer or Everyone. Replace, remove, swap by dragging, or move left/right with arrow buttons.
Two musical beats per move, with a four-beat count-in; empty slots are rests. Six named favourites
save performers, exact outfit snapshots, stage, track and the sequence. Replacing or deleting a
favourite asks first. Play, edit or launch a saved show from the clubhouse; no music autoplays on
arrival. Use latest outfits explicitly refreshes a show's cast without changing other saved shows.

Follow the Beat: Easy has one lane and 16 notes, Medium alternates two lanes across 24 notes, Hard
uses three lanes and 32 notes. Musical spacing is 2, 1.5 and 1 beat respectively, using the selected
track. Tap the big matching move button when the note reaches the heart target. A shared transport
keeps notes and choreography on the music clock. Misses never end the song. All runs end with praise,
applause and a result; best hit ratios are saved separately by difficulty. Visual cues also work muted.

## Rewards and content unlocks

The existing game uses lifetime friendship-star milestones, not a spendable wallet. This release
keeps that policy: no existing rewards are removed, no duplicate purchases, no real-money payment.
The displayed requirement is a permanent unlock threshold; confirming Unlock never spends stars.
Stars earned in trails, bakery orders, Memory Match and Snake are recognised immediately.

Extra furniture: Reading castle 3 stars; Star-canopy bed 6; Bubble aquarium 9; Little grand piano 12.
Extra rooms: Reading room 5 stars; Garden room 10. Extra stages: Starlight 8; Candy concert 12.
Everything necessary to decorate, play, make shows and play rhythm games is available for free.

## Saving and compatibility

Only the additive localStorage key claire-club-stage:v1 stores the clubhouse, owned items, names,
frame references, copied bakery display, selected friends, stage draft, six shows and rhythm records.
Independent wall-picture PNGs use the new IndexedDB database claire-clubhouse-art, store copies.
Old coloring records are read, not changed. Existing trail, studio and arcade state is read only.
The existing shared sound settings key is reused when the user changes music/effects/mute/gentle/size.

Original coloring pages, saved drawing coordinates, all story images, wardrobe definitions, bakery,
Memory Match, Snake, Treat Time and all trail engines/layouts are unchanged. 199 existing site files
are byte-identical to 1.2.0. Only the home menu, revision metadata, service worker and update checker
change outside the new activity files. New code does not clear prior localStorage or IndexedDB.
Saves are device-local, not synced. Export favourite coloring pictures independently for safekeeping.
Website-data deletion removes local creations; the software ZIP cannot include a device's private saves.
Storage failures are reported and session fallback is not presented as a durable backup.

## Touch, settings and offline

Tap alternatives are provided for furniture and routine dragging. Pointer capture confines dragging
to the activity; ordinary drawers can still scroll. A short-touch adapter prevents swallowed button
clicks after a drag without double-activating controls. Rotate/move/store and routine edits are explicit.
Music starts only after a user action. Activities stop audio and pause shows when backgrounded,
when settings open or when leaving; a performance resumes only on request. Unfinished layout previews
are guarded on navigation. Completed edits and show drafts save automatically.

The existing mute, separate volume levels, larger buttons and Gentle Effects preferences are shared.
System reduced motion is also respected. Tap-to-read uses installed local English voices only;
if unavailable or muted, visual instructions stay usable. Native voice availability depends on the device.
No analytics, accounts, random child characters, work assets or attendance mechanics are added.

The same iPad icon and GitHub Pages address are used. Cache claire-adventures-v10-club-stage-1.3.0
includes the new activity modules and dependencies. Prior cached story images are migrated. Open
both activities online on each device and wait for Saved for offline play before relying on offline play.

## Modules

catalog.js: furniture dimensions, rooms, stages, moves and milestone requirements.
model.js: validated additive state, rotated bounds, inventory, undo and show snapshots.
props.js: original vector room furniture, backgrounds and stage scenery.
performers.js: existing avatar integration and body-adapted movement.
audio.js: original offline tracks, common transport, controlled instruments and applause.
rhythm.js: deterministic note patterns, hit windows and results.
art-copy.js: read-only coloring access and separate PNG-copy storage.
common.js: settings, local speech, dialogs, touch buttons, background/audio handling.
clubhouse.js / dance.js: complete activity flows. move-icons.js: illustrated routine tiles.
style.css: responsive desktop/iPad layouts, controlled gestures and gentle animations.

## Verification and remaining device checks

336 primary Chromium UI assertions passed across desktop, iPad landscape, iPad portrait and phone
landscape, covering furniture preview/move/rotate/store/undo, independent rooms, copied art and bakes,
outfits, all 24 sequence slots, saved shows, sequencing, rhythm modes, pause, settings and reloads.
21 additional checks cover genuine emulated-touch drags and post-drag taps, clubhouse-to-show launch,
actual bounded synthesized audio signal and mute, muted rhythm, local voice selection and blocked storage.
25 existing-activity UI checks cover Coloring, Bakery, Dress-Up, Treat Time, trails, Memory and Snake.
3,357 new model assertions verify bounds for every furniture rotation, unlock idempotence, state
validation, independent save preservation, six-show snapshots and all rhythm difficulty/track combinations.
Existing Memory/Snake model tests (3,212 assertions) and all four original 40/40 treat routes still pass.
126 offline/import tests verify the complete dependency graph, cache install/migration and offline fallback.

Browser network navigation is restricted in this environment. Browser tests use the actual source in
an in-memory module harness with storage/voice test doubles, not a production network launch or real
persistent iPad databases. Test results are not a claim of physical-device verification. No native
Safari, physical iPad, Apple Pencil or installed offline-launch test was performed. On Claire's iPad,
check a furniture drag, a real coloring copy, show save/reopen, sound, rhythm taps and offline startup.
GitHub publication and deployment are checked separately.
