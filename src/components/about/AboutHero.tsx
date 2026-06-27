import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { aboutImages } from "@/data/about";

export function AboutHero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#10170d] text-[#f4efe4]">
      <div
        className="absolute inset-0 bg-cover"
        style={{
          backgroundImage: `linear-gradient(rgba(9, 13, 7, 0.34), rgba(9, 13, 7, 0.66)), url(${aboutImages.hero.src})`,
          backgroundPosition: "right center",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1500px] grid-cols-1 items-center px-6 pb-16 pt-28 md:px-14 lg:grid-cols-[0.75fr_1fr_0.75fr] lg:gap-10">
        {/* Left postcards only */}
        <div className="pointer-events-none relative hidden h-[470px] lg:block xl:h-[520px]">
          <PhotoFrame
            src={aboutImages.hero01.src}
            label={aboutImages.hero01.label}
            className="absolute left-[2%] top-[8%] h-[255px] w-[190px] rotate-[-5deg] border-[6px] border-white/85 shadow-2xl xl:h-[300px] xl:w-[220px]"
          />

          <PhotoFrame
            src={aboutImages.hero02.src}
            label={aboutImages.hero02.label}
            className="absolute left-[46%] top-[-5%] h-[165px] w-[145px] rotate-[3deg] border-[6px] border-white/85 shadow-2xl xl:h-[195px] xl:w-[170px]"
          />

          <img
            src="/images/about/hero_drawing_01.png"
            alt=""
            className="absolute left-[45%] top-[18%] w-25 rotate-[-8deg] opacity-60 xl:w-40"
          />

          <img
            src="/images/about/hero_drawing_02.png"
            alt=""
            className="absolute left-[38%] bottom-[-15%] w-12 rotate-[8deg] opacity-60 xl:w-20"
          />

          <p className="absolute left-[6%] bottom-[6%] max-w-[180px] -rotate-6 text-left font-hand text-2xl leading-10 text-[#f4efe4]/65">
            collect moments,
            <br />
            not things
          </p>
          
        </div>

        {/* Center text */}
        <div className="mx-auto max-w-[560px] text-center">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#f4efe4]/65 md:text-[11px]">
            About us
          </p>

          <h1 className="font-serif text-[clamp(2.9rem,4.7vw,5.15rem)] uppercase leading-[0.94] tracking-[-0.045em]">
            Two storytellers
            <br />
            chasing wild horizons.
          </h1>

          <div className="mx-auto my-5 h-px w-14 bg-[#f4efe4]/35" />

          <p className="mx-auto max-w-md text-xs font-medium leading-6 text-[#f4efe4]/75 md:text-sm md:leading-7">
            We’re Andrew & Morgane, photographers and filmmakers drawn to the
            ocean, wildlife and the stories that live in between.
          </p>
        </div>

      </div>
    </section>
  );
}
