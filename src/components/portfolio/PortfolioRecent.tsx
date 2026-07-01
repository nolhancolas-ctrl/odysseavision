import { recentImages } from "@/data/portfolio";
import type { PublicSectionContent } from "@/lib/content/site";

type PortfolioRecentProps = {
  content?: PublicSectionContent;
};

export function PortfolioRecent({ content }: PortfolioRecentProps) {
  const images = [
    content?.images.recent01 || recentImages[0].src,
    content?.images.recent02 || recentImages[1].src,
    content?.images.recent03 || recentImages[2].src,
    content?.images.recent04 || recentImages[3].src,
  ];

  return (
    <section className="bg-[#f4efe4] px-6 py-14 md:px-10">
      <p className="mb-8 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#242617]/65">
        {content?.eyebrow || "Recent shots from the wild"}
      </p>

      <div className="mx-auto grid max-w-[1450px] grid-cols-2 gap-2 lg:grid-cols-4">
        {images.map((image, index) =>
          image ? (
            <div
              key={`${image}-${index}`}
              className="aspect-[1.5] bg-[#d8d1c4] bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
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
