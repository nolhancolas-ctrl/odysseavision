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
    content?.images.featured01 || featuredImages[0]?.src,
    content?.images.featured02 || featuredImages[1]?.src,
    content?.images.featured03 || featuredImages[2]?.src,
    content?.images.featured04 || featuredImages[3]?.src,
    content?.images.featured05 || featuredImages[4]?.src,
    content?.images.featured06 || featuredImages[5]?.src,
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
    <section className="bg-[#11190f] px-6 py-16 text-[#f4efe4] md:px-14">
      <div className="mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[250px_1fr]">
        <div className="flex flex-col justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
            {content?.eyebrow || "Featured gallery"}
          </p>

          <h2 className="mt-4 font-serif text-4xl uppercase">
            {title}
          </h2>

          <div className="my-5 h-px w-10 bg-white/35" />

          <p className="max-w-[190px] text-xs leading-6 text-white/60">
            {description}
          </p>

          <Link
            href={ctaHref}
            className="mt-8 w-fit border border-white/35 px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.18em] transition hover:bg-white/10"
          >
            {content?.ctaLabel || "View full gallery"} →
          </Link>
        </div>

        <div className="grid min-h-[510px] grid-cols-12 grid-rows-2 gap-2">
          <ImageTile src={images[0]} className="col-span-7" />
          <ImageTile src={images[1]} className="col-span-5" />
          <ImageTile src={images[2]} className="col-span-3" />
          <ImageTile src={images[3]} className="col-span-4" />
          <ImageTile src={images[4]} className="col-span-2" />
          <ImageTile src={images[5]} className="col-span-3" />
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-4xl text-center font-hand text-xl text-white/55">
        {content?.drawings.handwritten ||
          "Some photographs feel like they already belong to memory."}
      </p>
    </section>
  );
}
