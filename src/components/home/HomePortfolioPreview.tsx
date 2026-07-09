import Link from "next/link";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  getPublicPortfolioCategories,
  type PublicPortfolioCategory,
} from "@/lib/content/portfolio";
import type { PublicSectionContent } from "@/lib/content/site";

type HomePortfolioPreviewProps = {
  content?: PublicSectionContent;
};

function getFeaturedCategories(categories: PublicPortfolioCategory[]) {
  return categories
    .filter((item) => item.title.toLowerCase() !== "vintage")
    .slice(0, 4);
}

function PortfolioPreviewCard({
  item,
}: {
  item: PublicPortfolioCategory;
}) {
  return (
    <Link
      href={item.href}
      className="group flex min-h-[470px] w-full flex-col bg-[#30331f] p-5 transition hover:-translate-y-1 hover:bg-[#3b3e27]"
    >
      <p className="mb-2 font-serif text-3xl text-[#b7a879]/75">
        {item.number}
      </p>

      <h3 className="mb-5 font-serif text-4xl uppercase leading-none">
        {item.title}
      </h3>

      <PhotoFrame
        src={item.image}
        label={item.label}
        className="mb-6 h-52 w-full [&_img]:object-center"
      />

      <p className="mb-5 text-sm leading-6 text-[#f4efe4]/70">
        {item.description}
      </p>

      <span className="mt-auto text-[11px] uppercase tracking-[0.18em] text-[#f4efe4]">
        View gallery
      </span>
    </Link>
  );
}

export async function HomePortfolioPreview({
  content,
}: HomePortfolioPreviewProps) {
  const portfolioCategories = getFeaturedCategories(
    await getPublicPortfolioCategories(),
  );

  return (
    <section className="bg-[#11190f] px-6 py-20 text-[#f4efe4] md:px-14 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <SectionLabel dark>{content?.eyebrow || "Portfolio"}</SectionLabel>
          <h2 className="font-serif text-5xl uppercase tracking-[-0.04em] md:text-6xl">
            {content?.title || "Explore our world"}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {portfolioCategories.map((item) => (
            <PortfolioPreviewCard key={item.title} item={item} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/portfolio"
            className="rounded-full border border-[#f4efe4]/20 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:border-[#b88a3b] hover:bg-[#b88a3b] hover:text-[#11190f]"
          >
            View portfolio
          </Link>
        </div>
      </div>
    </section>
  );
}
