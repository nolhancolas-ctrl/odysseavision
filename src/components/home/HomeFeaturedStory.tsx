import { ButtonLink } from "@/components/ui/ButtonLink";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { homeImages } from "@/data/home";
import type { PublicSectionContent } from "@/lib/content/site";

type HomeFeaturedStoryProps = {
  content?: PublicSectionContent;
};

function fileLabel(src: string, fallback: string) {
  return src.split("/").pop() || fallback;
}

export function HomeFeaturedStory({ content }: HomeFeaturedStoryProps) {
  const image = content?.images.photo || content?.imageSrc || homeImages.storyElephants.src;

  return (
    <section className="bg-[#f4efe4] px-6 py-20 md:px-14">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
        {image ? (
          <PhotoFrame
            src={image}
            label={fileLabel(image, homeImages.storyElephants.label)}
            className="h-[320px] w-full md:h-[420px]"
          />
        ) : null}

        <div>
          <SectionLabel>{content?.eyebrow || "Featured story"}</SectionLabel>

          <h2 className="font-serif text-5xl uppercase leading-[0.95] tracking-[-0.04em] md:text-6xl">
            {content?.title || "The Reality Behind Elephant Tours"}
          </h2>

          <div className="my-8 h-px w-16 bg-[#596044]" />

          <p className="max-w-md text-sm leading-7 text-[#333525]/75">
            {content?.description ||
              "A closer look at the elephant tourism industry, ethical encounters and how we can all make better choices for animals and local communities."}
          </p>

          <div className="mt-8">
            <ButtonLink
              href={content?.ctaHref || "/stories/the-reality-behind-elephant-tours"}
              variant="light"
              className="min-w-48"
            >
              {content?.ctaLabel || "Read the story"}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
