import Link from "next/link";
import { notFound } from "next/navigation";
import { FloatingBackButton } from "@/components/admin/site/FloatingBackButton";
import { PageSectionForm } from "@/components/admin/site/PageSectionForm";
import { FeaturedFilmSelectorForm } from "@/components/admin/site/FeaturedFilmSelectorForm";
import { VideosVimeoStatus } from "@/components/admin/site/VideosVimeoStatus";
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
  ctaLabel?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  body?: string;
  imageSrc?: string;
  images?: Record<string, string>;
  drawings?: Record<string, string>;
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
      <FloatingBackButton href="/admin/site" />
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
            className="inline-flex h-[60px] cursor-pointer items-center justify-center rounded-full border border-[#242617]/15 px-7 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#b88a3b]/60 hover:text-[#b88a3b]"
          >
            Back
          </Link>

          <Link
            href={page.href}
            className="inline-flex h-[60px] cursor-pointer items-center justify-center rounded-full bg-[#071008] px-8 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008]"
          >
            View page
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex items-center justify-between gap-5 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
              Sections
            </p>
            <p className="mt-2 text-sm text-[#242617]/45">
              Editable blocks available on this page
            </p>
          </div>

          <p className="font-serif text-6xl leading-none text-[#242617]">
            {page.sections.length}
          </p>
        </div>

        <Link
          href={page.href}
          className="group flex cursor-pointer items-center justify-between gap-5 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)] transition hover:-translate-y-1 hover:bg-white/65"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
              Public path
            </p>
            <p className="mt-2 text-sm text-[#242617]/45">
              Open the published page
            </p>
          </div>

          <p className="font-serif text-6xl leading-none text-[#242617] transition group-hover:text-[#b88a3b]">
            {page.href}
          </p>
        </Link>
      </div>

      {page.key === "videos" ? <VideosVimeoStatus /> : null}

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
            <div key={section.key}>
              {page.key === "videos" && section.key === "featured-film" ? (
                <FeaturedFilmSelectorForm />
              ) : (
                <PageSectionForm
              key={section.key}
              section={section}
              content={content}
              hasSavedContent={Boolean(saved)}
              updateAction={updatePageSection.bind(null, page.key, section.key)}
              resetAction={resetPageSection.bind(null, page.key, section.key)}
            />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
