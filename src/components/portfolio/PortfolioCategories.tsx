import Link from "next/link";
import { getPublicPortfolioCategories } from "@/lib/content/portfolio";
import type { PublicSectionContent } from "@/lib/content/site";

type PortfolioCategoriesProps = {
  content?: PublicSectionContent;
};

function PortfolioCategoryCard({
  item,
}: {
  item: Awaited<ReturnType<typeof getPublicPortfolioCategories>>[number];
}) {
  return (
    <Link
      href={item.href}
      className="group relative min-h-[470px] w-full overflow-hidden bg-[#172016] text-white md:w-[292px] md:shrink-0 xl:w-[302px]"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${item.image})` }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative flex h-full min-h-[470px] flex-col p-6">
        <p className="font-serif text-2xl text-white/55">{item.number}</p>

        <h2 className="font-serif text-4xl uppercase">{item.title}</h2>
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
  const categories = await getPublicPortfolioCategories();

  return (
    <section className="overflow-hidden bg-[#f4efe4] px-6 py-16 md:px-14 md:py-20">
      <div className="mx-auto max-w-[1450px]">
        <p className="mb-10 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#242617]/65">
          {content?.eyebrow || "Explore our categories"}
        </p>

        <div className="grid gap-5 md:hidden">
          {categories.map((item) => (
            <PortfolioCategoryCard key={item.title} item={item} />
          ))}
        </div>

        <div className="relative hidden overflow-hidden md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f4efe4] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f4efe4] to-transparent" />

          <div className="portfolio-categories-marquee flex w-max">
            <div className="flex shrink-0 gap-6 pr-6">
              {categories.map((item) => (
                <PortfolioCategoryCard key={`first-${item.title}`} item={item} />
              ))}
            </div>

            <div className="flex shrink-0 gap-6 pr-6" aria-hidden="true">
              {categories.map((item) => (
                <PortfolioCategoryCard key={`second-${item.title}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
