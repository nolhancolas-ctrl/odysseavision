import Link from "next/link";
import { db } from "@/lib/db";
import { editablePages } from "@/data/sitePages";

export const dynamic = "force-dynamic";

export default async function AdminSitePage() {
  const contents = await db.pageContent.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });

  const lastUpdate = contents[0]?.updatedAt;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Website & design
          </p>

          <h1 className="mt-3 font-serif text-5xl tracking-[-0.04em] text-[#242617] md:text-6xl">
            Website pages
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-[#242617]/55 md:text-base md:leading-8">
            Edit page sections, texts, image paths and call-to-action content
            for the public website.
          </p>
        </div>

        <Link
          href="/admin/site/home"
          className="rounded-full bg-[#071008] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008]"
        >
          Edit home
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex items-center justify-between gap-5 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
              Pages
            </p>
            <p className="mt-2 text-sm text-[#242617]/45">
              Editable public website pages
            </p>
          </div>

          <p className="font-serif text-6xl leading-none text-[#242617]">
            {editablePages.length}
          </p>
        </div>

        <div className="flex items-center justify-between gap-5 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
              Last update
            </p>
            <p className="mt-2 text-sm text-[#242617]/45">
              Latest saved website section
            </p>
          </div>

          <p className="font-serif text-4xl leading-none text-[#242617]">
            {lastUpdate ? lastUpdate.toISOString().slice(0, 10) : "—"}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="flex items-center justify-between gap-5 border-b border-[#242617]/10 p-6">
          <h2 className="font-serif text-3xl text-[#242617]">
            Pages
          </h2>
        </div>

        <div className="divide-y divide-[#242617]/10">
          {editablePages.map((page) => {
            const pageContents = contents.filter(
              (content) => content.pageKey === page.key,
            );

            const lastEdited = pageContents[0]?.updatedAt;

            return (
              <article
                key={page.key}
                className="grid gap-5 p-5 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/50">
                      {page.sections.length} sections
                    </span>

                    <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                      {page.href}
                    </span>
                  </div>

                  <h2 className="font-serif text-3xl uppercase leading-none text-[#242617]">
                    {page.title}
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#242617]/55">
                    {page.description}
                  </p>

                  <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#242617]/35">
                    Last edited{" "}
                    {lastEdited ? lastEdited.toISOString().slice(0, 10) : "never"}
                  </p>
                </div>

                <div className="flex items-start gap-3 md:justify-end">
                  <Link
                    href={`/admin/site/${page.key}`}
                    className="rounded-full border border-[#242617]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
                  >
                    Edit
                  </Link>

                  <Link
                    href={page.href}
                    className="rounded-full border border-[#242617]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
                  >
                    View
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
