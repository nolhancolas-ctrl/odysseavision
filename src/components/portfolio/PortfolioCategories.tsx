import Link from "next/link";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { getPublicPortfolioCategories } from "@/lib/content/portfolio";
import type { PublicSectionContent } from "@/lib/content/site";

type PortfolioCategoriesProps = {
  content?: PublicSectionContent;
};

type PortfolioCategory = Awaited<
  ReturnType<typeof getPublicPortfolioCategories>
>[number];

function getFeaturedCategories(categories: PortfolioCategory[]) {
  return categories
    .filter((item) => item.title.toLowerCase() !== "vintage")
    .slice(0, 4);
}

function PortfolioCategoryCard({ item }: { item: PortfolioCategory }) {
  return (
    <Link
      href={item.href}
      className="group relative min-h-[470px] w-full overflow-hidden bg-[#172016] text-white transition hover:-translate-y-1"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${item.image})` }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <FrameWatermark />

      <div className="relative z-20 flex h-full min-h-[470px] flex-col p-6">
        <p className="font-serif text-2xl text-white/55">{item.number}</p>

        <h2 className="font-serif text-4xl uppercase leading-none">
          {item.title}
        </h2>
        <div className="mt-4 h-px w-10 bg-white/50" />

        <div className="mt-auto">
          <p className="mb-5 text-xs leading-6 text-white/75">
            {item.description}
          </p>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
            Explore
          </span>
        </div>
      </div>
    </Link>
  );
}

export async function PortfolioCategories({
  content,
}: PortfolioCategoriesProps) {
  const categories = getFeaturedCategories(await getPublicPortfolioCategories());

  return (
    <section className="bg-[#f4efe4] px-6 py-16 md:px-14 md:py-20">
      <div className="mx-auto max-w-[1450px]">
        <p className="mb-10 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#242617]/65">
          {content?.eyebrow || "Explore our categories"}
        </p>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((item) => (
            <PortfolioCategoryCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
