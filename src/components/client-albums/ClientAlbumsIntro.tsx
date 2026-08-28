import { clientAlbumImages, clientAlbumIntro } from "@/data/clients";
import type { PublicSectionContent } from "@/lib/content/site";

type ClientAlbumsIntroProps = {
  content?: PublicSectionContent;
};

export function ClientAlbumsIntro({ content }: ClientAlbumsIntroProps) {
  const photo = content?.images.photo ?? clientAlbumImages.introTurtle.src;

  return (
    <section className="relative overflow-hidden bg-[#11190f] px-6 py-16 text-[#f4efe4] md:px-14 md:py-20">
      <div className="mx-auto grid max-w-[1100px] items-center gap-12 md:grid-cols-[0.65fr_1fr]">
        <div className="relative mx-auto w-full max-w-[260px]">

          {photo ? (
            <div
              className="aspect-[0.82] bg-[#d5ccbd] bg-cover bg-center shadow-sm"
              style={{
                backgroundImage: `url(${photo})`,
              }}
            />
          ) : null}
        </div>

        <div className="max-w-xl">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#f4efe4]/55">
            {content?.eyebrow || clientAlbumIntro.eyebrow}
          </p>

          <h2 className="mt-5 font-serif text-4xl uppercase leading-[1.05] md:text-5xl">
            {content?.title || clientAlbumIntro.title}
          </h2>

          <div className="my-6 h-px w-12 bg-[#f4efe4]/35" />

          <p className="max-w-lg text-sm leading-7 text-[#f4efe4]/65">
            {content?.description || clientAlbumIntro.description}
          </p>

          <div className="mt-7">
            <a
              href={content?.ctaHref || "#easy-secure-access"}
              className="inline-flex min-w-56 items-center justify-center border border-[#f4efe4]/70 px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#f4efe4] hover:text-[#11190f]"
            >
              {content?.ctaLabel || "How it works"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
