"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

type StoryRichHtmlProps = {
  html: string;
  className: string;
  style?: CSSProperties;
};

type WatermarkSettings = {
  enabled: boolean;
  defaultOwner: "andrew" | "morgane";
  andrewSrc: string;
  morganeSrc: string;
};

function resolveWatermarkSrc(
  settings: WatermarkSettings,
  owner: string,
) {
  if (owner === "MORGANE") {
    return settings.morganeSrc;
  }

  if (owner === "ANDREW") {
    return settings.andrewSrc;
  }

  return "";
}


function clampNumber(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(minimum, Math.min(maximum, parsed));
}

function installSpatialLayouts(root: HTMLElement) {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const galleries = root.querySelectorAll<HTMLElement>(
    'section[data-story-gallery="true"][data-spatial-layout="true"]',
  );

  galleries.forEach((gallery) => {
    const compositionWidth = clampNumber(
      gallery.dataset.compositionWidth,
      100,
      40,
      100,
    );
    const photoGap = clampNumber(
      gallery.dataset.photoGap,
      12,
      0,
      32,
    );
    const cornerRadius = clampNumber(
      gallery.dataset.cornerRadius,
      16,
      0,
      40,
    );
    const normalizedComposition =
      gallery.dataset.storyComposition === "true" ||
      gallery.dataset.compositionHeight !== undefined;
    const canvasHeight = clampNumber(
      gallery.dataset.compositionHeight ??
        gallery.dataset.canvasHeight,
      430,
      120,
      10000,
    );
    const figures = gallery.querySelectorAll<HTMLElement>(
      'figure[data-story-image="true"]',
    );

    if (mobile) {
      gallery.style.setProperty("display", "flex", "important");
      gallery.style.setProperty("position", "relative", "important");
      gallery.style.setProperty("width", "100%", "important");
      gallery.style.setProperty("height", "auto", "important");
      gallery.style.setProperty("aspect-ratio", "auto", "important");
      gallery.style.setProperty("overflow", "visible", "important");
      gallery.style.setProperty("container-type", "normal", "important");
      gallery.style.setProperty("flex-direction", "column", "important");
      gallery.style.setProperty("float", "none", "important");
      gallery.style.setProperty("clear", "both", "important");
      gallery.style.setProperty(
        "gap",
        `${Math.max(12, photoGap)}px`,
        "important",
      );
      gallery.style.setProperty("margin", "1.5rem 0", "important");

      figures.forEach((figure) => {
        figure.style.setProperty("position", "relative", "important");
        figure.style.setProperty("inset", "auto", "important");
        figure.style.setProperty("left", "auto", "important");
        figure.style.setProperty("top", "auto", "important");
        figure.style.setProperty("width", "100%", "important");
        figure.style.setProperty("height", "auto", "important");
        figure.style.setProperty("max-width", "100%", "important");
        figure.style.setProperty("padding", "0", "important");
        figure.style.setProperty("margin", "0", "important");
        figure.style.setProperty("display", "flex", "important");
        figure.style.setProperty("flex", "0 0 auto", "important");
        figure.style.setProperty("flex-direction", "column", "important");
        figure.style.setProperty("overflow", "hidden");
        figure.style.setProperty("background", "transparent");
        figure.style.setProperty("border-radius", `${cornerRadius}px`);

        const image = figure.querySelector<HTMLImageElement>("img");

        if (!image) return;

        image.style.setProperty("display", "block", "important");
        image.style.setProperty("width", "100%", "important");
        image.style.setProperty("height", "auto", "important");
        image.style.setProperty("min-height", "0", "important");
        image.style.setProperty("max-height", "none", "important");
        image.style.setProperty("flex", "0 0 auto", "important");
        image.style.setProperty("object-fit", "contain", "important");
        image.style.setProperty("object-position", "center", "important");
        image.style.setProperty("transform", "none", "important");
        image.style.setProperty("transform-origin", "center", "important");
        image.style.setProperty("border-radius", `${cornerRadius}px`);
      });

      return;
    }

    if (figures.length === 1) {
      const figure = figures[0];
      const x = clampNumber(figure.dataset.x, 0, 0, 100);
      const width = clampNumber(figure.dataset.width, 100, 12, 100);
      const height = clampNumber(
        figure.dataset.height,
        320,
        120,
        10000,
      );
      const cropX = clampNumber(figure.dataset.cropX, 50, 0, 100);
      const cropY = clampNumber(figure.dataset.cropY, 50, 0, 100);
      const cropZoom = clampNumber(
        figure.dataset.cropZoom,
        1,
        1,
        2.5,
      );
      const alignment =
        width >= 99
          ? "full"
          : x <= 1
            ? "left"
            : x + width >= 99
              ? "right"
              : "center";

      gallery.style.setProperty("display", "block", "important");
      gallery.style.setProperty("position", "relative", "important");
      gallery.style.setProperty("width", `${width}%`, "important");
      gallery.style.setProperty("max-width", `${width}%`, "important");
      gallery.style.setProperty("height", "auto", "important");
      gallery.style.setProperty("aspect-ratio", "auto", "important");
      gallery.style.setProperty("overflow", "visible", "important");
      gallery.style.setProperty("container-type", "normal", "important");
      gallery.style.setProperty("gap", "0", "important");

      if (alignment === "left") {
        gallery.style.setProperty("float", "left", "important");
        gallery.style.setProperty("clear", "left", "important");
        gallery.style.setProperty(
          "margin",
          "0.45rem 2rem 1.25rem 0",
          "important",
        );
      } else if (alignment === "right") {
        gallery.style.setProperty("float", "right", "important");
        gallery.style.setProperty("clear", "right", "important");
        gallery.style.setProperty(
          "margin",
          "0.45rem 0 1.25rem 2rem",
          "important",
        );
      } else {
        gallery.style.setProperty("float", "none", "important");
        gallery.style.setProperty("clear", "both", "important");
        gallery.style.setProperty("margin", "2.4rem auto", "important");
      }

      figure.style.removeProperty("inset");
      figure.style.setProperty("position", "relative", "important");
      figure.style.setProperty("left", "auto", "important");
      figure.style.setProperty("top", "auto", "important");
      figure.style.setProperty("width", "100%", "important");
      figure.style.setProperty("height", `${height}px`, "important");
      figure.style.setProperty("max-width", "100%", "important");
      figure.style.setProperty(
        "padding",
        `${photoGap / 2}px`,
        "important",
      );
      figure.style.setProperty("margin", "0", "important");
      figure.style.setProperty("display", "flex", "important");
      figure.style.setProperty("flex-direction", "column");
      figure.style.setProperty("overflow", "hidden");
      figure.style.setProperty("background", "transparent");
      figure.style.setProperty(
        "border-radius",
        `${cornerRadius + photoGap / 2}px`,
      );

      const image = figure.querySelector<HTMLImageElement>("img");

      if (!image) return;

      image.style.setProperty("display", "block", "important");
      image.style.setProperty("width", "100%", "important");
      image.style.setProperty("height", "0", "important");
      image.style.setProperty("min-height", "0", "important");
      image.style.setProperty("max-height", "none", "important");
      image.style.setProperty("flex", "1 1 0%", "important");
      image.style.setProperty("object-fit", "cover");
      image.style.setProperty("object-position", `${cropX}% ${cropY}%`);
      image.style.setProperty("transform", `scale(${cropZoom})`);
      image.style.setProperty("transform-origin", `${cropX}% ${cropY}%`);
      image.style.setProperty("border-radius", `${cornerRadius}px`);

      return;
    }

    gallery.style.setProperty("display", "block", "important");
    gallery.style.setProperty("position", "relative", "important");
    gallery.style.setProperty("width", `${compositionWidth}%`, "important");
    gallery.style.setProperty(
      "aspect-ratio",
      normalizedComposition
        ? `${compositionWidth * 10} / ${canvasHeight}`
        : `1000 / ${canvasHeight}`,
      "important",
    );
    gallery.style.setProperty("height", "auto", "important");
    gallery.style.setProperty(
      "overflow",
      normalizedComposition ? "hidden" : "visible",
      "important",
    );
    gallery.style.setProperty("container-type", "inline-size", "important");
    gallery.style.setProperty("flex-direction", "initial", "important");
    gallery.style.setProperty("float", "none", "important");
    gallery.style.setProperty("clear", "both", "important");
    gallery.style.setProperty("gap", "0", "important");
    gallery.style.setProperty(
      "margin",
      "var(--story-section-spacing, 48px) auto",
      "important",
    );

    figures.forEach((figure) => {
      const x = clampNumber(figure.dataset.x, 0, 0, 100);
      const y = clampNumber(figure.dataset.y, 0, 0, canvasHeight);
      const width = clampNumber(figure.dataset.width, 100, 12, 100);
      const height = clampNumber(
        figure.dataset.height,
        320,
        120,
        10000,
      );
      const cropX = clampNumber(figure.dataset.cropX, 50, 0, 100);
      const cropY = clampNumber(figure.dataset.cropY, 50, 0, 100);
      const cropZoom = clampNumber(
        figure.dataset.cropZoom,
        1,
        1,
        2.5,
      );

      figure.style.removeProperty("inset");
      figure.style.setProperty("position", "absolute", "important");
      figure.style.setProperty("left", `${x}%`, "important");
      figure.style.setProperty(
        "top",
        normalizedComposition
          ? `${(y / canvasHeight) * 100}%`
          : `${y / 10}cqw`,
        "important",
      );
      figure.style.setProperty("width", `${width}%`, "important");
      figure.style.setProperty(
        "height",
        normalizedComposition
          ? `${(height / canvasHeight) * 100}%`
          : `${height / 10}cqw`,
        "important",
      );
      figure.style.setProperty(
        "padding",
        `${photoGap / 2}px`,
        "important",
      );
      figure.style.setProperty("box-sizing", "border-box");
      figure.style.setProperty("margin", "0", "important");
      figure.style.setProperty("max-width", "none", "important");
      figure.style.setProperty("background", "transparent");
      figure.style.setProperty("display", "flex", "important");
      figure.style.setProperty("flex", "0 1 auto", "important");
      figure.style.setProperty("flex-direction", "column");
      figure.style.setProperty("overflow", "hidden");
      figure.style.setProperty(
        "border-radius",
        `${cornerRadius + photoGap / 2}px`,
      );

      const image = figure.querySelector<HTMLImageElement>("img");

      if (!image) return;

      image.style.setProperty("display", "block", "important");
      image.style.setProperty("width", "100%", "important");
      image.style.setProperty("height", "0", "important");
      image.style.setProperty("min-height", "0", "important");
      image.style.setProperty("max-height", "none", "important");
      image.style.setProperty("flex", "1 1 0%", "important");
      image.style.setProperty("object-fit", "cover");
      image.style.setProperty("object-position", `${cropX}% ${cropY}%`);
      image.style.setProperty("transform", `scale(${cropZoom})`);
      image.style.setProperty("transform-origin", `${cropX}% ${cropY}%`);
      image.style.setProperty("border-radius", `${cornerRadius}px`);
    });
  });

  const standaloneFigures = root.querySelectorAll<HTMLElement>(
    'figure.story-media[data-story-image="true"][data-width][data-height]',
  );

  standaloneFigures.forEach((figure) => {
    const requestedWidth = clampNumber(
      figure.dataset.width,
      100,
      12,
      100,
    );
    const width = figure.classList.contains("story-media-full")
      ? 100
      : requestedWidth;
    const height = clampNumber(
      figure.dataset.height,
      320,
      120,
      10000,
    );
    const cropX = clampNumber(figure.dataset.cropX, 50, 0, 100);
    const cropY = clampNumber(figure.dataset.cropY, 50, 0, 100);
    const cropZoom = clampNumber(
      figure.dataset.cropZoom,
      1,
      1,
      2.5,
    );
    const cornerRadius = clampNumber(
      figure.dataset.cornerRadius,
      16,
      0,
      40,
    );
    const image = figure.querySelector<HTMLImageElement>(":scope > img");

    figure.style.setProperty("display", "flex", "important");
    figure.style.setProperty("flex-direction", "column", "important");
    figure.style.setProperty("overflow", "hidden");

    if (mobile) {
      figure.style.setProperty("position", "relative", "important");
      figure.style.setProperty("inset", "auto", "important");
      figure.style.setProperty("float", "none", "important");
      figure.style.setProperty("clear", "both", "important");
      figure.style.setProperty("width", "100%", "important");
      figure.style.setProperty("max-width", "100%", "important");
      figure.style.setProperty("height", "auto", "important");
      figure.style.setProperty("margin", "1.25rem 0", "important");
      figure.style.setProperty("padding", "0", "important");

      if (!image) return;

      image.style.setProperty("display", "block", "important");
      image.style.setProperty("width", "100%", "important");
      image.style.setProperty("height", "auto", "important");
      image.style.setProperty("min-height", "0", "important");
      image.style.setProperty("max-height", "none", "important");
      image.style.setProperty("flex", "0 0 auto", "important");
      image.style.setProperty("object-fit", "contain", "important");
      image.style.setProperty("object-position", "center", "important");
      image.style.setProperty("transform", "none", "important");
      image.style.setProperty("transform-origin", "center", "important");

      return;
    }

    figure.style.removeProperty("inset");
    figure.style.setProperty("position", "relative", "important");
    figure.style.setProperty("width", `${width}%`, "important");
    figure.style.setProperty("max-width", `${width}%`, "important");
    figure.style.setProperty("height", `${height}px`, "important");
    figure.style.setProperty("padding", "0", "important");
    figure.style.setProperty("border-radius", `${cornerRadius}px`);

    if (figure.classList.contains("story-media-left")) {
      figure.style.setProperty("float", "left", "important");
      figure.style.setProperty("clear", "left", "important");
      figure.style.setProperty(
        "margin",
        "0.45rem 2rem 1.25rem 0",
        "important",
      );
    } else if (figure.classList.contains("story-media-right")) {
      figure.style.setProperty("float", "right", "important");
      figure.style.setProperty("clear", "right", "important");
      figure.style.setProperty(
        "margin",
        "0.45rem 0 1.25rem 2rem",
        "important",
      );
    } else {
      figure.style.setProperty("float", "none", "important");
      figure.style.setProperty("clear", "both", "important");
      figure.style.setProperty("margin", "2.4rem auto", "important");
    }

    if (!image) return;

    image.style.setProperty("display", "block", "important");
    image.style.setProperty("width", "100%", "important");
    image.style.setProperty("height", "0", "important");
    image.style.setProperty("min-height", "0", "important");
    image.style.setProperty("max-height", "none", "important");
    image.style.setProperty("flex", "1 1 0%", "important");
    image.style.setProperty("object-fit", "cover");
    image.style.setProperty("object-position", `${cropX}% ${cropY}%`);
    image.style.setProperty("transform", `scale(${cropZoom})`);
    image.style.setProperty("transform-origin", `${cropX}% ${cropY}%`);
    image.style.setProperty("border-radius", `${cornerRadius}px`);
  });
}

export function StoryRichHtml({
  html,
  className,
  style,
}: StoryRichHtmlProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateLayout = () => installSpatialLayouts(root);

    updateLayout();
    mobileQuery.addEventListener("change", updateLayout);

    return () => {
      mobileQuery.removeEventListener("change", updateLayout);
    };
  }, [html]);


  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const storyRoot: HTMLDivElement = root;
    let cancelled = false;
    const createdWatermarks: HTMLElement[] = [];

    async function installWatermarks() {
      const response = await fetch("/api/watermarks", {
        cache: "no-store",
      });

      if (!response.ok || cancelled) return;

      const settings =
        (await response.json()) as WatermarkSettings;

      if (cancelled) return;

      const figures = storyRoot.querySelectorAll<HTMLElement>(
        'figure[data-story-image="true"]',
      );

      figures.forEach((figure) => {
        figure
          .querySelectorAll(":scope > .story-media-watermark")
          .forEach((element) => element.remove());

        const owner = (
          figure.dataset.watermark || "NONE"
        ).toUpperCase();

        const src = resolveWatermarkSrc(settings, owner);

        if (!src) return;

        const watermark = document.createElement("span");
        watermark.className = "story-media-watermark";
        watermark.setAttribute("aria-hidden", "true");

        const image = document.createElement("img");
        image.src = src;
        image.alt = "";
        image.decoding = "async";
        image.loading = "lazy";

        image.addEventListener("error", () => {
          watermark.remove();
        });

        watermark.appendChild(image);
        figure.appendChild(watermark);
        createdWatermarks.push(watermark);
      });
    }

    installWatermarks().catch(() => {
      // A watermark failure must never hide the Story media.
    });

    return () => {
      cancelled = true;
      createdWatermarks.forEach((element) => element.remove());
    };
  }, [html]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
