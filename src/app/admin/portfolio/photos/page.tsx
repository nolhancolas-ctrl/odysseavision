import Link from "next/link";
import { PortfolioGalleryBulkUploader } from "@/components/admin/portfolio/PortfolioGalleryBulkUploader";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = {
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

export default async function AdminPortfolioPhotosPage({
  searchParams,
}: PageProps) {
  const params = searchParams ? await searchParams : {};
  const imported = getSingleParam(params, "imported");
  const error = getSingleParam(params, "error");

  const categories = await db.portfolioCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
            Portfolio galleries
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.05em] text-[#242617]">
            Add photos
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#242617]/55">
            Upload several photos at once and assign them to an existing
            portfolio gallery.
          </p>
        </div>

        <Link
          href="/admin/portfolio"
          className="w-fit rounded-full border border-[#242617]/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b] hover:text-[#242617]"
        >
          Back to portfolio
        </Link>
      </header>

      {imported ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-800">
          {imported} photos imported successfully.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          Import failed: {error}
        </div>
      ) : null}

      {categories.length > 0 ? (
        <PortfolioGalleryBulkUploader categories={categories} />
      ) : (
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-8 text-center text-sm text-[#242617]/55">
          Create at least one portfolio category before uploading gallery
          photos.
        </div>
      )}
    </div>
  );
}
