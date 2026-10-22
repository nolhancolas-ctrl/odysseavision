"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import {
  STORY_ARTBOARD_CONTENT_EVENT,
  STORY_MOBILE_MEDIA_QUERY,
} from "./storyComposition";
import { installSpatialLayouts } from "./storySpatialLayout";

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



export function StoryRichHtml({
  html,
  className,
  style,
}: StoryRichHtmlProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const artboard = root.closest("[data-story-artboard-mode]");
    if (artboard) {
      artboard.dispatchEvent(new Event(STORY_ARTBOARD_CONTENT_EVENT));
      return;
    }

    const mobileQuery = window.matchMedia(STORY_MOBILE_MEDIA_QUERY);
    const updateLayout = () => {
      root.dataset.storyLayout = mobileQuery.matches ? "mobile" : "desktop";
      installSpatialLayouts(root);
    };

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
