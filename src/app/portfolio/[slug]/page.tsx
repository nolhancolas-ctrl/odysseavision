import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WatermarkedPhotoFrame } from "@/components/ui/WatermarkedPhotoFrame";
import {
  getPublicPortfolioCategories,
  getPublicPortfolioItems,
} from "@/lib/content/portfolio";

export const dynamic = "force-dynamic";

type PortfolioCategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getSlugFromHref(href: string) {
  return href.split("/").filter(Boolean).at(-1) ?? "";
}

function getGalleryAspectClass(index: number) {
  const variants = [
    "aspect-[4/5]",
    "aspect-[1.35]",
    "aspect-square",
    "aspect-[3/2]",
    "aspect-[5/6]",
    "aspect-[1.18]",
  ];

  return variants[index % variants.length];
}

export async function generateMetadata({
  params,
}: PortfolioCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getPublicPortfolioCategories();
  const category = categories.find((item) => getSlugFromHref(item.href) === slug);

  if (!category) {
    return {
      title: "Portfolio gallery · Odyssea Vision",
    };
  }

  return {
    title: `${category.title} · Odyssea Vision`,
    description: category.description,
  };
}

export default async function PortfolioCategoryPage({
  params,
}: PortfolioCategoryPageProps) {
  const { slug } = await params;

  const [categories, items] = await Promise.all([
    getPublicPortfolioCategories(),
    getPublicPortfolioItems(),
  ]);

  const category = categories.find((item) => getSlugFromHref(item.href) === slug);

  if (!category) {
    notFound();
  }

  const categoryItems = items.filter((item) => item.categorySlug === slug);

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Portfolio" />

      <section className="relative min-h-[78svh] overflow-hidden bg-[#11190f] text-[#f4efe4]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${category.image})` }}
        />
        <div className="absolute inset-0 bg-[#11190f]/68" />

        <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-end px-6 pb-20 pt-36 md:px-14">
          <Link
            href="/portfolio"
            className="mb-10 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
          >
            Back to portfolio
          </Link>

          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            Gallery {category.number}
          </p>

          <h1 className="font-serif text-[clamp(3.4rem,8vw,8rem)] uppercase leading-[0.86] tracking-[-0.06em]">
            {category.title}
          </h1>

          <div className="my-7 h-px w-16 bg-white/45" />

          <p className="max-w-2xl text-sm leading-7 text-white/72">
            {category.description}
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-14 md:py-20">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-[#242617]/10 pb-8 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
                Photo gallery
              </p>
              <h2 className="mt-3 font-serif text-5xl uppercase leading-none tracking-[-0.04em]">
                {category.title}
              </h2>
            </div>

            <p className="text-xs uppercase tracking-[0.16em] text-[#242617]/45">
              {categoryItems.length}{" "}
              {categoryItems.length === 1 ? "photo" : "photos"}
            </p>
          </div>

          {categoryItems.length > 0 ? (
            <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
              {categoryItems.map((item, index) => (
                <figure
                  key={item.id}
                  className="mb-5 break-inside-avoid overflow-hidden bg-[#d8cdb8]"
                >
                  <WatermarkedPhotoFrame
                    src={item.imageSrc}
                    alt={item.title}
                    className={getGalleryAspectClass(index)}
                    imageClassName="transition duration-700 group-hover:scale-[1.025]"
                  />
                </figure>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-10 text-center">
              <p className="text-sm text-[#242617]/55">
                No published photos have been added to this gallery yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
