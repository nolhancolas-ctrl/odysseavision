import Link from "next/link";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  getPublicPortfolioCategories,
  type PublicPortfolioCategory,
} from "@/lib/content/portfolio";
import type { PublicSectionContent } from "@/lib/content/site";


const HOME_PORTFOLIO_ORDER = ["ocean", "wildlife", "landscape", "portrait"] as const;

type HomePortfolioPreviewProps = {
  content?: PublicSectionContent;
};

function getFeaturedCategories(categories: PublicPortfolioCategory[]) {
  const normalizedCategories = categories.map((item) => ({
    item,
    title: item.title.toLowerCase(),
  }));

  return HOME_PORTFOLIO_ORDER.map((wantedTitle) =>
    normalizedCategories.find(({ title }) => title.includes(wantedTitle))?.item,
  ).filter((item): item is PublicPortfolioCategory => Boolean(item));
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
        showWatermark={false}
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
  ).map((item, index) => ({
    ...item,
    number: String(index + 1).padStart(2, "0"),
  }));

  return (
    <section className="overflow-hidden bg-[#11190f] px-6 py-20 text-[#f4efe4] md:px-14 md:py-24">
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
      </div>
    </section>
  );
}
