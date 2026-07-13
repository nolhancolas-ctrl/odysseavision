import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { portfolioImages } from "@/data/portfolio";
import type { PublicSectionContent } from "@/lib/content/site";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { shouldShowImageWatermark } from "@/lib/content/image-watermarks";

type PortfolioHeroProps = {
  content?: PublicSectionContent;
};

function fileLabel(src: string, fallback: string) {
  return src.split("/").pop() || fallback;
}

function renderHandwritten(text: string) {
  return text.split(" ").reduce<string[]>((lines, word, index) => {
    if (index === 3) {
      return [...lines, word];
    }

    if (index > 3) {
      lines[lines.length - 1] = `${lines[lines.length - 1]} ${word}`;
      return lines;
    }

    return [...lines, word];
  }, []);
}

export function PortfolioHero({ content }: PortfolioHeroProps) {
  const background =
    content?.images.background || content?.imageSrc || portfolioImages.hero.src;
  const showBackgroundWatermark = Boolean(background) && shouldShowImageWatermark(content, "background", false);
  const heroElephants =
    content?.images.heroElephants || portfolioImages.heroElephants.src;
  const heroOcean = content?.images.heroOcean || portfolioImages.heroOcean.src;
  const heroLandscape =
    content?.images.heroLandscape || portfolioImages.heroLandscape.src;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#10170d] text-[#f4efe4]">
      {background ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${background})` }}
        />
      ) : null}
      <FrameWatermark enabled={showBackgroundWatermark} mode="background" />

      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1500px] grid-cols-1 items-center px-6 pb-16 pt-28 md:px-14 lg:grid-cols-[0.75fr_1fr_0.75fr] lg:gap-10">
        <div className="max-w-md">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/60">
            {content?.eyebrow || "Portfolio"}
          </p>

          <h1 className="font-serif text-[clamp(3rem,5vw,5.5rem)] uppercase leading-[0.92] tracking-[-0.04em]">
            {content?.title || "Capturing wild beauty."}
          </h1>

          <div className="my-6 h-px w-14 bg-white/40" />

          <p className="max-w-xs text-sm leading-7 text-white/70">
            {content?.description ||
              "A collection of our favorite moments from land and sea. Each image tells a story of wonder, respect and connection."}
          </p>

          <p className="mt-10 translate-x-20 rotate-[-7deg] font-hand text-xl leading-7 text-white/65">
            {renderHandwritten(
              content?.drawings.handwritten || "see the world differently",
            ).map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>

        <div className="hidden lg:block" aria-hidden="true" />

        <div className="pointer-events-none relative hidden h-[520px] lg:block">
          {heroElephants ? (
            <PhotoFrame
              src={heroElephants}
              label={fileLabel(heroElephants, portfolioImages.heroElephants.label)}
              className="absolute right-[-22%] top-[0px] z-20 h-[255px] w-[190px] rotate-[5deg] border-[6px] border-white/85 shadow-2xl xl:h-[300px] xl:w-[220px]"
            />
          ) : null}

          {heroOcean ? (
            <PhotoFrame
              src={heroOcean}
              label={fileLabel(heroOcean, portfolioImages.heroOcean.label)}
              className="absolute right-[26%] top-[-120px] z-10 h-[165px] w-[145px] rotate-[-3deg] border-[6px] border-white/85 shadow-2xl xl:h-[195px] xl:w-[170px]"
            />
          ) : null}

          {heroLandscape ? (
            <PhotoFrame
              src={heroLandscape}
              label={fileLabel(heroLandscape, portfolioImages.heroLandscape.label)}
              className="absolute right-[-22%] top-[-180px] z-30 h-[175px] w-[260px] rotate-[4deg] border-[6px] border-white/85 shadow-2xl"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
