import { ButtonLink } from "@/components/ui/ButtonLink";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { aboutImages } from "@/data/about";

export function AboutStory() {
  return (
    <section className="bg-[#f4efe4] px-6 py-20 md:px-14 md:py-24">
      <div className="mx-auto grid max-w-[1350px] items-center gap-12 lg:grid-cols-[0.85fr_1.25fr]">
        <div>
          <SectionLabel>Our story</SectionLabel>

          <h2 className="font-serif text-5xl uppercase leading-[0.95] tracking-[-0.04em] md:text-6xl">
            How our adventure
            <br />
            began
          </h2>

          <div className="my-8 h-px w-16 bg-[#596044]" />

          <div className="space-y-5 text-sm leading-8 text-[#333525]/75 md:text-[15px]">
            <p>
              Morgane picked up a camera at 16 and instantly fell in love with
              the way it could freeze a feeling, a place, a moment in time.
            </p>

            <p>
              She shared that passion with Andrew, who is drawn to film and the
              beauty of real, unfiltered moments.
            </p>

            <p>
              Travel brought us together and created the perfect duo: her eye
              for stills, his vision for motion.
            </p>

            <p>
              Today, we roam the world together, capturing landscapes,
              underwater life, wildlife and the human stories that make each
              place unique.
            </p>
          </div>

          <div className="mt-8">
            <ButtonLink href="/portfolio" variant="light" className="min-w-60">
              Our journey in pictures
            </ButtonLink>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <PhotoFrame
            src={aboutImages.story01.src}
            label={aboutImages.story01.label}
            className="h-[260px] w-full sm:col-span-2 md:h-[330px]"
          />

          <PhotoFrame
            src={aboutImages.story02.src}
            label={aboutImages.story02.label}
            className="h-[220px] w-full"
          />

          <PhotoFrame
            src={aboutImages.story03.src}
            label={aboutImages.story03.label}
            className="h-[220px] w-full"
          />

          <PhotoFrame
            src={aboutImages.story04.src}
            label={aboutImages.story04.label}
            className="h-[220px] w-full sm:col-span-2 md:h-[270px]"
          />
        </div>
      </div>
    </section>
  );
}
