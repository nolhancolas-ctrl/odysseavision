import { ButtonLink } from "@/components/ui/ButtonLink";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { homeImages } from "@/data/home";

export function AboutFinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#f4efe4] text-[#242617]">
      <div className="absolute inset-0 bg-gradient-to-r from-[#e8dfcf]/45 via-transparent to-[#e8dfcf]/45" />

      <div className="relative mx-auto flex min-h-[250px] max-w-[1500px] items-center justify-center px-6 py-12 md:min-h-[280px] md:px-14 lg:py-10">
        {/* Left image group */}
        <div className="pointer-events-none absolute left-0 top-1/2 hidden h-[230px] w-[350px] -translate-y-1/2 lg:block xl:left-6">
          <PhotoFrame
            src={homeImages.ctaSailboat.src}
            label={homeImages.ctaSailboat.label}
            className="absolute left-8 top-1/2 h-[285px] w-[245px] -translate-y-1/2 rotate-[-4deg] border-[5px] border-white/90 shadow-xl"
          />

          <img
            src="/images/home/cta_stamp_01.png"
            alt=""
            className="absolute left-[235px] top-[108px] w-[178px] rotate-[-8deg] opacity-80"
          />
        </div>

        {/* Center text */}
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl uppercase leading-none tracking-[-0.04em] md:text-5xl lg:text-6xl">
            Have a story to tell?
          </h2>

          <p className="mt-2 font-serif text-2xl italic leading-none text-[#596044] md:text-3xl">
            we’d love to hear from you.
          </p>

          <div className="mx-auto mt-4 h-px w-12 bg-[#596044]/35" />

          <div className="mt-6">
            <ButtonLink
              href="/contact"
              variant="light"
              className="min-w-72 px-10 py-3 text-[10px]"
            >
              Get in touch
            </ButtonLink>
          </div>
        </div>

        {/* Right quote + image group */}
        <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[230px] w-[390px] -translate-y-1/2 lg:block xl:right-6">
          <div className="absolute left-[30px] top-[58px] max-w-[165px] -rotate-6 text-left font-hand text-xl leading-8 text-[#596044]/75">
            let’s go somewhere beautiful
          </div>

          <PhotoFrame
            src={homeImages.ctaOceanCliff.src}
            label={homeImages.ctaOceanCliff.label}
            className="absolute right-[-185px] top-2/3 h-[185px] w-[230px] -translate-y-1/2 rotate-[3deg] border-[5px] border-white/90 shadow-xl"
          />

        </div>
      </div>
    </section>
  );
}
