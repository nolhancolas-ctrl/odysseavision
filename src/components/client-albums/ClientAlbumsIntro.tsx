import { ButtonLink } from "@/components/ui/ButtonLink";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { clientAlbumImages, clientAlbumIntro } from "@/data/clients";
import type { PublicSectionContent } from "@/lib/content/site";

type ClientAlbumsIntroProps = {
  content?: PublicSectionContent;
};

function shouldShowWatermark(
  content: PublicSectionContent | undefined,
  key: string,
  defaultValue = true,
) {
  return content?.imageWatermarks?.[key] ?? defaultValue;
}

export function ClientAlbumsIntro({ content }: ClientAlbumsIntroProps) {
  const photo = content?.images.photo || clientAlbumImages.introTurtle.src;

  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 md:px-14 md:py-20">
      <div className="mx-auto grid max-w-[1100px] items-center gap-12 md:grid-cols-[0.65fr_1fr]">
        <div className="relative mx-auto w-full max-w-[260px]">
          {photo ? (
            <div
              className="relative aspect-[0.82] overflow-hidden bg-[#d5ccbd] bg-cover bg-center shadow-sm"
              style={{
                backgroundImage: `url(${photo})`,
              }}
            >
              <FrameWatermark
                enabled={shouldShowWatermark(content, "photo")}
              />
            </div>
          ) : null}
        </div>

        <div className="max-w-xl">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#242617]/55">
            {content?.eyebrow || clientAlbumIntro.eyebrow}
          </p>

          <h2 className="mt-5 font-serif text-4xl uppercase leading-[1.05] md:text-5xl">
            {content?.title || clientAlbumIntro.title}
          </h2>

          <div className="my-6 h-px w-12 bg-[#242617]/35" />

          <p className="max-w-lg text-sm leading-7 text-[#242617]/65">
            {content?.description || clientAlbumIntro.description}
          </p>

          <div className="mt-7">
            <ButtonLink href="#recent-client-albums" variant="filled">
              {content?.ctaLabel || "How it works"}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
