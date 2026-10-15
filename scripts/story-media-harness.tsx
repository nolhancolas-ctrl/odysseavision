// Local regression fixture. Run `node scripts/serve-story-media-check.mjs`.
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import {
  fitIntrinsicPhoto,
  StoryMediaDialog,
  type StoryMediaDraft,
} from "../src/components/admin/stories/StoryMediaDialog";
import {
  readMediaDraft,
  serializeMediaDraft,
} from "../src/components/admin/stories/storyMediaHtml";
import {
  normalizeLegacyStoryHtml,
  serializeStoryHtml,
  StoryMediaNode,
} from "../src/components/admin/stories/storyTiptap";
import { sanitizeStoryHtml } from "../src/components/stories/sanitizeStoryHtml";
import { StoryRichHtml } from "../src/components/stories/StoryRichHtml";
import {
  alignedPhotoX,
  photoFrameGeometry,
  installIndependentCompositions,
} from "../src/components/stories/storyComposition";
import styles from "../src/components/stories/StoryContent.module.css";
import "../src/app/globals.css";

const fixture: StoryMediaDraft = {
  items: [
    {
      id: "photo",
      src: "/fixture.svg",
      alt: "Story photo test",
      caption: "A caption beneath the photo",
      watermark: "NONE",
      width: 61,
      height: 420,
      x: 0,
      y: 0,
      cropX: 40,
      cropY: 60,
      cropZoom: 1.2,
    },
  ],
  compositionWidth: 81,
  compositionHeight: 640,
  alignment: "center",
  layout: "grid",
  size: "medium",
  photoGap: 0,
  cornerRadius: 8,
  sideTextEnabled: true,
  leftText:
    'Left text & context.\nSecond line with <script>alert("never")</script>.',
  rightText:
    "Right text with more context.\nThis follows the left text on mobile.",
};

function parse(html: string) {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
}

function tests() {
  const results: string[] = [];
  function assert(condition: unknown, message: string) {
    if (!condition) throw new Error(message);
    results.push(message);
  }
  const html = serializeMediaDraft(fixture);
  const sanitized = sanitizeStoryHtml(html);
  const root = parse(sanitized);
  const restored = readMediaDraft(root.firstElementChild as HTMLElement);
  assert(
    restored.leftText === fixture.leftText &&
      restored.rightText === fixture.rightText,
    "Side text, special characters and line breaks survive sanitization and reopening",
  );
  assert(
    !root.querySelector("script"),
    "Side text is escaped, never executable HTML",
  );
  assert(
    restored.items[0].width === 61 &&
      restored.compositionWidth === 81 &&
      restored.compositionHeight === 640,
    "Frame and photo values round-trip independently",
  );
  const centeredDraft: StoryMediaDraft = {
    ...fixture,
    compositionWidth: 59,
    items: [
      {
        ...fixture.items[0],
        width: 100,
        x: alignedPhotoX("center", 59, 100),
      },
    ],
  };
  const centeredPhoto = centeredDraft.items[0];
  const centeredMidpoint =
    centeredPhoto.x! + centeredPhoto.width / 2;
  assert(
    centeredPhoto.x === -20.5 && centeredMidpoint === 29.5,
    "A narrower frame clips a centered photo equally on both sides",
  );
  const reopenedCentered = readMediaDraft(
    parse(serializeMediaDraft(centeredDraft)).firstElementChild as HTMLElement,
  );
  assert(
    reopenedCentered.items[0].x === -20.5,
    "Negative centered coordinates survive saving and reopening",
  );
  const nativePortrait = fitIntrinsicPhoto(390, 650);
  assert(
    nativePortrait.width === 39 && nativePortrait.height === 650,
    "A single photo starts at its intrinsic dimensions",
  );
  const boundedLandscape = fitIntrinsicPhoto(1920, 1080);
  assert(
    boundedLandscape.width === 100 && boundedLandscape.height === 563,
    "Oversized photos keep their aspect ratio inside the composition canvas",
  );
  assert(
    normalizeLegacyStoryHtml(html).includes(
      'data-story-coordinates="independent"',
    ),
    "Single-photo frames are preserved by legacy normalization",
  );
  for (const frameWidth of [40, 61, 81, 100]) {
    for (const frameHeight of [120, 640, 1200]) {
      const rect = photoFrameGeometry(
        fixture.items[0],
        frameWidth,
        frameHeight,
      );
      const displayedWidth = (frameWidth * 10 * parseFloat(rect.width)) / 100;
      const displayedHeight = (frameHeight * parseFloat(rect.height)) / 100;
      assert(
        Math.abs(displayedWidth - 610) < 0.001 &&
          Math.abs(displayedHeight - 420) < 0.001,
        `Frame ${frameWidth}/${frameHeight} preserves photo size`,
      );
    }
  }
  installIndependentCompositions(root, false);
  const figure = root.querySelector("figure")!;
  const desktopWidth = figure.style.width;
  installIndependentCompositions(root, true);
  assert(
    figure.style.width === "100%" && figure.style.height === "auto",
    "Mobile resets absolute photo geometry",
  );
  installIndependentCompositions(root, false);
  assert(
    figure.style.width === desktopWidth && figure.style.position === "absolute",
    "Returning to desktop restores original geometry",
  );
  const editor = new Editor({
    element: document.createElement("div"),
    extensions: [StarterKit, StoryMediaNode],
    content: html,
  });
  const serialized = serializeStoryHtml(editor);
  const reopened = readMediaDraft(
    parse(serialized).firstElementChild as HTMLElement,
  );
  assert(
    reopened.leftText === fixture.leftText && reopened.items.length === 1,
    "Tiptap preserves the text/photo block as one editable node",
  );
  editor.destroy();
  const legacy = parse(
    '<section data-story-gallery="true" data-composition-width="80"><figure data-story-image="true" data-width="50" data-x="20" data-height="320"><img src="/fixture.svg"></figure></section>',
  );
  const migrated = readMediaDraft(legacy.firstElementChild as HTMLElement);
  assert(
    migrated.items[0].width === 40 && migrated.items[0].x === 16,
    "Legacy frame-relative dimensions convert without scaling the photo",
  );
  const normalizedLegacy = parse(
    normalizeLegacyStoryHtml(legacy.innerHTML),
  );
  const normalizedLegacyGallery = normalizedLegacy.querySelector<HTMLElement>(
    'section[data-story-gallery="true"]',
  )!;
  const normalizedLegacyFigure = normalizedLegacyGallery.querySelector<HTMLElement>(
    'figure[data-story-image="true"]',
  )!;
  assert(
    normalizedLegacyGallery.dataset.storyCoordinates === "independent" &&
      normalizedLegacyGallery.dataset.compositionWidth === "80" &&
      normalizedLegacyFigure.dataset.width === "40" &&
      normalizedLegacyFigure.dataset.x === "16",
    "Legacy galleries migrate to independent coordinates without losing their frame",
  );
  const legacySingle =
    '<figure data-story-image="true" data-width="100" data-height="300" class="story-media story-media-full story-media-medium"><img src="/fixture.svg"></figure>';
  const normalizedSingle = parse(normalizeLegacyStoryHtml(legacySingle));
  const restoredSingle = readMediaDraft(
    normalizedSingle.firstElementChild as HTMLElement,
  );
  assert(
    normalizedSingle.firstElementChild?.matches(
      'section[data-story-gallery="true"][data-story-coordinates="independent"]',
    ) &&
      restoredSingle.compositionWidth === 100 &&
      restoredSingle.compositionHeight === 300 &&
      restoredSingle.items[0].width === 100,
    "Persisted standalone photos regain a frame before reopening",
  );
  const disabled = { ...fixture, sideTextEnabled: false };
  const dormant = readMediaDraft(
    parse(serializeMediaDraft(disabled)).firstElementChild as HTMLElement,
  );
  assert(
    dormant.leftText === fixture.leftText && !dormant.sideTextEnabled,
    "Disabling side text retains the draft fields",
  );
  return results;
}

function Harness() {
  const [html, setHtml] = useState(() => serializeMediaDraft(fixture));
  const [open, setOpen] = useState(false);
  const [results] = useState(() => {
    try {
      return tests().join("\n");
    } catch (e) {
      return `FAIL: ${e}`;
    }
  });
  const draft = readMediaDraft(parse(html).firstElementChild as HTMLElement);
  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "24px auto",
        padding: 20,
        fontFamily: "Arial",
      }}
    >
      <h1>Story media regression check</h1>
      <button onClick={() => setOpen(true)}>Edit composition</button>
      <pre data-test-results style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
        {results}
      </pre>
      <output data-saved-values style={{ display: "block", overflowWrap: "anywhere" }}>{JSON.stringify(draft)}</output>
      <StoryRichHtml
        html={sanitizeStoryHtml(html)}
        className={styles.content}
      />
      {open ? (
        <StoryMediaDialog
          initialDraft={draft}
          editing
          uploadSlug="fixture"
          existingImageUrls={[]}
          onCancel={() => setOpen(false)}
          onSave={(next) => {
            setHtml(serializeMediaDraft(next));
            setOpen(false);
          }}
        />
      ) : null}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Harness />);
