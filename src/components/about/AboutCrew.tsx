import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { aboutImages } from "@/data/about";

export function AboutCrew() {
  return (
    <section className="bg-[#f4efe4] px-6 py-20 text-[#242617] md:px-14 md:py-24">
      <div className="mx-auto max-w-[1250px]">
        <div className="mb-14 text-center">
          <h2 className="font-serif text-5xl uppercase tracking-[-0.04em] md:text-6xl">
            Meet the crew
          </h2>
          <div className="mx-auto mt-5 h-px w-14 bg-[#596044]" />
        </div>

        <div className="grid gap-14 lg:grid-cols-2">
          <article className="grid items-center gap-8 md:grid-cols-[0.8fr_1fr]">
            <div className="relative">
              <PhotoFrame
                src={aboutImages.crewAndrew.src}
                label={aboutImages.crewAndrew.label}
                className="h-[360px] w-full rotate-[-2deg] border-[6px] border-white/70"
              />
              <p className="mt-4 font-hand text-lg leading-8 text-[#596044]/80">
                energetic · sporty · goofy · friendly · ambitious
              </p>
            </div>

            <div>
              <h3 className="font-serif text-4xl uppercase tracking-[-0.03em]">
                Andrew
              </h3>

              <p className="mt-5 text-sm leading-8 text-[#333525]/75">
                Golden retriever energy, always up for the next adventure.
                Sporty, smiley and often the goofy one.
              </p>

              <p className="mt-5 text-sm leading-8 text-[#333525]/75">
                Serious when it comes to driving a boat or guiding divers, he
                loves capturing real, raw moments through film.
              </p>

              <p className="mt-5 text-sm leading-8 text-[#333525]/75">
                The ocean is his home.
              </p>

              <div className="mt-8">
                <ButtonLink href="/contact" variant="light" className="min-w-44">
                  Read more
                </ButtonLink>
              </div>
            </div>
          </article>

          <article className="grid items-center gap-8 md:grid-cols-[0.8fr_1fr]">
            <div className="relative">
              <PhotoFrame
                src={aboutImages.crewMorgane.src}
                label={aboutImages.crewMorgane.label}
                className="h-[360px] w-full rotate-[2deg] border-[6px] border-white/70"
              />
              <p className="mt-4 font-hand text-lg leading-8 text-[#596044]/80">
                curious · sensitive · determined · adventurous · ocean lover
              </p>
            </div>

            <div>
              <h3 className="font-serif text-4xl uppercase tracking-[-0.03em]">
                Morgane
              </h3>

              <p className="mt-5 text-sm leading-8 text-[#333525]/75">
                Photographer, dreamer and ocean lover. She sees beauty in the
                small details and seeks the magic in every place.
              </p>

              <p className="mt-5 text-sm leading-8 text-[#333525]/75">
                Passionate about marine life and conservation, she brings a
                sensitive eye to every story we tell.
              </p>

              <p className="mt-5 text-sm leading-8 text-[#333525]/75">
                Always chasing the light.
              </p>

              <div className="mt-8">
                <ButtonLink href="/contact" variant="light" className="min-w-44">
                  Read more
                </ButtonLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
