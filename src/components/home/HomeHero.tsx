import { ButtonLink } from "@/components/ui/ButtonLink";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { homeImages } from "@/data/home";
import type { PublicSectionContent } from "@/lib/content/site";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { shouldShowImageWatermark } from "@/lib/content/image-watermarks";

type HomeHeroProps = {
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

export function HomeHero({ content }: HomeHeroProps) {
  const background = content?.images.background || content?.imageSrc || homeImages.hero.src;
  const showBackgroundWatermark = Boolean(background) && shouldShowImageWatermark(content, "background", false);
  const postalCoast = content?.images.postalCoast || homeImages.postalCoast.src;
  const postalTurtle = content?.images.postalTurtle || homeImages.postalTurtle.src;
  const postalZebra = content?.images.postalZebra || homeImages.postalZebra.src;
  const postalManta = content?.images.postalManta || homeImages.postalManta.src;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#10170d] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 14, 8, 0.47), rgba(10, 14, 8, 0.58)), url(${background})`,
        }}
      />
      <FrameWatermark enabled={showBackgroundWatermark} mode="background" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/60" />

      <div className="relative z-20 mx-auto grid min-h-[100svh] w-full max-w-[1500px] grid-cols-1 items-center px-6 pb-14 pt-28 md:px-10 lg:grid-cols-[minmax(220px,1fr)_minmax(410px,620px)_minmax(220px,1fr)] lg:gap-8 xl:gap-14">
        <div className="pointer-events-none relative hidden h-[430px] lg:block xl:h-[500px]">
          {postalCoast ? (
            <PhotoFrame
              src={postalCoast}
              label={fileLabel(postalCoast, homeImages.postalCoast.label)}
              className="absolute left-[2%] top-[12%] h-[270px] w-[200px] rotate-[-4deg] border-[6px] border-white/90 xl:h-[315px] xl:w-[232px]"
              showWatermark={shouldShowWatermark(content, "postalCoast")}
            />
          ) : null}

          {postalTurtle ? (
            <PhotoFrame
              src={postalTurtle}
              label={fileLabel(postalTurtle, homeImages.postalTurtle.label)}
              className="absolute bottom-[6%] right-[-44%] h-[155px] w-[132px] rotate-[2deg] border-[6px] border-white/90 xl:h-[185px] xl:w-[158px]"
              showWatermark={shouldShowWatermark(content, "postalTurtle")}
            />
          ) : null}
        </div>

        <div className="mx-auto max-w-[620px] text-center">
          <h1 className="font-serif text-[clamp(3.4rem,6.2vw,6.7rem)] uppercase leading-[0.94] tracking-[-0.045em]">
            {content?.title || "Wild Stories"}
          </h1>

          <p className="mt-2 font-serif text-[clamp(2.1rem,3.8vw,4.1rem)] italic leading-none text-[#f4efe4]/90">
            {content?.drawings.subtitle || "from land and sea."}
          </p>

          <div className="mx-auto mt-4 h-px w-14 bg-white/35" />

          <p className="mx-auto mt-5 max-w-md text-xs font-medium leading-6 text-white/75 md:text-sm md:leading-7">
            {content?.description ||
              "We are Andrew & Morgane, photographers and filmmakers capturing the beauty of our planet and the stories that deserve to be told."}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink
              href={content?.ctaHref || "/portfolio"}
              variant="filled"
              className="min-w-52 px-6 py-2.5 text-[10px]"
            >
              {content?.ctaLabel || "Explore the portfolio"}
            </ButtonLink>

            <ButtonLink
              href="/about"
              className="min-w-44 px-6 py-2.5 text-[10px]"
            >
              Meet the crew
            </ButtonLink>
          </div>
        </div>

        <div className="pointer-events-none relative hidden h-[430px] lg:block xl:h-[500px]">
          {postalZebra ? (
            <PhotoFrame
              src={postalZebra}
              label={fileLabel(postalZebra, homeImages.postalZebra.label)}
              className="absolute right-[3%] top-[10%] h-[280px] w-[205px] rotate-[3deg] border-[6px] border-white/90 xl:right-[-30%] xl:h-[325px] xl:w-[238px]"
              showWatermark={shouldShowWatermark(content, "postalZebra")}
            />
          ) : null}

          {postalManta ? (
            <PhotoFrame
              src={postalManta}
              label={fileLabel(postalManta, homeImages.postalManta.label)}
              className="absolute bottom-[5%] left-[10%] h-[155px] w-[136px] rotate-[-2deg] border-[6px] border-white/90 xl:h-[185px] xl:w-[162px]"
              showWatermark={shouldShowWatermark(content, "postalManta")}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
