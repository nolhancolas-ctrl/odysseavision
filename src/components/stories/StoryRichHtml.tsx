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
    const canvasHeight = clampNumber(
      gallery.dataset.canvasHeight,
      430,
      120,
      10000,
    );

    gallery.style.setProperty("display", "block", "important");
    gallery.style.setProperty("position", "relative");
    gallery.style.setProperty("width", `${compositionWidth}%`);
    gallery.style.setProperty(
      "aspect-ratio",
      `1000 / ${canvasHeight}`,
    );
    gallery.style.setProperty("height", "auto");
    gallery.style.setProperty("container-type", "inline-size");
    gallery.style.setProperty("gap", "0", "important");
    gallery.style.setProperty("margin-inline", "auto");

    const figures = gallery.querySelectorAll<HTMLElement>(
      'figure[data-story-image="true"]',
    );

    figures.forEach((figure) => {
      const x = clampNumber(figure.dataset.x, 0, 0, 100);
      const y = clampNumber(
        figure.dataset.y,
        0,
        0,
        canvasHeight,
      );
      const width = clampNumber(
        figure.dataset.width,
        100,
        12,
        100,
      );
      const height = clampNumber(
        figure.dataset.height,
        320,
        120,
        10000,
      );
      const cropX = clampNumber(
        figure.dataset.cropX,
        50,
        0,
        100,
      );
      const cropY = clampNumber(
        figure.dataset.cropY,
        50,
        0,
        100,
      );
      const cropZoom = clampNumber(
        figure.dataset.cropZoom,
        1,
        1,
        2.5,
      );

      figure.style.setProperty("position", "absolute", "important");
      figure.style.setProperty("left", `${x}%`, "important");
      figure.style.setProperty("top", `${y / 10}cqw`, "important");
      figure.style.setProperty("width", `${width}%`, "important");
      figure.style.setProperty(
        "height",
        `${height / 10}cqw`,
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
      figure.style.setProperty(
        "border-radius",
        `${cornerRadius + photoGap / 2}px`,
      );

      const image = figure.querySelector<HTMLImageElement>("img");

      if (image) {
        image.style.setProperty("width", "100%", "important");
        image.style.setProperty("height", "100%", "important");
        image.style.setProperty("min-height", "0", "important");
        image.style.setProperty("max-height", "none", "important");
        image.style.setProperty("object-fit", "cover");
        image.style.setProperty(
          "object-position",
          `${cropX}% ${cropY}%`,
        );
        image.style.setProperty("transform", `scale(${cropZoom})`);
        image.style.setProperty(
          "transform-origin",
          `${cropX}% ${cropY}%`,
        );
        image.style.setProperty(
          "border-radius",
          `${cornerRadius}px`,
        );
      }
    });
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

    installSpatialLayouts(root);
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
