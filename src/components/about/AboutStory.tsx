import { ButtonLink } from "@/components/ui/ButtonLink";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { aboutImages } from "@/data/about";
import type { PublicSectionContent } from "@/lib/content/site";

type AboutStoryProps = {
  content?: PublicSectionContent;
};

function fileLabel(src: string, fallback: string) {
  return src.split("/").pop() || fallback;
}

function shouldShowWatermark(
  content: PublicSectionContent | undefined,
  key: string,
  defaultValue = true,
) {
  return content?.imageWatermarks?.[key] ?? defaultValue;
}

const defaultBody = `Morgane picked up a camera at 16 and instantly fell in love with the way it could freeze a feeling, a place, a moment in time.

She shared that passion with Andrew, who is drawn to film and the beauty of real, unfiltered moments.

Travel brought us together and created the perfect duo: her eye for stills, his vision for motion.

Today, we roam the world together, capturing landscapes, underwater life, wildlife and the human stories that make each place unique.`;

export function AboutStory({ content }: AboutStoryProps) {
  const story01 = content?.images.story01 || aboutImages.story01.src;
  const story02 = content?.images.story02 || aboutImages.story02.src;
  const story03 = content?.images.story03 || aboutImages.story03.src;
  const story04 = content?.images.story04 || aboutImages.story04.src;
  const paragraphs = (content?.body || defaultBody).split("\n").filter(Boolean);

  return (
    <section className="bg-[#f4efe4] px-6 py-20 md:px-14 md:py-24">
      <div className="mx-auto grid max-w-[1350px] items-center gap-12 lg:grid-cols-[0.85fr_1.25fr]">
        <div>
          <SectionLabel>{content?.eyebrow || "Our story"}</SectionLabel>

          <h2 className="font-serif text-5xl uppercase leading-[0.95] tracking-[-0.04em] md:text-6xl">
            {content?.title || "How our adventure began"}
          </h2>

          <div className="my-8 h-px w-16 bg-[#596044]" />

          <div className="space-y-5 text-sm leading-8 text-[#333525]/75 md:text-[15px]">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8">
            <ButtonLink
              href={content?.ctaHref || "/portfolio"}
              variant="light"
              className="min-w-60"
            >
              {content?.ctaLabel || "Our journey in pictures"}
            </ButtonLink>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {story01 ? (
            <PhotoFrame
              src={story01}
              label={fileLabel(story01, aboutImages.story01.label)}
              className="h-[260px] w-full sm:col-span-2 md:h-[330px]"
              showWatermark={shouldShowWatermark(content, "story01")}
            />
          ) : null}

          {story02 ? (
            <PhotoFrame
              src={story02}
              label={fileLabel(story02, aboutImages.story02.label)}
              className="h-[220px] w-full"
              showWatermark={shouldShowWatermark(content, "story02")}
            />
          ) : null}

          {story03 ? (
            <PhotoFrame
              src={story03}
              label={fileLabel(story03, aboutImages.story03.label)}
              className="h-[220px] w-full"
              showWatermark={shouldShowWatermark(content, "story03")}
            />
          ) : null}

          {story04 ? (
            <PhotoFrame
              src={story04}
              label={fileLabel(story04, aboutImages.story04.label)}
              className="h-[220px] w-full sm:col-span-2 md:h-[270px]"
              showWatermark={shouldShowWatermark(content, "story04")}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
