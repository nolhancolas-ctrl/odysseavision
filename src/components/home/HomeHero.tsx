import { ButtonLink } from "@/components/ui/ButtonLink";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { homeImages } from "@/data/home";

export function HomeHero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#10170d] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 14, 8, 0.47), rgba(10, 14, 8, 0.58)), url(${homeImages.hero.src})`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/60" />

      <div className="relative z-20 mx-auto grid min-h-[100svh] w-full max-w-[1500px] grid-cols-1 items-center px-6 pb-14 pt-28 md:px-10 lg:grid-cols-[minmax(220px,1fr)_minmax(410px,620px)_minmax(220px,1fr)] lg:gap-8 xl:gap-14">
        {/* Left postcards */}
        <div className="pointer-events-none relative hidden h-[430px] lg:block xl:h-[500px]">
          <PhotoFrame
            src={homeImages.postalCoast.src}
            label={homeImages.postalCoast.label}
            className="absolute left-[2%] top-[12%] h-[270px] w-[200px] rotate-[-4deg] border-[6px] border-white/90 xl:h-[315px] xl:w-[232px]"
          />

          <PhotoFrame
            src={homeImages.postalTurtle.src}
            label={homeImages.postalTurtle.label}
            className="absolute bottom-[6%] right-[-44%] h-[155px] w-[132px] rotate-[2deg] border-[6px] border-white/90 xl:h-[185px] xl:w-[158px]"
          />
        </div>

        {/* Center text */}
        <div className="mx-auto max-w-[620px] text-center">
          <h1 className="font-serif text-[clamp(3.4rem,6.2vw,6.7rem)] uppercase leading-[0.94] tracking-[-0.045em]">
            Wild Stories
          </h1>

          <p className="mt-2 font-serif text-[clamp(2.1rem,3.8vw,4.1rem)] italic leading-none text-[#f4efe4]/90">
            from land and sea.
          </p>

          <div className="mx-auto mt-4 h-px w-14 bg-white/35" />

          <p className="mx-auto mt-5 max-w-md text-xs font-medium leading-6 text-white/75 md:text-sm md:leading-7">
            We are Andrew & Morgane, photographers and filmmakers capturing the
            beauty of our planet and the stories that deserve to be told.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink
              href="/portfolio"
              variant="filled"
              className="min-w-52 px-6 py-2.5 text-[10px]"
            >
              Explore the portfolio
            </ButtonLink>

            <ButtonLink
              href="/about"
              className="min-w-44 px-6 py-2.5 text-[10px]"
            >
              Meet the crew
            </ButtonLink>
          </div>
        </div>

        {/* Right postcards */}
        <div className="pointer-events-none relative hidden h-[430px] lg:block xl:h-[500px]">
          <PhotoFrame
            src={homeImages.postalZebra.src}
            label={homeImages.postalZebra.label}
            className="absolute right-[3%] top-[10%] h-[280px] w-[205px] rotate-[3deg] border-[6px] border-white/90 xl:h-[325px] xl:w-[238px] xl:right-[-30%]"
          />

          <PhotoFrame
            src={homeImages.postalManta.src}
            label={homeImages.postalManta.label}
            className="absolute bottom-[5%] left-[10%] h-[155px] w-[136px] rotate-[-2deg] border-[6px] border-white/90 xl:h-[185px] xl:w-[162px]"
          />
        </div>
      </div>

    </section>
  );
}
