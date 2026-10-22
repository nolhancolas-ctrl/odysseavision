# Story media: independent frame and side text

Photo width and horizontal position use a stable 1000-unit canvas. The frame is
a viewport onto that canvas, not a scale control. Reducing the frame can clip a
photo; it does not change its dimensions. `Fit frame to photos` explicitly fits
the frame to the current composition. The two aspect-ratio locks are independent.

For one centered photo, two directly editable plain-text fields fill the left
and right columns, with line breaks preserved. Mobile mode applies below 768px
or when the viewport aspect ratio is at most 4:3. Its reading order is photo,
left text, right text. Empty fields are not published. Left/right alignment
uses only the opposite text column, while preserving the other field in storage.

A newly imported single photo retains its source aspect ratio at a reasonable
preset width; the frame initially fits it. Centered frames reserve usable side
columns (maximum width 60%); left/right frames use at most 72%.

New compositions persist their geometry with `data-story-coordinates="independent"`.
Existing content keeps its legacy rendering until edited; the dialog converts
legacy frame-relative coordinates when opening it. No database migration is needed.

## Database-free regression fixture

Run `npm run check:story-media` for the focused TypeScript/ESLint checks.
After installing dependencies, run `npm run test:story-media` and open
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
- Import a single photo: its initial size must remain reasonable, preserve its
  aspect ratio, and match its frame.
- Check a pre-existing single photo and multi-photo gallery before/after editing.

The fixture is a development script, not an application route. Database-backed
save/publish and final visual rendering still need verification in the real app.

## Ownership and invariants

- `storyComposition.ts`: shared frame coordinates, side-column proportions and
  collision repair. Collision repair moves intersecting photos down without
  changing their dimensions, crop, text or order. Valid geometry stays unchanged.
- `StoryMediaDialog.tsx`: user actions and draft state. Initial geometry is
  normalized once, not by a later effect that rearranges saved content.
- `storyMediaHtml.ts` / `storyTiptap.ts`: durable HTML and the atomic media node.
  Responsive DOM styles are never the source for saving an edited node.
- `StoryArtboard.tsx`: one owner of responsive mode and uniform scale. It commits
  mode, arranges the media, measures height, then restores the reading point.
  Child-list observation handles inserted/replaced content; renderer changes
  are excluded from observation to prevent feedback loops.
- `storySpatialLayout.ts`: legacy rendering adapter. Independent compositions
  and standalone images are mutually exclusive paths; a gallery child cannot
  be processed a second time as a standalone photo.
- `StoryContent.module.css`: story layout follows the resolved artboard mode,
  including forced editor previews. Viewport media queries remain only for the
  composition dialog. The editor decoration does not consume content width.

Frame dimensions stay independent when a photo changes. If a repaired or taller
composition exceeds the frame, the dialog warns about clipping. Explicit fitting
uses the photos' bounding box and removes its leading empty space. Tall frames
now round-trip up to the shared 10,000-unit safety limit instead of being silently
cut down to 1,200; original single-photo size limits remain unchanged.

## Verification performed — 2026-10-22

- 43 fixture assertions pass, including 100 generated 12-photo collision cases,
  serialization, escaping, dormant text, legacy conversion and repeated layout
  transitions. The fixture runs in React StrictMode.
- In the actual dialog, increasing the second mosaic photo from 300 to 490
  moves both photos beneath it to y=490. Saving and reopening retains those
  positions. Lead-left, lead-right, editorial, row, grid and stack layouts were
  checked for intersecting rectangles.
- Center/left/right text and a four-photo mosaic pass rendered checks at
  1440×900, 390×844 and 844×390. Additional transitions covered 375×812,
  768×1024 and 1920×1080.
- Forced desktop remains desktop on a narrow window; forced mobile remains
  mobile on a wide window.
- Public HTML and the actual Tiptap node view have matching photo and side-column
  dimensions. Serialized editor HTML is byte-identical before/after rotations.
- A long-story test retains the same reading paragraph through repeated
  desktop/mobile transitions. No browser errors or warnings were captured.
- Focused TypeScript and ESLint pass. ESLint retains one non-blocking
  `no-img-element` warning for the native editable/croppable image.

This is local, database-free verification. It does not claim to validate live
Neon writes, upload delivery, every historical story or the deployed Vercel
build. No production data was edited and no deployment was triggered.
