# Story media: independent frame and side text

Photo width and horizontal position use a stable 1000-unit canvas. The frame is
a viewport onto that canvas, not a scale control. Reducing the frame can clip a
photo; it does not change its dimensions. `Fit frame to photos` explicitly fits
the frame to the current composition. The two aspect-ratio locks are independent.

For one centered photo, two directly editable plain-text fields fill the left
and right columns, with line breaks preserved. Below 768px, the reading order is
photo, left text, right text. Empty fields are not published.

A newly imported single photo starts at its intrinsic pixel dimensions whenever
they fit inside the stable composition canvas. Oversized files are reduced only
enough to fit, without changing their aspect ratio, and the frame initially fits
the photo exactly.

New compositions persist their geometry with `data-story-coordinates="independent"`.
Existing content keeps its legacy rendering until edited; the dialog converts
legacy frame-relative coordinates when opening it. No database migration is needed.

## Database-free regression fixture

After `npm ci`, run `node scripts/serve-story-media-check.mjs` and open
`http://localhost:4387`. This bundles the actual dialog, Tiptap media node,
serializer, sanitizer and public renderer, using a local SVG instead of uploads.
The page lists assertions for serialization, escaping, legacy conversion and
geometry across frame sizes. No production story or database is accessed.

Manual checks:

- Change FRAME width/height: SELECTED PHOTO width/height must not change.
- Change SELECTED PHOTO width/height: FRAME values must not change.
- Save and reopen: geometry, captions, crop and side texts must survive.
- Check 320px, 390px, 768px and desktop widths: no horizontal overflow;
  side text below the photo on mobile, beside it on desktop.
- For a centered single photo, edit both side fields directly beside the image;
  change center/left/right alignment and confirm the saved text is preserved.
- Import a single photo: its starting size must match the source file when it
  fits the canvas, and its frame must initially match it exactly.
- Check a pre-existing single photo and multi-photo gallery before/after editing.

The fixture is a development script, not an application route. Database-backed
save/publish and final visual rendering still need verification in the real app.
