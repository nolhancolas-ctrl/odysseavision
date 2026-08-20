import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StoryContent } from "@/components/stories/StoryContent";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type StoryPreviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatStoryDate(date: Date | null) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function StoryPreviewPage({
  params,
}: StoryPreviewPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { id } = await params;

  const story = await db.story.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!story) {
    notFound();
  }

  const description =
    story.excerpt || "";

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Stories" />

      <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-full bg-[#b88a3b] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#071008] shadow-lg">
        Private preview · {story.status}
      </div>

      <section className="relative min-h-[82svh] overflow-hidden bg-[#11180f] text-[#f4efe4]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${story.imageSrc})`,
          }}
        />

        <div className="absolute inset-0 bg-[#11180f]/65" />

        <FrameWatermark />

        <div className="relative z-20 mx-auto flex min-h-[82svh] max-w-5xl flex-col justify-end px-6 pb-20 pt-36 md:px-14">
          <Link
            href={`/admin/stories/${story.id}`}
            className="mb-10 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
          >
            Back to editor
          </Link>

          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            {story.category?.name || "Story"}
          </p>

          <h1 className="font-serif text-[clamp(3rem,7vw,7rem)] uppercase leading-[0.9] tracking-[-0.05em]">
            {story.title}
          </h1>

          <div className="my-7 h-px w-16 bg-white/45" />

          <p className="max-w-2xl text-sm leading-7 text-white/72">
            {description}
          </p>

          <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-white/45">
            {formatStoryDate(story.date)}

            {story.date && story.readTime
              ? " · "
              : ""}

            {story.readTime}
          </p>
        </div>
      </section>

      <article className="bg-[#f4efe4] px-6 py-16 md:px-14 md:py-24">
        <div className="mx-auto max-w-3xl">
          {description ? (
            <>
              <p className="font-serif text-3xl leading-[1.25] text-[#242617] md:text-4xl">
                {description}
              </p>

              <div className="my-10 h-px w-full bg-[#242617]/15" />
            </>
          ) : null}

          <StoryContent
            content={
              story.content ||
              description
            }
          />

          <Link
            href={`/admin/stories/${story.id}`}
            className="mt-12 inline-block bg-[#414832] px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#596044]"
          >
            Back to editor
          </Link>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
