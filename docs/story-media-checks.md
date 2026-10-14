# Story media: independent frame and side text

Photo width and horizontal position use a stable 1000-unit canvas. The frame is
a viewport onto that canvas, not a scale control. Reducing the frame can clip a
photo; it does not change its dimensions. `Fit frame to photos` explicitly fits
the frame to the current composition. The two aspect-ratio locks are independent.

For one centered photo, `Text on both sides` enables plain-text fields with
preserved line breaks. Desktop uses three columns. Below 768px, the reading order
is photo, left text, right text. Turning the option off preserves its fields.

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
- Toggle side text off/on, and change center/left/right alignment: fields must
  not disappear from the saved draft.
- Check a pre-existing single photo and multi-photo gallery before/after editing.

The fixture is a development script, not an application route. Database-backed
save/publish and final visual rendering still need verification in the real app.
