import { WatermarkedPhotoFrame } from "@/components/ui/WatermarkedPhotoFrame";
import { recentImages } from "@/data/portfolio";
import type { PublicSectionContent } from "@/lib/content/site";

type PortfolioRecentProps = {
  content?: PublicSectionContent;
};

function shouldShowWatermark(
  content: PublicSectionContent | undefined,
  key: string,
) {
  return content?.imageWatermarks?.[key] ?? true;
}

export function PortfolioRecent({ content }: PortfolioRecentProps) {
  const images = [
    {
      key: "recent01",
      src: content?.images.recent01 || recentImages[0].src,
    },
    {
      key: "recent02",
      src: content?.images.recent02 || recentImages[1].src,
    },
    {
      key: "recent03",
      src: content?.images.recent03 || recentImages[2].src,
    },
    {
      key: "recent04",
      src: content?.images.recent04 || recentImages[3].src,
    },
  ];

  return (
    <section className="bg-[#f4efe4] px-6 py-14 md:px-10">
      <p className="mb-8 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#242617]/65">
        {content?.eyebrow || "Recent shots from the wild"}
      </p>

      <div className="mx-auto grid max-w-[1450px] grid-cols-2 gap-2 lg:grid-cols-4">
        {images.map((image) =>
          image.src ? (
            <WatermarkedPhotoFrame
              key={image.key}
              src={image.src}
              alt={image.key}
              className="aspect-[1.5]"
              showWatermark={shouldShowWatermark(content, image.key)}
            />
          ) : null,
        )}
      </div>

      <p className="mt-7 text-center text-[9px] font-semibold uppercase tracking-[0.18em]">
        {content?.ctaLabel || "View more on Instagram"} →
      </p>
    </section>
  );
}
