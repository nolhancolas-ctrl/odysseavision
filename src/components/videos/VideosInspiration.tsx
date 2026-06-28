import Link from "next/link";
import { videosImages } from "@/data/videos";

const images = [
  videosImages.inspiration01,
  videosImages.inspiration02,
  videosImages.inspiration03,
  videosImages.inspiration04,
  videosImages.inspiration05,
];

export function VideosInspiration() {
  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 md:px-14">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[0.65fr_1.35fr]">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#242617]/55">
            What inspires us
          </p>

          <h2 className="mt-5 font-serif text-4xl uppercase leading-[1.05]">
            Stories, places
            <br />
            & people.
          </h2>

          <div className="my-6 h-px w-10 bg-[#242617]/35" />

          <p className="max-w-sm text-sm leading-7 text-[#242617]/65">
            We love creating films that bring you closer to the wild places we
            explore and the stories that deserve to be told.
          </p>

          <Link
            href="/stories"
            className="mt-7 inline-block bg-[#414832] px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-white"
          >
            Follow our journey →
          </Link>
        </div>

        <div className="grid h-[330px] grid-cols-5 overflow-hidden">
          {images.map((image, index) => (
            <div
              key={image.src}
              className={`bg-cover bg-center ${
                index % 2 === 0 ? "translate-y-4" : "-translate-y-2"
              }`}
              style={{ backgroundImage: `url(${image.src})` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
