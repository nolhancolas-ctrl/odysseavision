import { FrameWatermark } from "@/components/ui/FrameWatermark";

type WatermarkedPhotoFrameProps = {
  src: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  showWatermark?: boolean;
  watermarkOwner?: "default" | "andrew" | "morgane";
  preserveAspectRatio?: boolean;
};

export function WatermarkedPhotoFrame({
  src,
  alt = "",
  className = "",
  imageClassName = "",
  showWatermark = true,
  watermarkOwner = "default",
  preserveAspectRatio = false,
}: WatermarkedPhotoFrameProps) {
  const containerClassName = [
    "group relative overflow-hidden bg-[#d8cdb8]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (preserveAspectRatio) {
    return (
      <div className={containerClassName}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={[
            "block h-auto w-full",
            imageClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        />

        <FrameWatermark
          enabled={showWatermark}
          owner={watermarkOwner}
        />
      </div>
    );
  }

  return (
    <div
      className={containerClassName}
      aria-label={alt}
    >
      <div
        className={[
          "absolute inset-0 bg-cover bg-center",
          imageClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ backgroundImage: `url(${src})` }}
      />

      <FrameWatermark
        enabled={showWatermark}
        owner={watermarkOwner}
      />
    </div>
  );
}
