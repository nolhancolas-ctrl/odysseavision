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
      className="group flex min-h-[420px] w-full flex-col bg-[#30331f] p-5 transition active:scale-[0.99] sm:min-h-[470px] sm:hover:-translate-y-1 sm:hover:bg-[#3b3e27]"
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
    <section className="overflow-hidden bg-[#11190f] px-5 py-16 text-[#f4efe4] sm:px-6 md:px-14 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <SectionLabel dark>{content?.eyebrow || "Portfolio"}</SectionLabel>
          <h2 className="font-serif text-[clamp(2.7rem,12vw,3.75rem)] uppercase leading-[0.95] tracking-[-0.04em]">
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
