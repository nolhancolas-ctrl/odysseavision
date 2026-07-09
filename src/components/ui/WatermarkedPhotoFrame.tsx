import { FrameWatermark } from "@/components/ui/FrameWatermark";

type WatermarkedPhotoFrameProps = {
  src: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  showWatermark?: boolean;
};

export function WatermarkedPhotoFrame({
  src,
  alt = "",
  className = "",
  imageClassName = "",
  showWatermark = true,
}: WatermarkedPhotoFrameProps) {
  return (
    <div
      className={[
        "group relative overflow-hidden bg-[#d8cdb8]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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

      <FrameWatermark enabled={showWatermark} />
    </div>
  );
}
