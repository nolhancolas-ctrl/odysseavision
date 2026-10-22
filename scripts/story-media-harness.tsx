// Local regression fixture. Run `node scripts/serve-story-media-check.mjs`.
import React, { useEffect, useRef, useState } from "react";
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
import { StoryArtboard } from "../src/components/stories/StoryArtboard";
import { installSpatialLayouts } from "../src/components/stories/storySpatialLayout";
import {
  alignedPhotoX,
  installIndependentCompositions,
  maximumStoryFrameWidth,
  photoFrameGeometry,
  singlePhotoPresetWidth,
  storyTextMediaColumns,
  separateOverlappingPhotos,
  type StoryArtboardMode,
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

function normalizedColumns(value: string) {
  const probe = document.createElement("div");
  probe.style.gridTemplateColumns = value;
  return probe.style.gridTemplateColumns;
}

function tests() {
  const results: string[] = [];
  function assert(condition: unknown, message: string) {
    if (!condition) throw new Error(message);
    results.push(message);
  }
  const mosaic = [
    { x: 0, y: 0, width: 50, height: 620 },
    { x: 50, y: 0, width: 50, height: 300 },
    { x: 50, y: 300, width: 25, height: 200 },
    { x: 75, y: 300, width: 25, height: 200 },
  ];
  const enlarged = mosaic.map((p, i) => i === 1 ? { ...p, height: 480 } : p);
  const packed = separateOverlappingPhotos(enlarged);
  assert(JSON.stringify(separateOverlappingPhotos(mosaic)) === JSON.stringify(mosaic),
    "Opening a valid mosaic leaves every existing position unchanged");
  assert(packed[2].y === 480 && packed[3].y === 480 &&
    packed[0].height === 620 && enlarged[2].y === 300,
    "Enlarging a mosaic photo pushes its neighbours down without mutating or resizing them");
  assert(JSON.stringify(separateOverlappingPhotos(packed)) === JSON.stringify(packed),
    "Collision repair is idempotent");
  let seed = 27;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let run = 0; run < 100; run++) {
    const arranged = separateOverlappingPhotos(Array.from({ length: 12 }, () => ({
      x: Math.floor(random() * 4) * 20, y: Math.floor(random() * 800),
      width: 20, height: 120 + Math.floor(random() * 400),
    })));
    if (arranged.some((a, i) => arranged.slice(i + 1).some(b =>
      a.x < b.x + b.width && a.x + a.width > b.x &&
      a.y < b.y + b.height && a.y + a.height > b.y))) {
      throw new Error("Generated composition has overlapping rectangles");
    }
  }
  assert(true, "100 generated 12-photo compositions have no intersecting rectangles");
  assert(
    singlePhotoPresetWidth("medium", "center") === 50 &&
      maximumStoryFrameWidth("center") === 60 &&
      maximumStoryFrameWidth("left") === 72 &&
      storyTextMediaColumns("center", 99).includes("60%"),
    "Single-photo presets preserve usable side-text columns",
  );
  const html = serializeMediaDraft(fixture);
  const tall = readMediaDraft(parse(serializeMediaDraft({
    ...fixture, compositionHeight: 1760,
  })).firstElementChild as HTMLElement);
  assert(tall.compositionHeight === 1760,
    "Tall multi-row frames survive saving and reopening without the old 1200px truncation");
  const sanitized = sanitizeStoryHtml(html);
  const root = parse(sanitized);
  const restored = readMediaDraft(root.firstElementChild as HTMLElement);
  assert(
    restored.leftText === fixture.leftText &&
      restored.rightText === fixture.rightText,
    "Side text, special characters and line breaks survive sanitization and reopening",
  );
  const wrapper = root.firstElementChild as HTMLElement;
  const gallery = wrapper.querySelector<HTMLElement>(
    'section[data-story-gallery="true"]',
  )!;
  assert(
    wrapper.dataset.storyLeftText === fixture.leftText &&
      wrapper.dataset.storyRightText === fixture.rightText,
    "Side text is duplicated on the atomic wrapper for durable draft storage",
  );
  gallery.dataset.storyLeftText = "";
  gallery.dataset.storyRightText = "";
  const recoveredFromWrapper = readMediaDraft(wrapper);
  assert(
    recoveredFromWrapper.leftText === fixture.leftText &&
      recoveredFromWrapper.rightText === fixture.rightText,
    "Reopening recovers side text when a legacy gallery attribute is empty",
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
  assert(
    gallery.style.width === "100%" &&
      wrapper.style.gridTemplateColumns ===
        normalizedColumns(storyTextMediaColumns("center", fixture.compositionWidth)),
    "The frame owns its exact grid column and side text receives the remaining width",
  );
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
  installIndependentCompositions(root, true);
  const mobileLeft = wrapper.querySelector<HTMLElement>(
    ":scope > .story-side-text-left",
  );
  const mobileRight = wrapper.querySelector<HTMLElement>(
    ":scope > .story-side-text-right",
  );
  assert(
    wrapper.style.display === "flex" &&
      mobileLeft?.style.display === "block" &&
      mobileLeft.style.order === "1" &&
      mobileRight?.style.display === "block" &&
      mobileRight.style.order === "2",
    "A second mobile transition keeps both side texts below the photo",
  );
  for (let cycle = 0; cycle < 8; cycle += 1) {
    installIndependentCompositions(root, cycle % 2 === 0);
  }
  assert(
    root.querySelectorAll('[data-story-text-media="true"]').length === 1 &&
      wrapper.querySelectorAll(":scope > .story-side-text-left").length === 1 &&
      wrapper.querySelectorAll(":scope > .story-side-text-right").length === 1 &&
      wrapper.dataset.storyLeftText === fixture.leftText &&
      wrapper.dataset.storyRightText === fixture.rightText,
    "Repeated responsive transitions are idempotent and never duplicate or erase side text",
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
  const leftDraft: StoryMediaDraft = {
    ...fixture,
    alignment: "left",
    leftText: "Dormant text",
    rightText: "Text beside a left-aligned photo",
  };
  const leftRoot = parse(
    sanitizeStoryHtml(serializeMediaDraft(leftDraft)),
  );
  const leftWrapper = leftRoot.firstElementChild as HTMLElement;
  installIndependentCompositions(leftRoot, false);
  assert(
    leftWrapper.dataset.alignment === "left" &&
      leftWrapper.style.gridTemplateColumns ===
        normalizedColumns(storyTextMediaColumns("left", fixture.compositionWidth)) &&
      leftWrapper.querySelector(".story-side-text-right")?.textContent ===
        leftDraft.rightText,
    "A left-aligned photo creates one text column that consumes all remaining space",
  );
  const wrapperlessRoot = parse(serializeMediaDraft(fixture));
  const wrapperlessWrapper = wrapperlessRoot.firstElementChild as HTMLElement;
  const wrapperlessGallery = wrapperlessWrapper.querySelector<HTMLElement>(
    'section[data-story-gallery="true"]',
  )!;
  wrapperlessWrapper.replaceWith(wrapperlessGallery);
  wrapperlessRoot.append(wrapperlessGallery);
  installIndependentCompositions(wrapperlessRoot, true);
  const restoredWrapper = wrapperlessRoot.querySelector<HTMLElement>(
    'section[data-story-text-media="true"]',
  );
  assert(
    restoredWrapper?.querySelector<HTMLElement>(
      ".story-side-text-left",
    )?.style.display === "block" &&
      restoredWrapper.querySelector<HTMLElement>(
        ".story-side-text-right",
      )?.style.display === "block",
    "Mobile restores and displays side text from durable gallery metadata",
  );

  const plainDuplicateDraft: StoryMediaDraft = {
    ...fixture,
    alignment: "left",
    sideTextEnabled: false,
    leftText: "",
    rightText: "",
  };
  const duplicateRoot = parse(
    `${serializeMediaDraft(fixture)}${serializeMediaDraft(plainDuplicateDraft)}`,
  );
  for (const mobile of [false, true, false, true]) {
    installIndependentCompositions(duplicateRoot, mobile);
  }
  const duplicateGalleries = duplicateRoot.querySelectorAll<HTMLElement>(
    'section[data-story-gallery="true"]',
  );
  assert(
    duplicateGalleries.length === 2 &&
      duplicateRoot.querySelectorAll('[data-story-text-media="true"]').length ===
        1 &&
      duplicateGalleries[0].closest('[data-story-text-media="true"]') !==
        null &&
      duplicateGalleries[1].closest('[data-story-text-media="true"]') ===
        null &&
      duplicateGalleries[0].dataset.sideTextEnabled === "true" &&
      duplicateGalleries[1].dataset.sideTextEnabled === "false",
    "Two uses of the same photo keep independent composition metadata",
  );
  const duplicateEditor = new Editor({
    element: document.createElement("div"),
    extensions: [StarterKit, StoryMediaNode],
    content: duplicateRoot.innerHTML,
  });
  const duplicateRoundTrip = parse(serializeStoryHtml(duplicateEditor));
  const roundTripBlocks = Array.from(
    duplicateRoundTrip.children,
    (element) => readMediaDraft(element as HTMLElement),
  );
  assert(
    roundTripBlocks.length === 2 &&
      roundTripBlocks[0].sideTextEnabled === true &&
      roundTripBlocks[0].leftText === fixture.leftText &&
      roundTripBlocks[0].rightText === fixture.rightText &&
      roundTripBlocks[1].sideTextEnabled === false &&
      roundTripBlocks[1].leftText === "" &&
      roundTripBlocks[1].rightText === "",
    "Tiptap saves visually identical photos as independent atomic blocks",
  );
  duplicateEditor.destroy();
  const legacyClassRoot = parse(serializeMediaDraft(fixture));
  legacyClassRoot.querySelector("figure")!.classList.add("story-media", "story-media-left");
  installSpatialLayouts(legacyClassRoot);
  assert(legacyClassRoot.querySelector("figure")!.style.position ===
    (window.matchMedia("(max-width: 767px), (max-aspect-ratio: 4 / 3)").matches ? "relative" : "absolute"),
    "Legacy standalone renderer never overwrites a gallery child");
  return results;
}

const mosaicFixture: StoryMediaDraft = {
  ...fixture, alignment: "center", layout: "mosaic", sideTextEnabled: false,
  compositionWidth: 100, compositionHeight: 700, photoGap: 12,
  items: [
    { ...fixture.items[0], id: "m1", width: 50, height: 620, x: 0, y: 0 },
    { ...fixture.items[0], id: "m2", width: 50, height: 300, x: 50, y: 0 },
    { ...fixture.items[0], id: "m3", width: 25, height: 200, x: 50, y: 300 },
    { ...fixture.items[0], id: "m4", width: 25, height: 200, x: 75, y: 300 },
  ],
};

function EditorFixture({ html, mode }: { html: string; mode: StoryArtboardMode }) {
  const host = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [saved, setSaved] = useState("");
  useEffect(() => {
    if (!host.current) return;
    const editor = new Editor({
      element: host.current, extensions: [StarterKit, StoryMediaNode],
      content: html, editorProps: { attributes: { class: "story-tiptap-document" } },
    });
    editorRef.current = editor;
    return () => { editorRef.current = null; editor.destroy(); };
  }, [html]);
  return <section data-editor-fixture>
    <h2>Tiptap node-view comparison</h2>
    <button onClick={() => editorRef.current && setSaved(serializeStoryHtml(editorRef.current))}>
      Serialize editor
    </button>
    <output data-editor-saved hidden>{saved}</output>
    <StoryArtboard mode={mode}>
      <div className={styles.content + " " + styles.editor}><div ref={host} /></div>
    </StoryArtboard>
  </section>;
}

function checkRenderedLayout() {
  let checked = 0;
  for (const canvas of document.querySelectorAll<HTMLElement>("[data-story-artboard-resolved]")) {
    const mobile = canvas.dataset.storyArtboardResolved === "mobile";
    for (const gallery of canvas.querySelectorAll<HTMLElement>("[data-story-gallery]")) {
      const rects = Array.from(gallery.querySelectorAll("figure"), f => f.getBoundingClientRect());
      for (let i = 0; i < rects.length; i++) {
        for (const b of rects.slice(i + 1)) {
          const a = rects[i];
          if (a.left < b.right - 0.5 && a.right > b.left + 0.5 &&
            a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5) {
            throw new Error("Rendered photos intersect");
          }
        }
      }
      const wrapper = gallery.closest<HTMLElement>("[data-story-text-media]");
      if (wrapper) {
        for (const side of ["left", "right"]) {
          const expected = wrapper.dataset.alignment === "center" ||
            wrapper.dataset.alignment === (side === "left" ? "right" : "left");
          const text = wrapper.querySelector<HTMLElement>(".story-side-text-" + side);
          if (!expected || !text?.textContent?.trim()) continue;
          const rect = text.getBoundingClientRect();
          if (getComputedStyle(text).display === "none" || rect.height === 0 || rect.width < 1) {
            throw new Error("Side text is hidden");
          }
          if (mobile && rect.top < gallery.getBoundingClientRect().bottom - 0.5) {
            throw new Error("Mobile text is not below its photo");
          }
        }
      }
      checked++;
    }
  }
  return "PASS: " + checked + " rendered compositions, no overlaps or hidden side text";
}

function Harness() {
  const [html, setHtml] = useState(() => serializeMediaDraft(fixture));
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<StoryArtboardMode>("auto");
  const [showEditor, setShowEditor] = useState(false);
  const [longStory, setLongStory] = useState(false);
  const [layoutResult, setLayoutResult] = useState("");
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
      <button onClick={() => setHtml(serializeMediaDraft(mosaicFixture))}>Load mosaic</button>
      <button onClick={() => setHtml(serializeMediaDraft(fixture))}>Load side text</button>
      <button onClick={() => setHtml(serializeMediaDraft({ ...fixture, alignment: "left" }))}>Load left photo</button>
      <button onClick={() => setHtml(serializeMediaDraft({ ...fixture, alignment: "right" }))}>Load right photo</button>
      <button onClick={() => setShowEditor(value => !value)}>Toggle editor test</button>
      <button onClick={() => setLongStory(value => !value)}>Toggle long story</button>
      {(["auto", "desktop", "mobile"] as const).map(value =>
        <button key={value} onClick={() => setMode(value)}>Mode {value}</button>
      )}
      <button onClick={() => {
        try { setLayoutResult(checkRenderedLayout()); }
        catch (error) { setLayoutResult("FAIL: " + error); }
      }}>Check rendered layout</button>
      <output data-layout-result style={{ display: "block" }}>{layoutResult}</output>
      <details><summary>Regression results</summary>
      <pre data-test-results style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
        {results}
      </pre>
      <output data-saved-values style={{ display: "block", overflowWrap: "anywhere" }}>{JSON.stringify(draft)}</output>
      </details>
      <StoryArtboard mode={mode}>
      <StoryRichHtml
        html={sanitizeStoryHtml(longStory
          ? Array.from({ length: 25 }, (_, i) => "<p>Paragraph " + (i + 1) +
            ". Test content that wraps naturally on a phone and stays on one line on a desktop.</p>").join("") +
            html + "<h2>Next section</h2><p>The reading point must stay with this composition.</p>".repeat(20)
          : html)}
        className={styles.content}
      />
      </StoryArtboard>
      {showEditor ? <EditorFixture html={html} mode={mode} /> : null}
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
createRoot(document.getElementById("root")!).render(<React.StrictMode><Harness /></React.StrictMode>);
