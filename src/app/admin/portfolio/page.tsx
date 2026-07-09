import Link from "next/link";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { db } from "@/lib/db";
import { deletePortfolioCategory } from "@/server/actions/portfolio-categories";

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

export default async function AdminPortfolioPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const error = getSingleParam(params, "error");

  const [categories, totalItems, publishedItems] = await Promise.all([
    db.portfolioCategory.findMany({
      include: {
        _count: {
          select: {
            items: true,
          },
        },
        items: {
          orderBy: [
            { featured: "desc" },
            { order: "asc" },
            { createdAt: "desc" },
          ],
          take: 1,
        },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    db.portfolioItem.count(),
    db.portfolioItem.count({
      where: {
        status: "PUBLISHED",
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Create & manage
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617] md:text-6xl">
            Portfolio
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-[#242617]/55 md:text-base md:leading-8">
            Manage portfolio galleries, categories, photos and publication
            status from one clean workspace.
          </p>
        </div>

        <Link
          href="/admin/portfolio/categories/new"
          className="rounded-full bg-[#071008] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008]"
        >
          Add category
        </Link>
      </header>

      {error === "category-has-photos" ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          This category still contains photos. Delete its photos before deleting
          the category.
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Total photos
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {totalItems}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Published
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {publishedItems}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Categories
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {categories.length}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="flex items-center justify-between gap-5 border-b border-[#242617]/10 p-6">
          <h2 className="font-serif text-3xl text-[#242617]">
            Categories
          </h2>

          <Link
            href="/admin/portfolio/categories/new"
            className="rounded-full border border-[#242617]/15 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/50 transition hover:border-[#b88a3b]/60 hover:text-[#b88a3b]"
          >
            Add category
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="p-8 text-sm text-[#242617]/55">
            No portfolio categories yet. Create your first gallery category.
          </div>
        ) : (
          <div className="divide-y divide-[#242617]/10">
            {categories.map((category) => {
              const cover = category.items[0];

              return (
                <article
                  key={category.id}
                  className="grid gap-5 p-5 md:grid-cols-[150px_1fr_auto]"
                >
                  <div
                    className="aspect-[4/3] rounded-2xl bg-[#e8dfcf] bg-cover bg-center"
                    style={{
                      backgroundImage: cover
                        ? `url(${cover.imageSrc})`
                        : undefined,
                    }}
                  />

                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/50">
                        Gallery
                      </span>

                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        {category._count.items} photos
                      </span>

                      {cover ? (
                        <span className="rounded-full border border-[#b88a3b]/30 bg-[#b88a3b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b88a3b]">
                          Cover ready
                        </span>
                      ) : (
                        <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/35">
                          Empty
                        </span>
                      )}

                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        Order {category.order}
                      </span>
                    </div>

                    <h2 className="font-serif text-3xl uppercase leading-none text-[#242617]">
                      {category.name}
                    </h2>

                    <p className="mt-2 text-xs text-[#242617]/35">
                      /portfolio/{category.slug}
                    </p>

                    <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#242617]/35">
                      {category._count.items > 0
                        ? `${category._count.items} photos in this gallery`
                        : "No content yet"}
                    </p>
                  </div>

                  <div className="flex flex-col items-stretch gap-2 md:items-end">
                    <Link
                      href={`/portfolio/${category.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full rounded-full border border-[#242617]/15 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b] md:w-32"
                    >
                      Preview
                    </Link>

                    <Link
                      href={`/admin/portfolio/categories/${category.id}/edit`}
                      className="w-full rounded-full border border-[#242617]/15 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b] md:w-32"
                    >
                      Edit
                    </Link>

                    <form action={deletePortfolioCategory.bind(null, category.id)}>
                      <input type="hidden" name="returnTo" value="/admin/portfolio" />
                      <ConfirmSubmitButton
                        className="w-full rounded-full border border-red-900/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800/40 hover:text-red-900 md:w-32"
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>

                    <Link
                      href={`/admin/portfolio/categories/${category.id}`}
                      className="w-full rounded-full bg-[#071008] px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008] md:w-32"
                    >
                      Add content
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
