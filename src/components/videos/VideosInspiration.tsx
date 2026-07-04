import Link from "next/link";
import { videosImages } from "@/data/videos";
import type { PublicSectionContent } from "@/lib/content/site";

type VideosInspirationProps = {
  content?: PublicSectionContent;
};

export function VideosInspiration({ content }: VideosInspirationProps) {
  const images = [
    content?.images.image01 || videosImages.inspiration01.src,
    content?.images.image02 || videosImages.inspiration02.src,
    content?.images.image03 || videosImages.inspiration03.src,
    content?.images.image04 || videosImages.inspiration04.src,
    content?.images.image05 || videosImages.inspiration05.src,
  ].filter(Boolean);

  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 md:px-14">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[0.65fr_1.35fr]">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#242617]/55">
            {content?.eyebrow || "What inspires us"}
          </p>

          <h2 className="mt-5 font-serif text-4xl uppercase leading-[1.05]">
            {content?.title || "Stories, places & people."}
          </h2>

          <div className="my-6 h-px w-10 bg-[#242617]/35" />

          <p className="max-w-sm text-sm leading-7 text-[#242617]/65">
            {content?.description ||
              "We love creating films that bring you closer to the wild places we explore and the stories that deserve to be told."}
          </p>

          <Link
            href="/stories"
            className="mt-7 inline-block bg-[#414832] px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-white"
          >
            {content?.ctaLabel || "Follow our journey →"}
          </Link>
        </div>

        <div className="grid h-[330px] grid-cols-5 overflow-hidden">
          {images.map((image, index) => (
            <div
              key={image}
              className={`bg-cover bg-center ${
                index % 2 === 0 ? "translate-y-4" : "-translate-y-2"
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
