import { ButtonLink } from "@/components/ui/ButtonLink";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { homeImages } from "@/data/home";

export function HomeHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#10170d] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 14, 8, 0.48), rgba(10, 14, 8, 0.48)), url(${homeImages.hero.src})`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/45" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-8 pt-28">
        <PhotoFrame
          src={homeImages.postalCoast.src}
          label={homeImages.postalCoast.label}
          className="absolute left-8 top-[22%] hidden h-72 w-56 rotate-[-4deg] md:block"
        />

        <PhotoFrame
          src={homeImages.postalTurtle.src}
          label={homeImages.postalTurtle.label}
          className="absolute left-[18%] top-[58%] hidden h-44 w-40 rotate-[2deg] md:block"
        />

        <PhotoFrame
          src={homeImages.postalZebra.src}
          label={homeImages.postalZebra.label}
          className="absolute right-10 top-[21%] hidden h-72 w-56 rotate-[3deg] md:block"
        />

        <PhotoFrame
          src={homeImages.postalManta.src}
          label={homeImages.postalManta.label}
          className="absolute right-[20%] top-[58%] hidden h-44 w-40 rotate-[-2deg] md:block"
        />

        <div className="max-w-3xl text-center">
          <h1 className="font-serif text-6xl uppercase leading-[0.95] tracking-[-0.04em] md:text-8xl">
            Wild Stories
          </h1>

          <p className="mt-2 font-serif text-4xl italic leading-none text-[#f4efe4]/90 md:text-5xl">
            from land and sea.
          </p>

          <p className="mx-auto mt-8 max-w-md text-sm leading-7 text-white/75">
            We are Andrew & Morgane, photographers and filmmakers capturing the
            beauty of our planet and the stories that deserve to be told.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <ButtonLink href="/portfolio" variant="filled">
              Explore the portfolio
            </ButtonLink>
            <ButtonLink href="/about">Meet the crew</ButtonLink>
          </div>
        </div>
      </div>

      <p className="absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 rotate-[-90deg] text-[11px] uppercase tracking-[0.25em] text-white/65 md:block">
        Photography & Film
      </p>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-2xl text-white/75">
        ↓
      </div>
    </section>
  );
}