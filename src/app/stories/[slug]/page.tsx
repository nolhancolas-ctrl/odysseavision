import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicStoryBySlug } from "@/lib/content/stories";

export const dynamic = "force-dynamic";

type StoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = await getPublicStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Stories" />

      <section className="relative min-h-[82svh] overflow-hidden bg-[#11180f] text-[#f4efe4]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${story.imageSrc})` }}
        />
        <div className="absolute inset-0 bg-[#11180f]/65" />

        <div className="relative z-10 mx-auto flex min-h-[82svh] max-w-5xl flex-col justify-end px-6 pb-20 pt-36 md:px-14">
          <Link
            href="/stories"
            className="mb-10 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
          >
            Back to stories
          </Link>

          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            {story.category}
          </p>

          <h1 className="font-serif text-[clamp(3rem,7vw,7rem)] uppercase leading-[0.9] tracking-[-0.05em]">
            {story.title}
          </h1>

          <div className="my-7 h-px w-16 bg-white/45" />

          <p className="max-w-2xl text-sm leading-7 text-white/72">
            {story.description}
          </p>

          <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-white/45">
            {story.displayDate}
            {story.displayDate && story.readTime ? " · " : ""}
            {story.readTime}
          </p>
        </div>
      </section>

      <article className="bg-[#f4efe4] px-6 py-16 md:px-14 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="font-serif text-3xl leading-[1.25] text-[#242617] md:text-4xl">
            {story.description}
          </p>

          <div className="my-10 h-px w-full bg-[#242617]/15" />

          <div className="space-y-6 text-sm leading-8 text-[#242617]/68">
            {(story.content || story.description)
              .split("\n")
              .filter(Boolean)
              .map((paragraph: string) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>

          <Link
            href="/stories"
            className="mt-12 inline-block bg-[#414832] px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#596044]"
          >
            View all stories
          </Link>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
