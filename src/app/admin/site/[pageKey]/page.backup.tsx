import Link from "next/link";
import { notFound } from "next/navigation";
import { resetPageSection, updatePageSection } from "@/server/actions/site";
import { db } from "@/lib/db";
import { getEditablePage } from "@/data/sitePages";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    pageKey: string;
  }>;
};

type SectionContent = {
  eyebrow?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  ctaLabel?: string;
  ctaHref?: string;
  body?: string;
};

function normalizeContent(value: unknown): SectionContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as SectionContent;
}

export default async function EditWebsitePage({ params }: PageProps) {
  const { pageKey } = await params;
  const page = getEditablePage(pageKey);

  if (!page) {
    notFound();
  }

  const savedSections = await db.pageContent.findMany({
    where: { pageKey },
    orderBy: [{ sectionKey: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Website page
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617] md:text-6xl">
            {page.title}
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-[#242617]/55 md:text-base md:leading-8">
            {page.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/site"
            className="rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#b88a3b]/60 hover:text-[#b88a3b]"
          >
            Back
          </Link>

          <Link
            href={page.href}
            className="rounded-full bg-[#071008] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008]"
          >
            View page
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Sections
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {page.sections.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Edited
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {savedSections.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Public path
          </p>
          <p className="mt-8 font-serif text-4xl text-[#242617]">
            {page.href}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {page.sections.map((section) => {
          const saved = savedSections.find(
            (item) => item.sectionKey === section.key,
          );

          const content = {
            ...section.defaults,
            ...normalizeContent(saved?.content),
          };

          return (
            <section
              key={section.key}
              className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-[#242617]/10 p-6 md:flex-row md:items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40">
                    {section.key}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl text-[#242617]">
                    {section.label}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#242617]/55">
                    {section.description}
                  </p>
                </div>

                {saved ? (
                  <form action={resetPageSection.bind(null, page.key, section.key)}>
                    <button
                      type="submit"
                      className="rounded-full border border-red-900/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800/40 hover:text-red-900"
                    >
                      Reset
                    </button>
                  </form>
                ) : null}
              </div>

              <form
                action={updatePageSection.bind(null, page.key, section.key)}
                className="grid gap-5 p-6 lg:grid-cols-2"
              >
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                    Eyebrow
                  </label>
                  <input
                    name="eyebrow"
                    defaultValue={content.eyebrow ?? ""}
                    className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                    Title
                  </label>
                  <input
                    name="title"
                    defaultValue={content.title ?? ""}
                    className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={content.description ?? ""}
                    className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm leading-6 text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                    Body
                  </label>
                  <textarea
                    name="body"
                    rows={6}
                    defaultValue={content.body ?? ""}
                    className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm leading-7 text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                    Image path
                  </label>
                  <input
                    name="imageSrc"
                    defaultValue={content.imageSrc ?? ""}
                    className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                    placeholder="/images/..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                    CTA label
                  </label>
                  <input
                    name="ctaLabel"
                    defaultValue={content.ctaLabel ?? ""}
                    className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                    CTA link
                  </label>
                  <input
                    name="ctaHref"
                    defaultValue={content.ctaHref ?? ""}
                    className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                    placeholder="/contact"
                  />
                </div>

                <div className="flex items-end justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-[#071008] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008]"
                  >
                    Save section
                  </button>
                </div>
              </form>
            </section>
          );
        })}
      </div>
    </div>
  );
}
