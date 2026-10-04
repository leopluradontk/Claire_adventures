# Claire Adventures 1.1.0 - Stuffy Studios

Published additions: Stuffy Bakery (../bakery.html) and Dress-Up Studio (../dress-up.html).
Based on main bd07c6bb23ce2b97a7f86e376fe2b5d4df531e7d, after Coloring Time 1.0.
Recovery branch: backup/pre-stuffy-studios-1.1.0. Existing colouring files, line art,
story catalog, story images, Treat Time, trail physics, levels and progress keys are preserved.

## Stuffy Bakery

Free Bake: choose 1-3 cupcakes/cookies or one little cake; add three ingredients by tapping
or dragging; stir with six bowl taps or a circular gesture; tap/drag the tray into the oven;
choose icing, sprinkles, fruit, hearts or stars; share with any of the three stuffy friends.
Baking is a short animation, not a timed challenge. Nothing burns; friends never get upset.
Selected treats have independent icing/toppings. Copy icing to all, undo, remove-last and
confirmed clear are available. Toppings can be placed by tapping or dragging.

Friend Orders: nine repeating picture-based orders teach quantities 1-3, icing colours,
fruit counts up to four, and 1+2 / 2+2. Tap the order or step to hear it with an installed
local English voice. Wrong choices give hints and allow retries without losing stars.
A correct order served to its friend awards one friendship star exactly once. Happy friends
bounce and hearts float up. The six most recent served creations remain on the bakery shelf.
Unfinished bakes save at every step and can be continued; fresh bakes require confirmation.
Home/activity links protect an unfinished creation. Baking in the background never starts audio.

## Dress-Up Studio

Choose Claire, Pusheen, Hello Kitty or Raspberry. The original game SVG faces, hair, bodies
and axolotl gills are reused. Clothing paths belong to the same transformed character SVG.
Eight styles are available immediately: Storybook, Princess, Everyday, Little Chef, Beach,
Snow Day, Halloween and Pumpkin Patch. Star Princess unlocks at three friendship stars;
Rainbow Party unlocks at six. Unlocks use milestones, not purchases or deductions.
Clothes, trim and suitable shoes have eight colours. Matching hats, bows, crowns, chef hats,
sun hats, winter hats, witch hats and glasses are selectable. Random only uses unlocked styles.
Three favourite slots per character, matching-everyone confirmation and restore-default are included.
Drafts save automatically; Wear this look (or saving a favourite) applies a look to other activities.

Applied outfits appear in the bakery and all four trails, including finish celebrations.
Claire gets a kitchen apron and chef hat in the bakery without changing her saved look or hair.
Snow adds a warm coat/hat layer in the selected colours. Restore default returns the trail's
original setting-specific outfit. Existing movement/physics are not changed.

## Rewards and saves

The prior project had per-level achievement stars, not a spendable treat wallet. This release
extends those rewards: friendship stars = existing trail stars + completed Friend Orders.
Original best scores, stars and treats are not spent, replaced or reset. Free Bake has no score.
The two bonus style milestones also recognise stars already earned before this update.

StudioStore extends the existing ProgressStore and uses additive localStorage key
claire-stuffy-studios:v1. It stores outfits/drafts, three favourites per character, validated
bakery state, completion count, recent reward IDs, and a six-creation shelf. The existing
claire-treat-trail-settings:v2 key remains the shared sound/accessibility preference store.
Colouring's IndexedDB and the existing trail save/best keys are never cleared or rewritten.
A failed save reports that storage is unavailable and keeps a session fallback where possible.
Device-local data is not cloud-synced. Website-data deletion removes local saves; source backups
cannot contain private artwork/progress stored on the user's device.

## Sound, touch and offline

Original game audio is reused, with music/effects sliders, quick mute and Gentle Effects.
No music autoplays on entry. Backgrounding or leaving stops music and spoken hints.
Spoken instructions use SpeechSynthesis only with a localService English voice; remote voices
are never selected. Voice availability depends on iPad/browser configuration. If unavailable,
picture instructions, counts and retry hints remain fully usable without a network connection.
Shared system Reduce Motion suppresses extra animation. Bigger-buttons setting is shared.

Pointer capture handles ingredient/topping/tray drags; taps are full alternatives. Circular
stirring is confined to the bowl. Normal page scrolling remains possible outside drag targets.
A short-touch adapter handles compatibility-click suppression after captured drags.
The same home-screen icon and GitHub Pages address are used. Cache
claire-adventures-v8-studios-1.1.0 includes both activities and all required modules, and
migrates existing saved story assets. Updates do not clear player storage. Open online on
each device and wait for Saved for offline play before relying on the installed PWA offline.

## Modules

model.js: validated additive saves, reward milestones, recipes and nine order definitions.
characters.js: unchanged original vector character definitions extracted from the trail renderer.
wardrobe.js: fitted character outfits/accessories, weather/kitchen layers and saved-look lookup.
food.js: procedural ingredient, bowl, oven, treat and topping illustrations.
ui.js: shared settings/audio/local speech, dialogs, navigation guard and pointer interactions.
bakery.js: complete baking/decorating/serving flow and saved-creation shelf.
dress-up.js: wardrobe, matching, favourite looks, default/random controls.
style.css: responsive studio layout and reduced-motion-aware animations.
The trail renderer consumes wardrobe.js; its physics engine and collectible layout are untouched.

## Verification and limits

176 Chromium UI assertions passed (44 each: desktop, tablet landscape, tablet portrait,
phone portrait), including full Free Bake/cupcake and cookie orders, hints/retry, serving,
outfit application/matching/favourites/defaults, reloading, adventure integration, and existing
colouring drawing/erasing/undo/save restoration/PNG export. 13 additional checks cover local
voice selection/mute, actual emulated touch drags and circular stirring, and blocked storage.
58 model assertions cover all nine orders, reward idempotence, legacy stars, unlocks, data
validation and existing-key preservation. 56 offline/import checks verify cached dependencies,
old/unrelated-cache handling and normalized offline requests. All four original deterministic
trail routes still finish with 40/40 treats and zero rescues.

These tests use the actual source in an in-memory ES module browser harness, because network
navigation is restricted in the development environment. localStorage, IndexedDB and speech
are test doubles, not a physical iPad's persistent storage, native speech or live network.
No physical iPad, native Safari or Apple Pencil test has been performed. Test local speech,
touch, real save/reopen and installed offline launch on Claire's device. GitHub deployment is
verified separately. This release introduces no analytics, accounts, ads or real-money purchases.
