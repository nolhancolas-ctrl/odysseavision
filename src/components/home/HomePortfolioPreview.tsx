import Link from "next/link";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  getPublicPortfolioCategories,
  type PublicPortfolioCategory,
} from "@/lib/content/portfolio";

function PortfolioPreviewCard({
  item,
}: {
  item: PublicPortfolioCategory;
}) {
  return (
    <Link
      href={item.href}
      className="group flex min-h-[500px] w-full flex-col bg-[#30331f] p-5 transition hover:bg-[#3b3e27] md:w-[292px] md:shrink-0 xl:w-[302px]"
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

export async function HomePortfolioPreview() {
  const portfolioCategories = await getPublicPortfolioCategories();

  return (
    <section className="overflow-hidden bg-[#11190f] px-6 py-20 text-[#f4efe4] md:px-14 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <SectionLabel dark>Portfolio</SectionLabel>
          <h2 className="font-serif text-5xl uppercase tracking-[-0.04em] md:text-6xl">
            Explore our world
          </h2>
        </div>

        {/* Mobile: normal stacked/grid display */}
        <div className="grid gap-6 md:hidden">
          {portfolioCategories.map((item) => (
            <PortfolioPreviewCard key={item.title} item={item} />
          ))}
        </div>

        {/* Medium and desktop: seamless carousel */}
        <div className="relative hidden overflow-hidden md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#11190f] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#11190f] to-transparent" />

          <div className="home-portfolio-marquee flex w-max">
            <div className="flex shrink-0 gap-6 pr-6">
              {portfolioCategories.map((item) => (
                <PortfolioPreviewCard
                  key={`first-${item.title}`}
                  item={item}
                />
              ))}
            </div>

            <div className="flex shrink-0 gap-6 pr-6" aria-hidden="true">
              {portfolioCategories.map((item) => (
                <PortfolioPreviewCard
                  key={`second-${item.title}`}
                  item={item}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
