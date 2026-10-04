# Coloring Time 1.0

Entry point: ../coloring-time.html, also linked from Claire Adventures.
A working touch/mouse colouring book, not the earlier interface mockup.
No extra JPG uploads, build step, accounts, external libraries or paid services.

## Pages and artwork

Ten pages: Claire and her bows; Pusheen and a cupcake; Hello Kitty loves hearts;
Raspberry the axolotl; Best friends together; At the pumpkin patch; A snowy day;
A day at the beach; Trick or treat; A stuffy friends party.
Claire is the only human child. Her friends are Pusheen, Hello Kitty and Raspberry,
the axolotl stuffy. No extra children, teddy bears or rabbits are substituted.
The character outlines are traced from the supplied line-art illustrations and approved
group preview, then composed into simple colouring scenes inspired by the stories.
These are not pixel-identical copies of the decorative interface mockup.
Compact contour modules reconstruct inert SVG paths without external image downloads.

## Tools

Rainbow brush cycles colour with drawing distance. Bright, Pastel, Nature and Skin & hair
palettes provide manual colours. Small, medium and large brushes; eraser; Undo and Redo.
Clear page asks for confirmation and can itself be undone. Freehand colouring only:
there is no bucket-fill tool, automatic stay-inside-lines feature, zoom or sticker mode.
The paint canvas sits below a protected line-art layer. Erasing removes colouring,
never the original outlines. Mouse, touch and stylus use the same pointer controls.
Canvas coordinates remain 800 x 1000 even when the view resizes or rotates.

## Saving and export

Completed strokes are queued for saving in IndexedDB on this device. Wait for
Saved on this device. My pictures filters pages with saved colouring and shows thumbnails.
Opening a page restores the drawing and its undo history. Redo history is session-only.
No drawings leave the device automatically and nothing syncs between computer and iPad.
A failed or blocked save is reported; session memory is not a durable backup.
Clearing website data removes device-local drawings. Save important pictures separately.
Save picture opens a preview and Download PNG. A native Share / Save to Photos button is
shown only when file sharing is supported. Saving to Photos requires the user's choice
in the device share sheet. PNG exports include a white background and the line art.

## Updates and offline use

The home-screen icon is unchanged. Open online, reload or close/reopen, then select
Coloring Time. The shared update code avoids automatic reload while the editor is open.
Cache claire-adventures-v7-coloring-1.0.0 includes the app and all 14 contour modules.
Wait for Saved for offline play before relying on offline use on that device.
Existing story-image caches are migrated. Game scores and drawings are not cleared.
Treat Time, Treat Trail and all story files are unchanged by this release.

## Adding pages

pages.js defines stable page IDs, titles, categories, template versions and SVG recipes.
Use a new ID for substantially different artwork; do not silently move outlines beneath
saved colouring. Additional contour modules belong in the service-worker CORE and
site-update offline checklist. Publish dependencies and cache versions together.
app.js manages UI, input, page selection, export and the serialized save queue.
paint.js draws and replays strokes and composites PNG output.
store.js owns the device database, validation and session fallback.
art-data.js imports encoded contours; art.js reconstructs smoothed closed paths.

## Verification and limitations

140 Chromium UI checks passed: 35 each on desktop, tablet landscape, tablet portrait
and phone landscape. Tests include gallery filters, tool visibility, rainbow pixel
changes, manual colour pixels, eraser transparency, Undo/Redo, clear cancellation and
undo, PNG export, pointer and emulated touch strokes, per-page restoration and no
runtime exceptions. The current artwork and all gallery pages were visually inspected.
The browser test harness inlines the same source modules because browser network
navigation is restricted here. It uses an IndexedDB test double to test save/restore
across document recreation, not real persistent iPad storage or production networking.
Node tests additionally cover blocked storage, invalid saves, cache installation,
old story cache migration, unrelated-cache preservation and offline URL normalization.
No physical iPad, native Safari, Apple Pencil or native Photos share-sheet test was run.
On Claire's iPad, test drawing, erasing, returning to a saved page and PNG saving.
