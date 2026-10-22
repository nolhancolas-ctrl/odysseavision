// Photo coordinates use a stable 1000-unit-wide canvas. The frame is a
// viewport onto it: changing the frame must never scale the photo geometry.
export const STORY_MOBILE_MEDIA_QUERY =
  "(max-width: 767px), (max-aspect-ratio: 4 / 3)";
export const STORY_ARTBOARD_CONTENT_EVENT = "story-artboard-content-change";
export const STORY_DESKTOP_ARTBOARD_WIDTH = 1050;
export const STORY_MOBILE_ARTBOARD_WIDTH = 390;
export const STORY_MAX_FRAME_HEIGHT = 10000;

export type StoryArtboardMode = "auto" | "desktop" | "mobile";

type StoryMediaAlignment = "left" | "center" | "right" | "full";

export function maximumStoryFrameWidth(alignment: StoryMediaAlignment) {
  if (alignment === "full") return 100;
  return alignment === "center" ? 60 : 72;
}

export function singlePhotoPresetWidth(
  size: "small" | "medium" | "large",
  alignment: StoryMediaAlignment,
) {
  if (alignment === "full") return 100;

  if (alignment === "center") {
    return size === "small" ? 40 : size === "large" ? 60 : 50;
  }

  return size === "small" ? 45 : size === "large" ? 72 : 58;
}

export function storyLayoutIsMobile(element: HTMLElement) {
  const artboard = element.closest<HTMLElement>(
    "[data-story-artboard-mode]",
  );
  const mode = artboard?.dataset.storyArtboardMode;

  if (mode === "mobile") return true;
  if (mode === "desktop") return false;
  const resolved = artboard?.dataset.storyArtboardResolved;
  if (resolved) return resolved === "mobile";

  return window.matchMedia(STORY_MOBILE_MEDIA_QUERY).matches;
}

export function storyTextMediaColumns(
  alignment: StoryMediaAlignment,
  frameWidth: number,
) {
  const width = Math.max(
    12,
    Math.min(maximumStoryFrameWidth(alignment), frameWidth),
  );
  const photoColumn = `minmax(0, ${width}%)`;

  if (alignment === "left") {
    return `${photoColumn} minmax(0, 1fr)`;
  }

  if (alignment === "right") {
    return `minmax(0, 1fr) ${photoColumn}`;
  }

  return `minmax(0, 1fr) ${photoColumn} minmax(0, 1fr)`;
}

export function photoFrameGeometry(
  photo: { width: number; height?: number; x?: number; y?: number },
  frameWidth: number,
  frameHeight: number,
) {
  return {
    left: `${((photo.x ?? 0) / frameWidth) * 100}%`,
    top: `${((photo.y ?? 0) / frameHeight) * 100}%`,
    width: `${(photo.width / frameWidth) * 100}%`,
    height: `${((photo.height ?? 320) / frameHeight) * 100}%`,
  };
}

type PhotoRectangle = { x?: number; y?: number; width: number; height?: number };

/** Push intersecting photos down in reading order; never resize their pixels.
 * Shared by editing, serialization and rendering, including older content.
 * Each placed rectangle is final, so chained collisions resolve in one pass.
 */
export function separateOverlappingPhotos<T extends PhotoRectangle>(items: T[]): T[] {
  const placed: T[] = [];
  const result = items.map((item) => ({ ...item }));
  const ordered = result.map((item, index) => ({ item, index })).sort(
    (a, b) => (a.item.y ?? 0) - (b.item.y ?? 0) ||
      (a.item.x ?? 0) - (b.item.x ?? 0) || a.index - b.index,
  );
  for (const { item } of ordered) {
    let y = item.y ?? 0;
    const x = item.x ?? 0;
    for (const previous of placed) {
      const px = previous.x ?? 0;
      // A small tolerance avoids moving adjacent columns due to rounding.
      if (x < px + previous.width - 0.001 && x + item.width > px + 0.001) {
        y = Math.max(y, (previous.y ?? 0) + (previous.height ?? 320));
      }
    }
    item.y = y;
    placed.push(item);
  }
  return result;
}

export function alignedPhotoX(
  alignment: "left" | "center" | "right" | "full",
  frameWidth: number,
  photoWidth: number,
) {
  if (alignment === "center") {
    return (frameWidth - photoWidth) / 2;
  }

  if (alignment === "right") {
    return frameWidth - photoWidth;
  }

  return 0;
}

function number(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = value === undefined ? fallback : Number(value);
  return Math.max(
    min,
    Math.min(max, Number.isFinite(parsed) ? parsed : fallback),
  );
}

function setStyles(element: HTMLElement, values: Record<string, string>) {
  for (const [property, value] of Object.entries(values)) {
    element.style.setProperty(property, value, "important");
  }
}

function ensureSideTextElement(
  wrapper: HTMLElement,
  side: "left" | "right",
  text: string,
) {
  const selector = `:scope > .story-side-text-${side}`;
  let element = wrapper.querySelector<HTMLElement>(selector);

  if (!element) {
    element = document.createElement("div");
    element.className = `story-side-text story-side-text-${side}`;
    wrapper.append(element);
  }

  if (!element.textContent?.trim() && text.trim()) {
    element.textContent = text;
  }

  return element;
}

function restoreSideTextWrapper(
  root: HTMLElement,
  gallery: HTMLElement,
  alignment: StoryMediaAlignment,
) {
  const existingWrapper = gallery.parentElement?.matches(
    '[data-story-text-media="true"]',
  )
    ? gallery.parentElement
    : null;

  if (existingWrapper) return existingWrapper;

  // Atomic editor node views may use the gallery itself as their root. Do
  // not replace that root: the public renderer always supplies a parent.
  if (
    root === gallery ||
    gallery.dataset.sideTextEnabled !== "true" ||
    alignment === "full"
  ) {
    return null;
  }

  const leftText = gallery.dataset.storyLeftText ?? "";
  const rightText = gallery.dataset.storyRightText ?? "";
  const hasVisibleText =
    alignment === "center"
      ? Boolean(leftText.trim() || rightText.trim())
      : alignment === "left"
        ? Boolean(rightText.trim())
        : Boolean(leftText.trim());

  if (!hasVisibleText) return null;

  const wrapper = document.createElement("section");
  wrapper.className = "story-text-media";
  wrapper.dataset.storyTextMedia = "true";
  wrapper.dataset.sideTextEnabled = "true";
  wrapper.dataset.alignment = alignment;
  wrapper.dataset.storyLeftText = leftText;
  wrapper.dataset.storyRightText = rightText;

  gallery.replaceWith(wrapper);
  wrapper.append(gallery);

  return wrapper;
}

// Used by both the public renderer and the editor's atomic media node view.
export function installIndependentCompositions(
  root: HTMLElement,
  mobile: boolean,
) {
  const selector = 'section[data-story-coordinates="independent"]';
  const galleries = [
    ...(root.matches(selector) ? [root] : []),
    ...Array.from(root.querySelectorAll<HTMLElement>(selector)),
  ];

  for (const gallery of galleries) {
    const width = number(gallery.dataset.compositionWidth, 100, 12, 100);
    const height = number(gallery.dataset.compositionHeight, 560, 120, STORY_MAX_FRAME_HEIGHT);
    const gap = number(gallery.dataset.photoGap, 12, 0, 32);
    const radius = number(gallery.dataset.cornerRadius, 16, 0, 40);
    const alignment: StoryMediaAlignment =
      gallery.dataset.alignment === "left" ||
      gallery.dataset.alignment === "right" ||
      gallery.dataset.alignment === "full"
        ? gallery.dataset.alignment
        : "center";
    const textMedia = restoreSideTextWrapper(root, gallery, alignment);
    const besideText = textMedia !== null;
    const floating =
      !mobile && !besideText && (alignment === "left" || alignment === "right");

    if (textMedia) {
      const leftText =
        textMedia.dataset.storyLeftText ??
        gallery.dataset.storyLeftText ??
        "";
      const rightText =
        textMedia.dataset.storyRightText ??
        gallery.dataset.storyRightText ??
        "";
      const leftElement = ensureSideTextElement(
        textMedia,
        "left",
        leftText,
      );
      const rightElement = ensureSideTextElement(
        textMedia,
        "right",
        rightText,
      );
      const showLeft =
        (alignment === "center" || alignment === "right") &&
        Boolean(leftElement.textContent?.trim());
      const showRight =
        (alignment === "center" || alignment === "left") &&
        Boolean(rightElement.textContent?.trim());

      textMedia.dataset.alignment = alignment;
      setStyles(textMedia, {
        display: mobile ? "flex" : "grid",
        "grid-template-columns": mobile
          ? "none"
          : storyTextMediaColumns(alignment, width),
        "flex-direction": mobile ? "column" : "initial",
      });
      setStyles(leftElement, {
        display: showLeft ? "block" : "none",
        order: mobile ? "1" : "initial",
      });
      setStyles(rightElement, {
        display: showRight ? "block" : "none",
        order: mobile ? "2" : "initial",
      });
    }

    setStyles(gallery, {
      position: "relative",
      display: mobile ? "flex" : "block",
      width: mobile || besideText ? "100%" : `${width}%`,
      "max-width": "100%",
      height: "auto",
      "aspect-ratio": mobile ? "auto" : `${width * 10} / ${height}`,
      overflow: mobile ? "visible" : "hidden",
      "container-type": "normal",
      "flex-direction": "column",
      order: mobile && besideText ? "0" : "initial",
      gap: mobile ? `${Math.max(12, gap)}px` : "0",
      float: floating ? alignment : "none",
      clear: floating ? alignment : "both",
      margin: besideText
        ? "0"
        : floating
          ? alignment === "left"
            ? "0.45rem 2rem 1.25rem 0"
            : "0.45rem 0 1.25rem 2rem"
          : "1.5rem auto",
    });

    const figures = Array.from(gallery.querySelectorAll<HTMLElement>(
      'figure[data-story-image="true"]',
    ));
    const photos = separateOverlappingPhotos(figures.map((figure) => ({
      width: number(figure.dataset.width, 100, 12, 100),
      height: number(figure.dataset.height, 320, 120, 10000),
      x: number(figure.dataset.x, 0, -100, 100),
      y: number(figure.dataset.y, 0, 0, 10000),
    })));
    for (const [index, figure] of figures.entries()) {
      const geometry = photoFrameGeometry(
        photos[index],
        width,
        height,
      );
      setStyles(figure, {
        position: mobile ? "relative" : "absolute",
        inset: "auto",
        ...geometry,
        ...(mobile
          ? { left: "auto", top: "auto", width: "100%", height: "auto" }
          : {}),
        "max-width": "none",
        margin: "0",
        padding: mobile ? "0" : `${gap / 2}px`,
        "box-sizing": "border-box",
        display: "flex",
        "flex-direction": "column",
        flex: "0 0 auto",
        float: "none",
        overflow: "hidden",
        background: "transparent",
        "border-radius": `${radius}px`,
      });
      const image = figure.querySelector<HTMLElement>(":scope > img");
      if (!image) continue;
      const cropX = number(figure.dataset.cropX, 50, 0, 100);
      const cropY = number(figure.dataset.cropY, 50, 0, 100);
      const zoom = number(figure.dataset.cropZoom, 1, 1, 2.5);
      setStyles(image, {
        display: "block",
        width: "100%",
        height: mobile ? "auto" : "0",
        "min-height": "0",
        "max-height": "none",
        flex: mobile ? "0 0 auto" : "1 1 0%",
        "object-fit": mobile ? "contain" : "cover",
        "object-position": mobile ? "center" : `${cropX}% ${cropY}%`,
        transform: mobile ? "none" : `scale(${zoom})`,
        "transform-origin": mobile ? "center" : `${cropX}% ${cropY}%`,
        "border-radius": `${radius}px`,
      });
    }
  }
}
