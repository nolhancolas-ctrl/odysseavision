import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { homeImages } from "@/data/home";
import type { PublicSectionContent } from "@/lib/content/site";

type HomeIntroProps = {
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

export function HomeIntro({ content }: HomeIntroProps) {
  const image = content?.images.photo || content?.imageSrc || homeImages.introDuo.src;

  return (
    <section className="bg-[#f4efe4] px-6 py-20 md:px-14 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.4fr]">
        <div>
          <SectionLabel>{content?.eyebrow || "Welcome"}</SectionLabel>

          <h2 className="font-serif text-5xl uppercase leading-[0.95] tracking-[-0.04em] md:text-6xl lg:text-7xl">
            {content?.title || "Visual Storytellers & Ocean Lovers"}
          </h2>

          <div className="my-8 h-px w-16 bg-[#596044]" />

          <p className="max-w-md text-sm leading-8 text-[#333525]/75 md:text-base">
            {content?.description ||
              "We travel the world in search of wild places, genuine encounters and stories that inspire. Through photography and film, we aim to share the beauty of our planet, raise awareness about its fragility and remind us all why it’s worth protecting."}
          </p>

          <a
            href={content?.ctaHref || "/about"}
            className="mt-8 inline-flex text-[11px] font-semibold uppercase tracking-[0.18em] text-[#333525] underline underline-offset-8"
          >
            {content?.ctaLabel || "Discover our story"}
          </a>
        </div>

        {image ? (
          <PhotoFrame
            src={image}
            label={fileLabel(image, homeImages.introDuo.label)}
            imagePosition="right center"
            className="h-[360px] w-full md:h-[460px] lg:h-[560px]"
            showWatermark={shouldShowWatermark(content, "photo")}
          />
        ) : null}
      </div>
    </section>
  );
}
