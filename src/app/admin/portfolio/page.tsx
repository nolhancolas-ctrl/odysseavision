import Link from "next/link";
import { deletePortfolioItem } from "@/server/actions/portfolio";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "PUBLISHED"
      ? "bg-[#d9ead5] text-[#286235]"
      : status === "ARCHIVED"
        ? "bg-[#e5ded0] text-[#665642]"
        : "bg-[#f3dfb8] text-[#8a6314]";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${variant}`}
    >
      {status.toLowerCase()}
    </span>
  );
}

export default async function AdminPortfolioPage() {
  const [items, categories] = await Promise.all([
    db.portfolioItem.findMany({
      include: { category: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    db.portfolioCategory.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-[#11170f]/10 bg-white/42 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)] md:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a6792e]">
          Create & manage
        </p>

        <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <h1 className="font-serif text-5xl leading-none tracking-[-0.045em] md:text-7xl">
              Portfolio
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#11170f]/58">
              Manage photos, categories, featured images and portfolio display
              order. This is the first real editable module of the platform.
            </p>
          </div>

          <Link
            href="/admin/portfolio/new"
            className="rounded-full bg-[#071321] px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#142844]"
          >
            Add a photo
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-[#11170f]/10 bg-white/42 p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#11170f]/45">
            Total items
          </p>
          <p className="mt-3 font-serif text-5xl">{items.length}</p>
        </article>

        <article className="rounded-3xl border border-[#11170f]/10 bg-white/42 p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#11170f]/45">
            Published
          </p>
          <p className="mt-3 font-serif text-5xl">
            {items.filter((item) => item.status === "PUBLISHED").length}
          </p>
        </article>

        <article className="rounded-3xl border border-[#11170f]/10 bg-white/42 p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#11170f]/45">
            Categories
          </p>
          <p className="mt-3 font-serif text-5xl">{categories.length}</p>
        </article>
      </section>

      <section className="rounded-3xl border border-[#11170f]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-serif text-3xl">Photos</h2>

          <Link
            href="/admin/portfolio/new"
            className="rounded-full border border-[#11170f]/12 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#11170f]/55 transition hover:bg-[#071321] hover:text-[#f4efe4]"
          >
            Add photo
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#11170f]/15 p-10 text-center">
            <p className="font-serif text-3xl">No portfolio item yet</p>
            <p className="mt-3 text-sm text-[#11170f]/50">
              Seed the current website content or create your first photo.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 rounded-3xl border border-[#11170f]/8 bg-[#f4efe4]/45 p-3 md:grid-cols-[96px_1fr_auto] md:items-center"
              >
                <div
                  className="h-24 rounded-2xl bg-[#d8d0c2] bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.imageSrc})` }}
                />

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-2xl">{item.title}</h3>
                    <StatusBadge status={item.status} />
                    {item.featured ? (
                      <span className="rounded-full bg-[#071321] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#f4efe4]">
                        Featured
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-sm text-[#11170f]/50">
                    {item.category?.name ?? "No category"} · /{item.slug}
                  </p>

                  {item.description ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#11170f]/55">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Link
                    href={`/admin/portfolio/${item.id}`}
                    className="rounded-full border border-[#11170f]/12 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#11170f]/55 transition hover:bg-[#071321] hover:text-[#f4efe4]"
                  >
                    Edit
                  </Link>

                  <form action={deletePortfolioItem.bind(null, item.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-red-900/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-900/55 transition hover:bg-red-950 hover:text-[#f4efe4]"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
