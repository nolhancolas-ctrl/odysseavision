import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { storiesImages } from "@/data/stories";
import type { PublicSectionContent } from "@/lib/content/site";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { shouldShowImageWatermark } from "@/lib/content/image-watermarks";

type StoriesHeroProps = {
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

function renderHandwritten(text: string) {
  return text.split(" ").reduce<string[]>((lines, word, index) => {
    if (index === 2) {
      return [...lines, word];
    }

    if (index > 2) {
      lines[lines.length - 1] = `${lines[lines.length - 1]} ${word}`;
      return lines;
    }

    return [...lines, word];
  }, []);
}

export function StoriesHero({ content }: StoriesHeroProps) {
  const background =
    content?.images.background || content?.imageSrc || storiesImages.hero.src;
  const showBackgroundWatermark = Boolean(background) && shouldShowImageWatermark(content, "background", false);
  const heroWhale = content?.images.heroWhale || storiesImages.heroWhale.src;
  const heroManta = content?.images.heroManta || storiesImages.heroManta.src;
  const heroElephants =
    content?.images.heroElephants || storiesImages.heroElephants.src;
  const stamp = content?.images.stamp || "/images/stories/hero_stamp_01.png";

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#11180f] text-[#f4efe4]">
      {background ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${background})` }}
        />
      ) : null}
      <FrameWatermark enabled={showBackgroundWatermark} mode="background" />

      <div className="absolute inset-0 bg-[#11180f]/55" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1500px] grid-cols-1 items-center px-6 pb-20 pt-28 md:px-14 lg:grid-cols-[0.8fr_1.4fr_0.8fr] lg:gap-10">
        <div className="pointer-events-none relative hidden h-[500px] lg:block">
          {heroWhale ? (
            <PhotoFrame
              src={heroWhale}
              label={fileLabel(heroWhale, storiesImages.heroWhale.label)}
              className="absolute left-[-8%] top-[5%] h-[230px] w-[190px] rotate-[-4deg] border-[6px] border-white/90 shadow-2xl"
              showWatermark={shouldShowWatermark(content, "heroWhale")}
            />
          ) : null}

          {heroManta ? (
            <PhotoFrame
              src={heroManta}
              label={fileLabel(heroManta, storiesImages.heroManta.label)}
              className="absolute left-[28%] top-[0%] h-[220px] w-[185px] rotate-[1deg] border-[6px] border-white/90 shadow-2xl"
              showWatermark={shouldShowWatermark(content, "heroManta")}
            />
          ) : null}

          <div className="absolute left-[8%] top-[2%] h-7 w-24 -rotate-3 bg-[#d6c9af]/80" />
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            {content?.eyebrow || "Our stories"}
          </p>

          <h1 className="font-serif text-[clamp(3rem,5vw,5.2rem)] uppercase leading-[0.95] tracking-[-0.04em]">
            {content?.title || "Tales from the road & sea"}
          </h1>

          <div className="mx-auto my-6 h-px w-14 bg-white/40" />

          <p className="mx-auto max-w-lg text-sm leading-7 text-white/70">
            {content?.description ||
              "Stories, reflections and raw moments from our travels. From wildlife encounters to conservation, photography and life on the road."}
          </p>
        </div>

        <div className="pointer-events-none relative hidden h-[500px] lg:block">
          {heroElephants ? (
            <PhotoFrame
              src={heroElephants}
              label={fileLabel(heroElephants, storiesImages.heroElephants.label)}
              className="absolute right-[-25%] top-[28%] h-[215px] w-[185px] rotate-[5deg] border-[6px] border-white/90 shadow-2xl"
              showWatermark={shouldShowWatermark(content, "heroElephants")}
            />
          ) : null}

          {stamp ? (
            <img
              src={stamp}
              alt=""
              className="absolute bottom-[14%] right-[-10%] w-34 rotate-[8deg] opacity-85"
            />
          ) : null}

          <p className="absolute bottom-[8%] right-[28%] -rotate-6 font-hand text-xl text-white/65">
            {renderHandwritten(
              content?.drawings.handwritten || "stories worth sharing",
            ).map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>
      </div>

      <img
        src="/images/stories/torn-paper.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-2px] z-20 h-[72px] w-full object-fill drop-shadow-[0_-2px_2px_rgba(10,14,9,0.2)]"
      />
    </section>
  );
}
