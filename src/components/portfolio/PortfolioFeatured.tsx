import Link from "next/link";
import { featuredImages } from "@/data/portfolio";
import {
  getPublicPortfolioCategories,
  getPublicPortfolioItems,
  type PublicPortfolioItem,
} from "@/lib/content/portfolio";
import type { PublicSectionContent } from "@/lib/content/site";

type PortfolioFeaturedProps = {
  content?: PublicSectionContent;
};

function ImageTile({
  src,
  className,
}: {
  src: string;
  className: string;
}) {
  if (!src) {
    return <div className={`bg-[#30331f] ${className}`} />;
  }

  return (
    <div
      className={`bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}

function isVintageItem(item: PublicPortfolioItem) {
  return (
    item.categorySlug.toLowerCase().includes("vintage") ||
    item.category.toLowerCase().includes("vintage")
  );
}

function isDefaultWildlifeText(value: string | undefined) {
  return Boolean(value && value.toLowerCase().includes("wildlife"));
}

export async function PortfolioFeatured({ content }: PortfolioFeaturedProps) {
  const [categories, items] = await Promise.all([
    getPublicPortfolioCategories(),
    getPublicPortfolioItems(),
  ]);

  const vintageCategory = categories.find((category) =>
    category.title.toLowerCase().includes("vintage"),
  );

  const vintageItems = items.filter(isVintageItem);

  const fallbackImages = [
    content?.images.featured01 ?? featuredImages[0]?.src,
    content?.images.featured02 ?? featuredImages[1]?.src,
    content?.images.featured03 ?? featuredImages[2]?.src,
    content?.images.featured04 ?? featuredImages[3]?.src,
    content?.images.featured05 ?? featuredImages[4]?.src,
    content?.images.featured06 ?? featuredImages[5]?.src,
  ].filter(Boolean);

  const images = [
    ...vintageItems.map((item) => item.imageSrc),
    ...fallbackImages,
  ].slice(0, 6);

  while (images.length < 6) {
    images.push("");
  }

  const title =
    content?.title && !isDefaultWildlifeText(content.title)
      ? content.title
      : "Vintage";

  const description =
    content?.description && !content.description.toLowerCase().includes("quiet encounters")
      ? content.description
      : "Soft textures, timeless frames and nostalgic travel moments from our visual archive.";

  const ctaHref =
    content?.ctaHref && !content.ctaHref.toLowerCase().includes("wildlife")
      ? content.ctaHref
      : vintageCategory?.href || "/portfolio/vintage";

  return (
    <section className="overflow-hidden bg-[#11190f] px-4 py-12 text-[#f4efe4] sm:px-8 sm:py-14 md:px-14 md:py-16">
      <div className="mx-auto grid max-w-[1450px] gap-7 sm:gap-10 lg:grid-cols-[250px_1fr] lg:items-center">
        <div className="flex flex-col items-start justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
            {content?.eyebrow || "Featured gallery"}
          </p>

          <h2 className="mt-4 font-serif text-[clamp(2.5rem,12vw,4rem)] uppercase leading-none sm:text-4xl">
            {title}
          </h2>

          <div className="my-5 h-px w-10 bg-white/35" />

          <p className="max-w-md text-sm leading-6 text-white/65 sm:text-xs lg:max-w-[190px]">
            {description}
          </p>

          <Link
            href={ctaHref}
            className="mt-7 inline-flex min-w-[210px] items-center justify-center border border-white/35 px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.18em] transition hover:bg-white/10 sm:mt-8"
          >
            {content?.ctaLabel || "View full gallery"} →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:min-h-[510px] sm:grid-cols-12 sm:grid-rows-2">
          <ImageTile
            src={images[0]}
            className="col-span-2 aspect-[4/3] sm:col-span-7 sm:aspect-auto"
          />
          <ImageTile
            src={images[1]}
            className="col-span-1 aspect-square sm:col-span-5 sm:aspect-auto"
          />
          <ImageTile
            src={images[2]}
            className="col-span-1 aspect-square sm:col-span-3 sm:aspect-auto"
          />
          <ImageTile
            src={images[3]}
            className="col-span-2 aspect-[16/9] sm:col-span-4 sm:aspect-auto"
          />
          <ImageTile
            src={images[4]}
            className="col-span-1 aspect-square sm:col-span-2 sm:aspect-auto"
          />
          <ImageTile
            src={images[5]}
            className="col-span-1 aspect-square sm:col-span-3 sm:aspect-auto"
          />
        </div>
      </div>

      <p className="mx-auto mt-7 max-w-xl px-4 text-center font-hand text-base leading-6 text-white/60 sm:mt-8 sm:max-w-4xl sm:text-xl sm:leading-8">
        {content?.drawings.handwritten ||
          "Some photographs feel like they already belong to memory."}
      </p>
    </section>
  );
}
