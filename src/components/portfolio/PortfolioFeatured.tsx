import Link from "next/link";
import { WatermarkedPhotoFrame } from "@/components/ui/WatermarkedPhotoFrame";
import { featuredImages } from "@/data/portfolio";
import type { PublicSectionContent } from "@/lib/content/site";

type PortfolioFeaturedProps = {
  content?: PublicSectionContent;
};

function shouldShowWatermark(
  content: PublicSectionContent | undefined,
  key: string,
) {
  return content?.imageWatermarks?.[key] ?? true;
}

function ImageTile({
  src,
  imageKey,
  className,
  content,
}: {
  src: string;
  imageKey: string;
  className: string;
  content?: PublicSectionContent;
}) {
  if (!src) {
    return <div className={`bg-[#30331f] ${className}`} />;
  }

  return (
    <WatermarkedPhotoFrame
      src={src}
      alt={imageKey}
      className={className}
      showWatermark={shouldShowWatermark(content, imageKey)}
    />
  );
}

export function PortfolioFeatured({ content }: PortfolioFeaturedProps) {
  const images = [
    {
      key: "featured01",
      src: content?.images.featured01 || featuredImages[0].src,
    },
    {
      key: "featured02",
      src: content?.images.featured02 || featuredImages[1].src,
    },
    {
      key: "featured03",
      src: content?.images.featured03 || featuredImages[2].src,
    },
    {
      key: "featured04",
      src: content?.images.featured04 || featuredImages[3].src,
    },
    {
      key: "featured05",
      src: content?.images.featured05 || featuredImages[4].src,
    },
    {
      key: "featured06",
      src: content?.images.featured06 || featuredImages[5].src,
    },
  ];

  return (
    <section className="bg-[#11190f] px-6 py-16 text-[#f4efe4] md:px-14">
      <div className="mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[250px_1fr]">
        <div className="flex flex-col justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
            {content?.eyebrow || "Featured gallery"}
          </p>
          <h2 className="mt-4 font-serif text-4xl uppercase">
            {content?.title || "Wildlife"}
          </h2>
          <div className="my-5 h-px w-10 bg-white/35" />
          <p className="max-w-[190px] text-xs leading-6 text-white/60">
            {content?.description ||
              "Quiet encounters, fleeting moments and a deep respect for all living creatures."}
          </p>

          <Link
            href={content?.ctaHref || "/portfolio/wildlife"}
            className="mt-8 w-fit border border-white/35 px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.18em] transition hover:bg-white/10"
          >
            {content?.ctaLabel || "View full gallery"} →
          </Link>
        </div>

        <div className="grid min-h-[510px] grid-cols-12 grid-rows-2 gap-2">
          <ImageTile
            src={images[0].src}
            imageKey={images[0].key}
            content={content}
            className="col-span-7"
          />
          <ImageTile
            src={images[1].src}
            imageKey={images[1].key}
            content={content}
            className="col-span-5"
          />
          <ImageTile
            src={images[2].src}
            imageKey={images[2].key}
            content={content}
            className="col-span-3"
          />
          <ImageTile
            src={images[3].src}
            imageKey={images[3].key}
            content={content}
            className="col-span-4"
          />
          <ImageTile
            src={images[4].src}
            imageKey={images[4].key}
            content={content}
            className="col-span-2"
          />
          <ImageTile
            src={images[5].src}
            imageKey={images[5].key}
            content={content}
            className="col-span-3"
          />
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-4xl text-center font-hand text-xl text-white/55">
        {content?.drawings.handwritten ||
          "The best wildlife moments are the ones you never planned."}
      </p>
    </section>
  );
}
