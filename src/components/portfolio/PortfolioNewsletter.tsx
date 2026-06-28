import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { homeImages } from "@/data/home";
import { portfolioImages } from "@/data/portfolio";

export function PortfolioNewsletter() {
  return (
    <section className="relative min-h-[340px] overflow-hidden bg-[#172016] px-6 py-16 text-[#f4efe4] md:px-14">
      {/* More visible background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70 md:bg-top"
        style={{
          backgroundImage: `url(${portfolioImages.newsletterFond.src})`,
        }}
      />

      {/* Lighter and more transparent mask */}
      <div className="absolute inset-0 bg-[#222d20]/45" />

      <div className="relative mx-auto flex min-h-[230px] max-w-[1500px] items-center justify-center">
        {/* Left group from FinalCTA */}
        <div className="pointer-events-none absolute left-0 top-1/2 hidden h-[230px] w-[350px] -translate-y-1/2 lg:block xl:left-6">
          <PhotoFrame
            src={homeImages.ctaSailboat.src}
            label={homeImages.ctaSailboat.label}
            className="absolute left-8 top-1/2 h-[285px] w-[245px] -translate-y-1/2 rotate-[-4deg] border-[5px] border-white/90 shadow-xl"
          />

          <img
            src="/images/home/cta_stamp_01.png"
            alt=""
            aria-hidden="true"
            className="absolute left-[235px] top-[108px] w-[178px] rotate-[-8deg] opacity-80"
          />
        </div>

        {/* Newsletter content */}
        <div className="relative z-10 w-full max-w-xl text-center">
          <h2 className="font-serif text-4xl uppercase md:text-5xl">
            Stay inspired
          </h2>

          <p className="mt-2 font-hand text-xl text-[#f4efe4]/75">
            stories, new photos & adventures
          </p>

          <div className="mx-auto my-6 h-px w-10 bg-[#f4efe4]/45" />

          <form className="flex border border-[#f4efe4]/45 bg-[#11190f]/20 backdrop-blur-[2px]">
            <input
              type="email"
              placeholder="Your email address"
              className="min-w-0 flex-1 bg-transparent px-5 py-4 text-xs text-white outline-none placeholder:text-white/55"
            />

            <button
              type="submit"
              className="border-l border-[#f4efe4]/45 px-7 text-[9px] font-semibold uppercase tracking-[0.18em] transition hover:bg-white/10"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Right group from FinalCTA */}
        <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[230px] w-[390px] -translate-y-1/2 lg:block xl:right-6">
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
