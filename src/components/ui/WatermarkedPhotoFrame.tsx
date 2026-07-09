import Image from "next/image";

const WATERMARK_LOGO_SRC = "/images/admin/odyssea_logo.png";

type WatermarkedPhotoFrameProps = {
  src: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
};

export function WatermarkedPhotoFrame({
  src,
  alt = "",
  className = "",
  imageClassName = "",
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

      <div className="pointer-events-none absolute bottom-3 right-3 z-10 h-[70px] w-[70px] opacity-[0.75] md:bottom-4 md:right-4 md:h-[60px] md:w-[60px]">
        <Image
          src={WATERMARK_LOGO_SRC}
          alt=""
          fill
          sizes="48px"
          className="object-contain brightness-0 invert drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]"
        />
      </div>
    </div>
  );
}
