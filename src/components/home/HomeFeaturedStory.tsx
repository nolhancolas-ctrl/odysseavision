import { ButtonLink } from "@/components/ui/ButtonLink";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { homeImages } from "@/data/home";
import type { PublicSectionContent } from "@/lib/content/site";

type HomeFeaturedStoryProps = {
  content?: PublicSectionContent;
  storyHref?: string;
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

export function HomeFeaturedStory({
  content,
  storyHref = "/stories",
}: HomeFeaturedStoryProps) {
  const image = content?.images.photo ?? content?.imageSrc ?? homeImages.storyElephants.src;

  return (
    <section className="bg-[#f4efe4] px-5 py-16 sm:px-6 md:px-14 md:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 md:gap-12 lg:grid-cols-[1.25fr_1fr]">
        {image ? (
          <PhotoFrame
            src={image}
            label={fileLabel(image, homeImages.storyElephants.label)}
            className="h-[280px] w-full sm:h-[340px] md:h-[420px]"
            showWatermark={shouldShowWatermark(content, "photo")}
          />
        ) : null}

        <div>
          <SectionLabel>{content?.eyebrow || "Featured story"}</SectionLabel>

          <h2 className="font-serif text-[clamp(2.7rem,12vw,3.75rem)] uppercase leading-[0.94] tracking-[-0.04em]">
            {content?.title || "The Reality Behind Elephant Tours"}
          </h2>

          <div className="my-8 h-px w-16 bg-[#596044]" />

          <p className="max-w-md text-sm leading-7 text-[#333525]/75">
            {content?.description ||
              "A closer look at the elephant tourism industry, ethical encounters and how we can all make better choices for animals and local communities."}
          </p>

          <div className="mt-8">
            <ButtonLink
              href={storyHref}
              variant="light"
              className="w-full min-w-0 sm:w-auto sm:min-w-48"
            >
              {content?.ctaLabel || "Read the story"}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
