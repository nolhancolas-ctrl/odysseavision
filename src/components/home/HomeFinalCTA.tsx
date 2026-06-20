import { ButtonLink } from "@/components/ui/ButtonLink";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { homeImages } from "@/data/home";

export function HomeFinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#11190f] px-8 py-20 text-center text-[#f4efe4] md:px-14">
      <PhotoFrame
        src={homeImages.ctaSailboat.src}
        label={homeImages.ctaSailboat.label}
        className="absolute left-8 top-10 hidden h-40 w-52 rotate-[-5deg] md:block"
      />

      <PhotoFrame
        src={homeImages.ctaOceanCliff.src}
        label={homeImages.ctaOceanCliff.label}
        className="absolute bottom-10 right-8 hidden h-40 w-52 rotate-[4deg] md:block"
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <h2 className="font-serif text-5xl uppercase tracking-[-0.04em]">
          Let’s tell your story
        </h2>

        <p className="mt-2 font-serif text-3xl italic text-[#f4efe4]/75">
          or simply say hello.
        </p>

        <div className="mt-9">
          <ButtonLink href="/contact">Contact us</ButtonLink>
        </div>
      </div>
    </section>
  );
}