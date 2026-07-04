import Link from "next/link";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { videosImages } from "@/data/videos";
import type { PublicSectionContent } from "@/lib/content/site";

type VideosFinalCTAProps = {
  content?: PublicSectionContent;
};

function fileLabel(src: string, fallback: string) {
  return src.split("/").pop() || fallback;
}

export function VideosFinalCTA({ content }: VideosFinalCTAProps) {
  const background =
    content?.images.background || content?.imageSrc || videosImages.ctaFond.src;
  const stamp = content?.images.stamp || "/images/videos/cta_stamp_01.png";
  const duo = content?.images.duo || videosImages.ctaDuo.src;
  const leaf = content?.images.leaf || "/images/videos/cta_leaf_01.png";

  return (
    <section className="relative min-h-[310px] overflow-hidden bg-[#11190f] px-6 py-16 text-[#f4efe4] md:px-14">
      {background ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: `url(${background})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-[#11190f]/50" />

      <div className="relative mx-auto flex min-h-[180px] max-w-[1400px] items-center justify-center">
        {stamp ? (
          <img
            src={stamp}
            alt=""
            className="pointer-events-none absolute -bottom-25 left-0 hidden w-[29%] -rotate-20 opacity-60 lg:block"
          />
        ) : null}

        <div className="relative z-10 text-center">
          <h2 className="font-serif text-4xl uppercase md:text-5xl">
            {content?.title || "Love visual storytelling?"}
          </h2>

          <p className="mt-3 font-hand text-xl text-white/70">
            {content?.description ||
              "Let’s create something beautiful together."}
          </p>

          <Link
            href="/contact"
            className="mt-7 inline-block border border-white/45 px-10 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-[#172016]"
          >
            {content?.ctaLabel || "Get in touch →"}
          </Link>
        </div>

        <div className="pointer-events-none absolute right-0 hidden h-[230px] w-[250px] lg:block">
          {duo ? (
            <PhotoFrame
              src={duo}
              label={fileLabel(duo, videosImages.ctaDuo.label)}
              className="absolute right-0 top-1/2 h-[215px] w-[175px] -translate-y-1/2 rotate-[5deg] border-[6px] border-white/90 shadow-xl"
            />
          ) : null}

          {leaf ? (
            <img
              src={leaf}
              alt=""
              className="absolute bottom-2 right-[175px] w-20 opacity-55"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
