import Link from "next/link";
import { notFound } from "next/navigation";
import { PortfolioGalleryBulkUploader } from "@/components/admin/portfolio/PortfolioGalleryBulkUploader";
import { db } from "@/lib/db";
import { deletePortfolioGalleryPhoto } from "@/server/actions/portfolio-gallery-photos";

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

export default async function PortfolioCategoryPhotosPage({
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
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
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

  const returnTo = `/admin/portfolio/categories/${category.id}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
            Portfolio gallery
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.05em] text-[#242617]">
            {category.name}
          </h1>
          <p className="mt-4 text-sm text-[#242617]/50">
            {category._count.items} photos · /portfolio/{category.slug}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/portfolio/${category.slug}`}
            target="_blank"
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

      <section>
        <PortfolioGalleryBulkUploader
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

      <section className="rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_22px_70px_rgba(20,20,10,0.07)]">
        <div className="flex items-center justify-between border-b border-[#242617]/10 px-6 py-5">
          <h2 className="font-serif text-3xl tracking-[-0.04em] text-[#242617]">
            Photos
          </h2>
          <p className="text-xs uppercase tracking-[0.16em] text-[#242617]/40">
            {category.items.length} items
          </p>
        </div>

        {category.items.length === 0 ? (
          <div className="p-8 text-sm text-[#242617]/50">
            No photos in this category yet.
          </div>
        ) : (
          <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-3">
            {category.items.map((item) => (
              <article
                key={item.id}
                className="border-b border-r border-[#242617]/8 p-5"
              >
                <div
                  className="aspect-[4/3] rounded-2xl bg-[#e8dfcf] bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.imageSrc})` }}
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                    {item.status}
                  </span>
                  {item.featured ? (
                    <span className="rounded-full border border-[#b88a3b]/25 bg-[#b88a3b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b88a3b]">
                      Featured
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 font-serif text-3xl uppercase leading-none tracking-[-0.04em] text-[#242617]">
                  {item.title}
                </h3>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/portfolio/${item.id}`}
                    className="rounded-full border border-[#242617]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
                  >
                    Edit
                  </Link>

                  <form action={deletePortfolioGalleryPhoto.bind(null, item.id)}>
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-full border border-red-900/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800/40 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
