import Link from "next/link";
import { deletePortfolioItem } from "@/server/actions/portfolio";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const [items, categories] = await Promise.all([
    db.portfolioItem.findMany({
      include: { category: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    db.portfolioCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);

  const publishedCount = items.filter(
    (item) => item.status === "PUBLISHED",
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Create & manage
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617] md:text-6xl">
            Portfolio
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-[#242617]/55 md:text-base md:leading-8">
            Manage photos, categories, featured images and portfolio display
            order. This is the first real editable module of the platform.
          </p>
        </div>

        <Link
          href="/admin/portfolio/new"
          className="rounded-full bg-[#071008] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008]"
        >
          Add a photo
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Total items
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {items.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Published
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {publishedCount}
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
            Photos
          </h2>

          <Link
            href="/admin/portfolio/new"
            className="rounded-full border border-[#242617]/15 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/50 transition hover:border-[#b88a3b]/60 hover:text-[#b88a3b]"
          >
            Add photo
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-sm text-[#242617]/55">
            No portfolio items yet. Create your first photo.
          </div>
        ) : (
          <div className="divide-y divide-[#242617]/10">
            {items.map((item) => (
              <article
                key={item.id}
                className="grid gap-5 p-5 md:grid-cols-[120px_1fr_auto]"
              >
                <div
                  className="aspect-[4/3] rounded-2xl bg-[#e8dfcf] bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.imageSrc})` }}
                />

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/50">
                      {item.status}
                    </span>

                    {item.featured ? (
                      <span className="rounded-full border border-[#b88a3b]/30 bg-[#b88a3b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b88a3b]">
                        Featured
                      </span>
                    ) : null}

                    {item.category ? (
                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        {item.category.name}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="font-serif text-3xl uppercase leading-none text-[#242617]">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-xs text-[#242617]/35">
                    /portfolio/{item.slug}
                  </p>

                  {item.description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#242617]/55">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-start gap-3 md:justify-end">
                  <Link
                    href={`/admin/portfolio/${item.id}`}
                    className="rounded-full border border-[#242617]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
                  >
                    Edit
                  </Link>

                  <form action={deletePortfolioItem.bind(null, item.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-red-900/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800/40 hover:text-red-900"
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
