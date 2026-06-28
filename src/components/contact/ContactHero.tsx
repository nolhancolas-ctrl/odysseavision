import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { contactHero, contactImages } from "@/data/contact";

export function ContactHero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#10170d] text-[#f4efe4]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${contactImages.hero.src})`,
        }}
      />

      <div className="absolute inset-0 bg-[#10170d]/58" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45 opacity-20" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1500px] grid-cols-1 items-center px-6 pb-20 pt-28 md:px-14 lg:grid-cols-[0.75fr_1fr_0.75fr] lg:gap-10">
        {/* Left text */}
        <div className="max-w-md">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/60">
            {contactHero.eyebrow}
          </p>

          <h1 className="font-serif text-[clamp(3rem,5vw,5.4rem)] uppercase leading-[0.94] tracking-[-0.04em]">
            Let’s create
            <br />
            something
            <br />
            beautiful.
          </h1>

          <div className="my-6 h-px w-14 bg-white/40" />

          <p className="max-w-xs text-sm leading-7 text-white/70">
            {contactHero.description}
          </p>
        </div>

        {/* Center empty */}
        <div className="hidden lg:block" aria-hidden="true" />

        {/* Right images */}
        <div className="pointer-events-none relative hidden h-[520px] lg:block">
          <PhotoFrame
            src={contactImages.hero01.src}
            label={contactImages.hero01.label}
            className="absolute right-[-26%] top-[12%] z-60 h-[280px] w-[220px] rotate-[4deg] border-[6px] border-white/85 shadow-2xl xl:h-[320px] xl:w-[250px]"
          />

          <PhotoFrame
            src={contactImages.hero02.src}
            label={contactImages.hero02.label}
            className="absolute right-[33%] top-[-64%] z-30 h-[190px] w-[230px] rotate-[-4deg] border-[6px] border-white/85 shadow-2xl xl:h-[215px] xl:w-[260px]"
          />

          <p className="mt-10 -translate-y-20 -rotate-6 font-hand text-2xl leading-9 text-white/60">
            {contactHero.handwritten}
          </p>

        </div>
      </div>
    </section>
  );
}
