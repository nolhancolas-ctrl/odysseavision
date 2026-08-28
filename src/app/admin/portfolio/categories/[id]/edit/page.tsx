import Link from "next/link";
import { notFound } from "next/navigation";
import { PortfolioCategoryForm } from "@/components/admin/portfolio/PortfolioCategoryForm";
import { PortfolioGalleryBulkUploader } from "@/components/admin/portfolio/PortfolioGalleryBulkUploader";
import { PortfolioPhotoSorter } from "@/components/admin/portfolio/PortfolioPhotoSorter";
import { db } from "@/lib/db";
import { updatePortfolioCategory } from "@/server/actions/portfolio-categories";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function EditPortfolioCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const imported = getSingleParam(query, "imported");
  const error = getSingleParam(query, "error");

  const category = await db.portfolioCategory.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const returnTo = `/admin/portfolio/categories/${category.id}/edit`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
            Portfolio gallery
          </p>

          <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.05em] text-[#242617] md:text-6xl">
            Edit {category.name}
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#242617]/50">
            Edit the category details, add photos and manage the gallery content
            from one place.
          </p>

          <p className="mt-2 text-xs text-[#242617]/35">
            {category._count.items} photos · /portfolio/{category.slug}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/portfolio/${category.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#242617]/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b] hover:text-[#242617]"
          >
            View public
          </Link>

          <Link
            href="/admin/portfolio"
            className="rounded-full border border-[#242617]/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b] hover:text-[#242617]"
          >
            Back
          </Link>
        </div>
      </header>

      {imported ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-800">
          {imported} photos imported successfully.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          Error: {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr] xl:items-start">
        <PortfolioCategoryForm
          category={category}
          action={updatePortfolioCategory.bind(null, category.id)}
          submitLabel="Save category"
          returnTo={returnTo}
        />

        <PortfolioGalleryBulkUploader
          existingImageUrls={category.items.map((item) => item.imageSrc)}
          categories={[
            {
              id: category.id,
              name: category.name,
              slug: category.slug,
            },
          ]}
          defaultCategoryId={category.id}
          lockedCategory
          returnTo={returnTo}
          submitLabel="Add photos"
        />
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_22px_70px_rgba(20,20,10,0.07)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#242617]/10 px-6 py-5 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
              Gallery content
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#242617]">
              Photos
            </h2>
          </div>

          <p className="text-xs uppercase tracking-[0.16em] text-[#242617]/40">
            {category.items.length} items
          </p>
        </div>

        {category.items.length === 0 ? (
          <div className="p-8 text-sm text-[#242617]/50">
            No photos in this category yet. Upload photos above to start filling
            this gallery.
          </div>
        ) : (
          <PortfolioPhotoSorter
            categoryId={category.id}
            returnTo={returnTo}
            initialItems={category.items.map((item) => ({
              id: item.id,
              title: item.title,
              imageSrc: item.imageSrc,
              status: item.status,
              featured: item.featured,
              watermark: item.watermark,
              order: item.order,
            }))}
          />
        )}
      </section>
    </div>
  );
}
