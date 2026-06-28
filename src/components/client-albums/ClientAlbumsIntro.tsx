import { ButtonLink } from "@/components/ui/ButtonLink";
import { clientAlbumImages, clientAlbumIntro } from "@/data/clients";

export function ClientAlbumsIntro() {
  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 md:px-14 md:py-20">
      <div className="mx-auto grid max-w-[1100px] items-center gap-12 md:grid-cols-[0.65fr_1fr]">
        <div className="relative mx-auto w-full max-w-[260px]">
          <img
            src="/images/client-albums/intro_stamp_01.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-1/2 hidden w-36 -translate-y-1/2 opacity-30 md:block"
          />

          <div
            className="aspect-[0.82] bg-[#d5ccbd] bg-cover bg-center shadow-sm"
            style={{
              backgroundImage: `url(${clientAlbumImages.introTurtle.src})`,
            }}
          />
        </div>

        <div className="max-w-xl">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#242617]/55">
            {clientAlbumIntro.eyebrow}
          </p>

          <h2 className="mt-5 font-serif text-4xl uppercase leading-[1.05] md:text-5xl">
            {clientAlbumIntro.title}
          </h2>

          <div className="my-6 h-px w-12 bg-[#242617]/35" />

          <p className="max-w-lg text-sm leading-7 text-[#242617]/65">
            {clientAlbumIntro.description}
          </p>

          <div className="mt-7">
            <ButtonLink href="#recent-client-albums" variant="filled">
              How it works
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
