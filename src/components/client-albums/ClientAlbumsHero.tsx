import { PhotoFrame } from "@/components/ui/PhotoFrame";
import {
  clientAlbumHero,
  clientAlbumImages,
} from "@/data/clients";

export function ClientAlbumsHero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#11180f] text-[#f4efe4]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${clientAlbumImages.hero.src})`,
        }}
      />

      <div className="absolute inset-0 bg-[#10170d]/58" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1500px] grid-cols-1 items-center px-6 pb-20 pt-28 md:px-14 lg:grid-cols-[0.75fr_1fr_0.75fr] lg:gap-10">
        {/* Left postcards, same logic as AboutHero */}
        <div className="pointer-events-none relative hidden h-[470px] lg:block xl:h-[520px]">
          <PhotoFrame
            src={clientAlbumImages.hero01.src}
            label={clientAlbumImages.hero01.label}
            className="absolute left-[2%] top-[8%] z-20 h-[255px] w-[190px] rotate-[-5deg] border-[6px] border-white/85 shadow-2xl xl:h-[300px] xl:w-[220px]"
          />

          <PhotoFrame
            src={clientAlbumImages.hero02.src}
            label={clientAlbumImages.hero02.label}
            className="absolute left-[46%] top-[-5%] z-30 h-[165px] w-[145px] rotate-[3deg] border-[6px] border-white/85 shadow-2xl xl:h-[195px] xl:w-[170px]"
          />

          <img
            src="/images/client-albums/hero_stamp_01.png"
            alt=""
            aria-hidden="true"
            className="absolute left-[48%] top-[10%] z-10 w-50 rotate-[8deg] opacity-75 xl:w-66"
          />

          <p className="absolute left-[6%] bottom-[6%] z-50 max-w-[190px] -rotate-6 text-left font-hand text-2xl leading-10 text-[#f4efe4]/65">
            {clientAlbumHero.handwritten}
          </p>
        </div>

        {/* Center third intentionally empty */}
        <div className="hidden lg:block" aria-hidden="true" />

        {/* Right text */}
        <div className="mx-auto max-w-md text-center lg:mx-0 lg:text-left">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/60">
            {clientAlbumHero.eyebrow}
          </p>

          <h1 className="font-serif text-[clamp(3rem,5vw,5.4rem)] uppercase leading-[0.94] tracking-[-0.04em]">
            Your memories,
            <br />
            beautifully
            <br />
            preserved.
          </h1>

          <div className="mx-auto my-6 h-px w-14 bg-white/40 lg:mx-0" />

          <p className="mx-auto max-w-xs text-sm leading-7 text-white/70 lg:mx-0">
            {clientAlbumHero.description}
          </p>
        </div>
      </div>
    </section>
  );
}
