import { ButtonLink } from "@/components/ui/ButtonLink";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { homeImages } from "@/data/home";
import type { PublicSectionContent } from "@/lib/content/site";

type HomeFinalCTAProps = {
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

export function HomeFinalCTA({ content }: HomeFinalCTAProps) {
  const leftPhoto = content?.images.leftPhoto || homeImages.ctaSailboat.src;
  const rightPhoto = content?.images.rightPhoto || homeImages.ctaOceanCliff.src;
  const stamp = content?.images.stamp || "/images/home/cta_stamp_01.png";

  return (
    <section className="relative overflow-hidden bg-[#10190f] text-[#f4efe4]">
      <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15" />

      <div className="relative mx-auto flex min-h-[250px] max-w-[1500px] items-center justify-center px-6 py-12 md:min-h-[280px] md:px-14 lg:py-10">
        <div className="pointer-events-none absolute left-0 top-1/2 hidden h-[230px] w-[350px] -translate-y-1/2 lg:block xl:left-6">
          {leftPhoto ? (
            <PhotoFrame
              src={leftPhoto}
              label={fileLabel(leftPhoto, homeImages.ctaSailboat.label)}
              className="absolute left-8 top-1/2 h-[285px] w-[245px] -translate-y-1/2 rotate-[-4deg] border-[5px] border-white/80 shadow-xl"
              showWatermark={shouldShowWatermark(content, "leftPhoto")}
            />
          ) : null}

          {stamp ? (
            <img
              src={stamp}
              alt=""
              className="absolute left-[235px] top-[108px] w-[178px] rotate-[-8deg] opacity-95"
            />
          ) : null}

          <div className="absolute left-[180px] top-[92px] h-px w-20 rotate-[-8deg] bg-[#f4efe4]/15" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl uppercase leading-none tracking-[-0.04em] md:text-5xl lg:text-6xl">
            {content?.title || "Let’s tell your story"}
          </h2>

          <p className="mt-2 font-serif text-2xl italic leading-none text-[#f4efe4]/75 md:text-3xl">
            {content?.description || "or simply say hello."}
          </p>

          <div className="mx-auto mt-4 h-px w-12 bg-[#f4efe4]/30" />

          <div className="mt-6">
            <ButtonLink
              href={content?.ctaHref || "/contact"}
              className="min-w-72 px-10 py-3 text-[10px]"
            >
              {content?.ctaLabel || "Contact us"}
            </ButtonLink>
          </div>
        </div>

        <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[230px] w-[390px] -translate-y-1/2 lg:block xl:right-6">
          <div className="absolute left-[30px] top-[58px] max-w-[155px] -rotate-6 text-left font-hand text-xl leading-8 text-[#f4efe4]/62">
            {content?.drawings.handwritten || "home is where the anchor drops"}
          </div>

          {rightPhoto ? (
            <PhotoFrame
              src={rightPhoto}
              label={fileLabel(rightPhoto, homeImages.ctaOceanCliff.label)}
              className="absolute right-[-185px] top-2/3 h-[185px] w-[230px] -translate-y-1/2 rotate-[3deg] border-[5px] border-white/80 shadow-xl"
              showWatermark={shouldShowWatermark(content, "rightPhoto")}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
