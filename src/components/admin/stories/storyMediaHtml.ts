import type {
  StoryGalleryLayout,
  StoryImageAlignment,
  StoryImageSize,
  StoryMediaDraft,
  StoryMediaItem,
  StoryWatermark,
} from "./StoryMediaDialog";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeWatermark(value: string | null): StoryWatermark {
  if (value === "ANDREW" || value === "MORGANE") {
    return value;
  }

  return "NONE";
}

export function readMediaDraft(container: HTMLElement): StoryMediaDraft {
  const outerContainer = container;
  container =
    container.querySelector<HTMLElement>(
      "section[data-story-gallery='true']",
    ) ?? container;
  const gallery = container.matches("section[data-story-gallery='true']")
    ? container
    : null;

  const figures = gallery
    ? Array.from(
        gallery.querySelectorAll<HTMLElement>(
          "figure[data-story-image='true']",
        ),
      )
    : [container];

  const items: StoryMediaItem[] = figures
    .map((figure, index) => {
      const image = figure.querySelector("img");
      const caption = figure.querySelector("figcaption");
      const inlineWidth = Number.parseFloat(figure.style.width);
      const attributeWidth = Number(figure.getAttribute("data-width"));
      const storedWidth =
        Number.isFinite(attributeWidth) && attributeWidth > 0
          ? attributeWidth
          : Number.isFinite(inlineWidth) && inlineWidth > 0
            ? inlineWidth
            : 100;
      // Legacy galleries measured x/width relative to their own frame.
      // Convert once to the stable canvas without changing their appearance.
      const coordinateScale =
        gallery && container.dataset.storyCoordinates !== "independent"
          ? Number(container.dataset.compositionWidth ?? 100) / 100
          : 1;

      if (!image?.src) return null;

      return {
        id: `${Date.now()}-${index}`,
        src: image.getAttribute("src") || image.src,
        alt: image.getAttribute("alt") || "",
        caption: caption?.textContent?.trim() || "",
        watermark: normalizeWatermark(figure.getAttribute("data-watermark")),
        width: Math.max(12, Math.min(100, storedWidth * coordinateScale)),
        x: figure.hasAttribute("data-x")
          ? gallery
            ? Number(figure.getAttribute("data-x")) * coordinateScale
            : 0
          : undefined,
        y: figure.hasAttribute("data-y")
          ? Number(figure.getAttribute("data-y"))
          : undefined,
        height: figure.hasAttribute("data-height")
          ? Number(figure.getAttribute("data-height"))
          : undefined,
        cropX: figure.hasAttribute("data-crop-x")
          ? Number(figure.getAttribute("data-crop-x"))
          : undefined,
        cropY: figure.hasAttribute("data-crop-y")
          ? Number(figure.getAttribute("data-crop-y"))
          : undefined,
        cropZoom: figure.hasAttribute("data-crop-zoom")
          ? Number(figure.getAttribute("data-crop-zoom"))
          : undefined,
      };
    })
    .filter((item) => item !== null) as StoryMediaItem[];

  const className = container.className;
  const firstItem = items[0];
  const storedAlignment = container.getAttribute("data-alignment");

  const alignment: StoryImageAlignment =
    storedAlignment === "left" ||
    storedAlignment === "center" ||
    storedAlignment === "right" ||
    storedAlignment === "full"
      ? storedAlignment
      : className.includes("story-media-left")
        ? "left"
        : className.includes("story-media-right")
          ? "right"
          : className.includes("story-media-full") ||
              (items.length === 1 && (firstItem?.width ?? 100) >= 99)
            ? "full"
            : items.length === 1 &&
                firstItem?.x !== undefined &&
                firstItem.x <= 1
              ? "left"
              : items.length === 1 &&
                  firstItem?.x !== undefined &&
                  firstItem.x + firstItem.width >= 99
                ? "right"
                : "center";

  const size: StoryImageSize =
    container.getAttribute("data-size") === "small" ||
    className.includes("story-media-small") ||
    className.includes("story-gallery-small")
      ? "small"
      : container.getAttribute("data-size") === "large" ||
          className.includes("story-media-large") ||
          className.includes("story-gallery-large")
        ? "large"
        : "medium";

  const rawLayout = container.getAttribute("data-layout");
  const layout: StoryGalleryLayout =
    rawLayout === "row" || rawLayout === "mosaic" || rawLayout === "stack"
      ? rawLayout
      : "grid";

  return {
    items,
    alignment,
    size,
    layout,
    sideTextEnabled:
      container.dataset.sideTextEnabled === "true" ||
      outerContainer.dataset.storyTextMedia === "true",
    leftText:
      container.dataset.storyLeftText ??
      outerContainer.querySelector(".story-side-text-left")?.textContent ??
      "",
    rightText:
      container.dataset.storyRightText ??
      outerContainer.querySelector(".story-side-text-right")?.textContent ??
      "",
    compositionWidth: Math.max(
      12,
      Math.min(
        100,
        Number(
          gallery
            ? (container.getAttribute("data-composition-width") ?? "100")
            : String(items[0]?.width ?? 100),
        ),
      ),
    ),
    compositionHeight: Math.max(
      120,
      Math.min(
        1200,
        Number(
          container.getAttribute("data-composition-height") ??
            container.getAttribute("data-canvas-height") ??
            Math.ceil(
              items.reduce(
                (maximum, item) =>
                  Math.max(maximum, (item.y ?? 0) + (item.height ?? 320)),
                120,
              ),
            ),
        ),
      ),
    ),
    photoGap: Math.max(
      0,
      Math.min(32, Number(container.getAttribute("data-photo-gap") ?? "12")),
    ),
    cornerRadius: Math.max(
      0,
      Math.min(
        40,
        Number(container.getAttribute("data-corner-radius") ?? "16"),
      ),
    ),
  };
}

function buildFigureHtml(
  item: StoryMediaItem,
  className: string,
  index?: number,
  frame?: Pick<
    StoryMediaDraft,
    "compositionWidth" | "compositionHeight" | "photoGap" | "cornerRadius"
  >,
  standalone = false,
) {
  const caption = item.caption.trim()
    ? `<figcaption class="story-media-caption">${escapeHtml(
        item.caption.trim(),
      )}</figcaption>`
    : "";

  const indexAttribute =
    index === undefined ? "" : ` data-story-image-index="${index}"`;

  const safeCompositionWidth = Math.max(
    12,
    Math.min(100, frame?.compositionWidth ?? 100),
  );
  const safeCompositionHeight = Math.max(
    120,
    Math.min(1200, frame?.compositionHeight ?? 560),
  );
  const safePhotoGap = Math.max(0, Math.min(32, frame?.photoGap ?? 12));
  const safeCornerRadius = Math.max(0, Math.min(40, frame?.cornerRadius ?? 16));
  // Centered photos can start before their frame so the viewport clips the
  // same amount from both sides instead of appearing anchored to the left.
  const safeX = Math.max(-100, Math.min(100, item.x ?? 0));
  const safeY = Math.max(0, item.y ?? 0);
  const safeWidth = Math.max(12, Math.min(100, item.width || 100));
  const serializedWidth = Math.round(safeWidth * 1000) / 1000;
  const legacyWidthClass = Math.max(
    20,
    Math.min(100, Math.round(safeWidth / 5) * 5),
  );
  const safeHeight = Math.max(120, item.height ?? 320);
  const safeCropX = Math.max(0, Math.min(100, item.cropX ?? 50));
  const safeCropY = Math.max(0, Math.min(100, item.cropY ?? 50));
  const safeCropZoom = Math.max(1, Math.min(2.5, item.cropZoom ?? 1));

  const frameAttributes = frame
    ? `data-composition-width="${safeCompositionWidth}" ` +
      `data-photo-gap="${safePhotoGap}" ` +
      `data-corner-radius="${safeCornerRadius}" `
    : "";

  const spatialAttributes =
    `data-x="${safeX}" ` +
    `data-y="${safeY}" ` +
    `data-height="${safeHeight}" ` +
    `data-crop-x="${safeCropX}" ` +
    `data-crop-y="${safeCropY}" ` +
    `data-crop-zoom="${safeCropZoom}" `;

  const frameStyle = frame
    ? `style="${
        standalone
          ? `width:${serializedWidth}%;` +
            `max-width:${serializedWidth}%;` +
            `height:${safeHeight}px;`
          : `position:absolute;` +
            `left:${(safeX / safeCompositionWidth) * 100}%;` +
            `top:${(safeY / safeCompositionHeight) * 100}%;` +
            `width:${(safeWidth / safeCompositionWidth) * 100}%;` +
            `height:${(safeHeight / safeCompositionHeight) * 100}%;` +
            `padding:${safePhotoGap / 2}px;` +
            `box-sizing:border-box;` +
            `background:transparent;`
      }display:flex;flex-direction:column;overflow:hidden;border-radius:${
        safeCornerRadius + safePhotoGap / 2
      }px;" `
    : "";

  const imageStyle =
    `display:block;` +
    `width:100%;` +
    `height:0;` +
    `min-height:0;` +
    `flex:1 1 0%;` +
    `object-fit:cover;` +
    `object-position:${safeCropX}% ${safeCropY}%;` +
    `transform:scale(${safeCropZoom});` +
    `transform-origin:${safeCropX}% ${safeCropY}%;` +
    `border-radius:${safeCornerRadius}px;`;

  return (
    `<figure contenteditable="false" tabindex="0" ` +
    `data-story-image="true"${indexAttribute} ` +
    `data-watermark="${item.watermark}" ` +
    `data-width="${serializedWidth}" ` +
    frameAttributes +
    spatialAttributes +
    frameStyle +
    `draggable="true" ` +
    `class="${className} story-media-width-${legacyWidthClass}">` +
    `<img src="${escapeHtml(item.src)}" ` +
    `alt="${escapeHtml(item.alt.trim())}" ` +
    `style="${imageStyle}" ` +
    `loading="lazy" decoding="async">` +
    caption +
    `</figure>`
  );
}

export function serializeMediaDraft(draft: StoryMediaDraft) {
  const canvasHeight = Math.max(
    120,
    Math.min(1200, Math.round(draft.compositionHeight)),
  );

  const compositionWidth = Math.max(
    12,
    Math.min(100, Math.round(draft.compositionWidth * 10) / 10),
  );

  const galleryHtml =
    `<section contenteditable="false" tabindex="0" draggable="true" ` +
    `data-story-gallery="true" ` +
    `data-story-composition="true" ` +
    `data-story-coordinates="independent" ` +
    `data-alignment="${draft.alignment}" ` +
    `data-side-text-enabled="${draft.sideTextEnabled === true}" ` +
    `data-story-left-text="${escapeHtml(draft.leftText ?? "")}" ` +
    `data-story-right-text="${escapeHtml(draft.rightText ?? "")}" ` +
    `data-layout="${draft.layout}" ` +
    `data-size="${draft.size}" ` +
    `data-count="${draft.items.length}" ` +
    `data-composition-width="${compositionWidth}" ` +
    `data-composition-height="${canvasHeight}" ` +
    `data-photo-gap="${draft.photoGap}" ` +
    `data-corner-radius="${draft.cornerRadius}" ` +
    `data-spatial-layout="true" ` +
    `data-canvas-height="${canvasHeight}" ` +
    `style="position:relative;display:block;width:${compositionWidth}%;aspect-ratio:${compositionWidth * 10} / ${canvasHeight};container-type:inline-size;overflow:hidden;gap:0;margin-inline:auto;" ` +
    `class="story-gallery story-gallery-${draft.layout} story-gallery-${draft.size}">` +
    draft.items
      .map((item, index) =>
        buildFigureHtml(item, "story-gallery-item", index, draft),
      )
      .join("") +
    `</section>`;
  const withSideText =
    draft.sideTextEnabled &&
    draft.alignment === "center" &&
    draft.items.length === 1;
  const mediaHtml = withSideText
    ? `<section data-story-text-media="true" class="story-text-media" contenteditable="false" tabindex="0" draggable="true">` +
      galleryHtml +
      `<div class="story-side-text story-side-text-left">${escapeHtml(draft.leftText ?? "")}</div>` +
      `<div class="story-side-text story-side-text-right">${escapeHtml(draft.rightText ?? "")}</div></section>`
    : galleryHtml;

  return mediaHtml;
}
