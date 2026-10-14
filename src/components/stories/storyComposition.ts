// Photo coordinates use a stable 1000-unit-wide canvas. The frame is a
// viewport onto it: changing the frame must never scale the photo geometry.
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
    const width = number(gallery.dataset.compositionWidth, 100, 40, 100);
    const height = number(gallery.dataset.compositionHeight, 560, 120, 1200);
    const gap = number(gallery.dataset.photoGap, 12, 0, 32);
    const radius = number(gallery.dataset.cornerRadius, 16, 0, 40);
    const alignment = gallery.dataset.alignment;
    const besideText = gallery.parentElement?.matches(
      '[data-story-text-media="true"]',
    );
    const floating =
      !mobile && !besideText && (alignment === "left" || alignment === "right");

    setStyles(gallery, {
      position: "relative",
      display: mobile ? "flex" : "block",
      width: mobile ? "100%" : `${width}%`,
      "max-width": "100%",
      height: "auto",
      "aspect-ratio": mobile ? "auto" : `${width * 10} / ${height}`,
      overflow: mobile ? "visible" : "hidden",
      "container-type": "normal",
      "flex-direction": "column",
      gap: mobile ? `${Math.max(12, gap)}px` : "0",
      float: floating ? alignment : "none",
      clear: floating ? alignment : "both",
      margin: besideText
        ? "0 auto"
        : floating
          ? alignment === "left"
            ? "0.45rem 2rem 1.25rem 0"
            : "0.45rem 0 1.25rem 2rem"
          : "1.5rem auto",
    });

    for (const figure of gallery.querySelectorAll<HTMLElement>(
      'figure[data-story-image="true"]',
    )) {
      const geometry = photoFrameGeometry(
        {
          width: number(figure.dataset.width, 100, 12, 100),
          height: number(figure.dataset.height, 320, 120, 10000),
          x: number(figure.dataset.x, 0, 0, 100),
          y: number(figure.dataset.y, 0, 0, 10000),
        },
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
