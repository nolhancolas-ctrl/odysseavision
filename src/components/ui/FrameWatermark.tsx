"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const WATERMARK_LOGO_SRC = "/images/admin/odyssea_logo.png";

const WATERMARK_SIZE_RATIO = 0.18;
const WATERMARK_MIN_SIZE = 28;
const WATERMARK_MAX_SIZE = 92;
const WATERMARK_OPACITY = 0.65;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

type FrameWatermarkProps = {
  enabled?: boolean;
};

export function FrameWatermark({ enabled = true }: FrameWatermarkProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(60);
  const [offset, setOffset] = useState(14);

  useEffect(() => {
    const element = ref.current;
    const frame = element?.parentElement;

    if (!frame) {
      return;
    }

    const updateSize = () => {
      const rect = frame.getBoundingClientRect();
      const smallestSide = Math.min(rect.width, rect.height);

      if (!smallestSide) {
        return;
      }

      const nextSize = Math.round(
        clamp(
          smallestSide * WATERMARK_SIZE_RATIO,
          WATERMARK_MIN_SIZE,
          WATERMARK_MAX_SIZE,
        ),
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
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-10"
      style={{
        width: size,
        height: size,
        right: offset,
        bottom: offset,
        opacity: WATERMARK_OPACITY,
      }}
    >
      <Image
        src={WATERMARK_LOGO_SRC}
        alt=""
        fill
        sizes={`${WATERMARK_MAX_SIZE}px`}
        className="object-contain brightness-0 invert drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
}
