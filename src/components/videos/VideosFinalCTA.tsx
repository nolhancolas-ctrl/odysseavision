import Link from "next/link";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { videosImages } from "@/data/videos";

export function VideosFinalCTA() {
  return (
    <section className="relative min-h-[310px] overflow-hidden bg-[#11190f] px-6 py-16 text-[#f4efe4] md:px-14">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-55"
        style={{ backgroundImage: `url(${videosImages.ctaFond.src})` }}
      />
      <div className="absolute inset-0 bg-[#11190f]/50" />

      <div className="relative mx-auto flex min-h-[180px] max-w-[1400px] items-center justify-center">
        <img
          src="/images/videos/cta_stamp_01.png"
          alt=""
          className="pointer-events-none absolute -bottom-25 left-0 -rotate-20 hidden w-[29%] opacity-60 lg:block"
        />

        <div className="relative z-10 text-center">
          <h2 className="font-serif text-4xl uppercase md:text-5xl">
            Love visual storytelling?
          </h2>

          <p className="mt-3 font-hand text-xl text-white/70">
            Let’s create something beautiful together.
          </p>

          <Link
            href="/contact"
            className="mt-7 inline-block border border-white/45 px-10 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-[#172016]"
          >
            Get in touch →
          </Link>
        </div>

        <div className="pointer-events-none absolute right-0 hidden h-[230px] w-[250px] lg:block">
          <PhotoFrame
            src={videosImages.ctaDuo.src}
            label={videosImages.ctaDuo.label}
            className="absolute right-0 top-1/2 h-[215px] w-[175px] -translate-y-1/2 rotate-[5deg] border-[6px] border-white/90 shadow-xl"
          />

          <img
            src="/images/videos/cta_leaf_01.png"
            alt=""
            className="absolute bottom-2 right-[175px] w-20 opacity-55"
          />
        </div>
      </div>
    </section>
  );
}
