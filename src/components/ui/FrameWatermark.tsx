"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const WATERMARK_LOGO_SRC = "/images/admin/odyssea_logo.png";

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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

type FrameWatermarkProps = {
  enabled?: boolean;
  mode?: keyof typeof WATERMARK_CONFIG;
};

export function FrameWatermark({
  enabled = true,
  mode = "photo",
}: FrameWatermarkProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const config = WATERMARK_CONFIG[mode];
  const [size, setSize] = useState<number>(config.minSize);
  const [offset, setOffset] = useState<number>(
    Math.round(config.minSize * 0.24),
  );

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

  if (!enabled) return null;

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
      <Image
        src={WATERMARK_LOGO_SRC}
        alt=""
        fill
        sizes={`${config.maxSize}px`}
        className="object-contain brightness-0 invert drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
}
