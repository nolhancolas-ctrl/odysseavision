import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { clientAlbumHero, clientAlbumImages } from "@/data/clients";
import type { PublicSectionContent } from "@/lib/content/site";

type ClientAlbumsHeroProps = {
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

export function ClientAlbumsHero({ content }: ClientAlbumsHeroProps) {
  const background =
    content?.images.background ||
    content?.imageSrc ||
    clientAlbumImages.hero.src;
  const hero01 = content?.images.hero01 || clientAlbumImages.hero01.src;
  const hero02 = content?.images.hero02 || clientAlbumImages.hero02.src;
  const stamp =
    content?.images.stamp || "/images/client-albums/hero_stamp_01.png";
  const handwritten =
    content?.drawings.handwritten || clientAlbumHero.handwritten;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#11180f] text-[#f4efe4]">
      {background ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${background})`,
          }}
        />
      ) : null}

      <div className="absolute inset-0 bg-[#10170d]/58" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1500px] grid-cols-1 items-center px-6 pb-20 pt-28 md:px-14 lg:grid-cols-[0.75fr_1fr_0.75fr] lg:gap-10">
        <div className="pointer-events-none relative hidden h-[470px] lg:block xl:h-[520px]">
          {hero01 ? (
            <PhotoFrame
              src={hero01}
              label={fileLabel(hero01, clientAlbumImages.hero01.label)}
              className="absolute left-[2%] top-[8%] z-20 h-[255px] w-[190px] rotate-[-5deg] border-[6px] border-white/85 shadow-2xl xl:h-[300px] xl:w-[220px]"
              showWatermark={shouldShowWatermark(content, "hero01")}
            />
          ) : null}

          {hero02 ? (
            <PhotoFrame
              src={hero02}
              label={fileLabel(hero02, clientAlbumImages.hero02.label)}
              className="absolute left-[46%] top-[-5%] z-30 h-[165px] w-[145px] rotate-[3deg] border-[6px] border-white/85 shadow-2xl xl:h-[195px] xl:w-[170px]"
              showWatermark={shouldShowWatermark(content, "hero02")}
            />
          ) : null}

          {stamp ? (
            <img
              src={stamp}
              alt=""
              aria-hidden="true"
              className="absolute left-[48%] top-[10%] z-10 w-50 rotate-[8deg] opacity-75 xl:w-66"
            />
          ) : null}

          <p className="absolute bottom-[6%] left-[6%] z-50 max-w-[190px] -rotate-6 text-left font-hand text-2xl leading-10 text-[#f4efe4]/65">
            {handwritten}
          </p>
        </div>

        <div className="hidden lg:block" aria-hidden="true" />

        <div className="mx-auto max-w-md text-center lg:mx-0 lg:text-left">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/60">
            {content?.eyebrow || clientAlbumHero.eyebrow}
          </p>

          <h1 className="font-serif text-[clamp(3rem,5vw,5.4rem)] uppercase leading-[0.94] tracking-[-0.04em]">
            {content?.title || clientAlbumHero.title}
          </h1>

          <div className="mx-auto my-6 h-px w-14 bg-white/40 lg:mx-0" />

          <p className="mx-auto max-w-xs text-sm leading-7 text-white/70 lg:mx-0">
            {content?.description || clientAlbumHero.description}
          </p>
        </div>
      </div>
    </section>
  );
}
