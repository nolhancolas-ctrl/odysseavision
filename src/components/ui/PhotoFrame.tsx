"use client";

import { useEffect, useState } from "react";
import { FrameWatermark } from "@/components/ui/FrameWatermark";

type PhotoFrameProps = {
  src: string;
  label: string;
  className?: string;
  imageClassName?: string;
  imagePosition?: string;
  showLabelWhenMissing?: boolean;
  showWatermark?: boolean;
};

export function PhotoFrame({
  src,
  label,
  className = "",
  imageClassName = "",
  imagePosition = "center",
  showLabelWhenMissing = true,
  showWatermark = true,
}: PhotoFrameProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-[#28301f] shadow-2xl ${className}`}
    >
      {!hasError && (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setHasError(true)}
          className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`}
          style={{ objectPosition: imagePosition }}
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1d2418]">
          {showLabelWhenMissing && (
            <span className="rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
              {label}
            </span>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/5" />

      {!hasError ? <FrameWatermark enabled={showWatermark} /> : null}
    </div>
  );
}
