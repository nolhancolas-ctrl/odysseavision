"use client";

import { useEffect, useRef, useState } from "react";

type WatermarkOwner = "default" | "andrew" | "morgane";

type WatermarkSettings = {
  enabled: boolean;
  defaultOwner: "andrew" | "morgane";
  andrewSrc: string;
  morganeSrc: string;
};

const FALLBACK_WATERMARK_SETTINGS: WatermarkSettings = {
  enabled: false,
  defaultOwner: "andrew",
  andrewSrc: "/images/admin/odyssea_logo.png",
  morganeSrc: "/images/admin/odyssea_logo.png",
};

const WATERMARK_CONFIG = {
  photo: {
    ratio: 0.14,
    minSize: 24,
    maxSize: 76,
    opacity: 0.62,
  },
  background: {
    ratio: 0.07,
    minSize: 42,
    maxSize: 96,
    opacity: 0.48,
  },
} as const;

let watermarkSettingsPromise: Promise<WatermarkSettings> | null = null;

function loadWatermarkSettings() {
  if (!watermarkSettingsPromise) {
    watermarkSettingsPromise = fetch("/api/watermarks", {
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) return FALLBACK_WATERMARK_SETTINGS;
        return response.json();
      })
      .then((value) => ({
        ...FALLBACK_WATERMARK_SETTINGS,
        ...value,
      }))
      .catch(() => FALLBACK_WATERMARK_SETTINGS);
  }

  return watermarkSettingsPromise;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveWatermarkSrc(
  settings: WatermarkSettings,
  owner: WatermarkOwner,
) {
  const resolvedOwner = owner === "default" ? settings.defaultOwner : owner;

  return resolvedOwner === "morgane" ? settings.morganeSrc : settings.andrewSrc;
}

type FrameWatermarkProps = {
  enabled?: boolean;
  mode?: keyof typeof WATERMARK_CONFIG;
  owner?: WatermarkOwner;
};

export function FrameWatermark({
  enabled = true,
  mode = "photo",
  owner = "default",
}: FrameWatermarkProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const config = WATERMARK_CONFIG[mode];
  const [settings, setSettings] = useState<WatermarkSettings>(
    FALLBACK_WATERMARK_SETTINGS,
  );
  const [size, setSize] = useState<number>(config.minSize);
  const [offset, setOffset] = useState<number>(
    Math.round(config.minSize * 0.24),
  );

  useEffect(() => {
    let cancelled = false;

    loadWatermarkSettings().then((nextSettings) => {
      if (!cancelled) {
        setSettings(nextSettings);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const element = ref.current;
    const frame = element?.parentElement;

    if (!frame) return;

    const updateSize = () => {
      const rect = frame.getBoundingClientRect();
      const smallestSide = Math.min(rect.width, rect.height);

      if (!smallestSide) return;

      const nextSize = Math.round(
        clamp(smallestSide * config.ratio, config.minSize, config.maxSize),
      );
      const nextOffset = Math.round(clamp(nextSize * 0.24, 8, 22));

      setSize(nextSize);
      setOffset(nextOffset);
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(frame);
    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [config.maxSize, config.minSize, config.ratio]);

  const src = resolveWatermarkSrc(settings, owner);

  if (!enabled || !settings.enabled || !src) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-10"
      style={{
        width: size,
        height: size,
        right: offset,
        bottom: offset,
        opacity: config.opacity,
      }}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full object-contain brightness-0 invert drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
}
