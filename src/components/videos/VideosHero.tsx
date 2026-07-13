import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { videosImages } from "@/data/videos";
import type { PublicSectionContent } from "@/lib/content/site";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { shouldShowImageWatermark } from "@/lib/content/image-watermarks";

type VideosHeroProps = {
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

function renderLines(text: string) {
  return text.split("\n").filter(Boolean);
}

export function VideosHero({ content }: VideosHeroProps) {
  const background =
    content?.images.background || content?.imageSrc || videosImages.hero.src;
  const showBackgroundWatermark = Boolean(background) && shouldShowImageWatermark(content, "background", false);
  const heroCoast = content?.images.heroCoast || videosImages.heroCoast.src;
  const heroTurtle = content?.images.heroTurtle || videosImages.heroTurtle.src;
  const heroRoadtrip =
    content?.images.heroRoadtrip || videosImages.heroRoadtrip.src;

  const handwritten =
    content?.drawings.handwritten || "collect moments,\nnot things.";

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#11180f] text-[#f4efe4]">
      {background ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${background})` }}
        />
      ) : null}
      <FrameWatermark enabled={showBackgroundWatermark} mode="background" />
      <div className="absolute inset-0 bg-[#11150d]/50" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1500px] grid-cols-1 items-center px-6 pb-20 pt-28 md:px-14 lg:grid-cols-[0.75fr_1fr_0.75fr] lg:gap-10">
        <div className="max-w-sm">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            {content?.eyebrow || "Our films"}
          </p>

          <h1 className="font-serif text-[clamp(3rem,5vw,5rem)] uppercase leading-[0.94] tracking-[-0.04em]">
            {content?.title || "Films from the road."}
          </h1>

          <div className="my-6 h-px w-14 bg-white/40" />

          <p className="max-w-xs text-sm leading-7 text-white/70">
            {content?.description ||
              "Short films, travel recaps and visual stories from land and sea. Cinematic moments, real emotions, wild places."}
          </p>

          <a
            href="#films"
            className="mt-8 inline-block border border-white/45 px-7 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-[#172016]"
          >
            {content?.ctaLabel || "Watch our films →"}
          </a>
        </div>

        <div className="hidden lg:block" aria-hidden="true" />

        <div className="pointer-events-none relative hidden h-[520px] lg:block">
          {heroCoast ? (
            <PhotoFrame
              src={heroCoast}
              label={fileLabel(heroCoast, videosImages.heroCoast.label)}
              className="absolute right-[-22%] top-[0px] z-20 h-[255px] w-[190px] rotate-[5deg] border-[6px] border-white/85 shadow-2xl xl:h-[300px] xl:w-[220px]"
              showWatermark={shouldShowWatermark(content, "heroCoast")}
            />
          ) : null}

          {heroTurtle ? (
            <PhotoFrame
              src={heroTurtle}
              label={fileLabel(heroTurtle, videosImages.heroTurtle.label)}
              className="absolute right-[-66%] top-[-120px] z-40 h-[165px] w-[145px] rotate-[-3deg] border-[6px] border-white/85 shadow-2xl xl:h-[195px] xl:w-[170px]"
              showWatermark={shouldShowWatermark(content, "heroTurtle")}
            />
          ) : null}

          {heroRoadtrip ? (
            <PhotoFrame
              src={heroRoadtrip}
              label={fileLabel(heroRoadtrip, videosImages.heroRoadtrip.label)}
              className="absolute right-[-22%] top-[-160px] z-30 h-[175px] w-[260px] rotate-[4deg] border-[6px] border-white/85 shadow-2xl"
              showWatermark={shouldShowWatermark(content, "heroRoadtrip")}
            />
          ) : null}

          <p className="absolute bottom-[0%] right-[88%] -rotate-6 text-right font-hand text-xl leading-7 text-white/65">
            {renderLines(handwritten).map((line) => (
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
        className="pointer-events-none absolute bottom-[-2px] z-20 h-16 w-full object-fill"
      />
    </section>
  );
}
