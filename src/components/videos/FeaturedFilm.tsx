import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { featuredFilm } from "@/data/videos";
import type { PublicVideo } from "@/lib/content/videos";

type FeaturedFilmProps = {
  video?: PublicVideo | null;
};

export function FeaturedFilm({ video }: FeaturedFilmProps) {
  const title = video?.title || featuredFilm.title;
  const description = video?.description || featuredFilm.description;
  const poster = video?.thumbnailSrc || featuredFilm.poster;
  const embedUrl = video?.embedUrl ?? "";
  const canPlay = Boolean(embedUrl && video?.playable);

  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 md:px-14 md:py-20">
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[250px_1fr]">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#242617]/55">
            Featured film
          </p>

          <h2 className="mt-5 font-serif text-4xl uppercase leading-[1.02]">
            {title}
          </h2>

          <div className="my-6 h-px w-10 bg-[#242617]/35" />

          <p className="text-sm leading-7 text-[#242617]/65">
            {description}
          </p>

          <a
            href="#featured-player"
            className="mt-7 inline-block bg-[#414832] px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-white"
          >
            Watch now →
          </a>
        </div>

        {canPlay ? (
          <iframe
            id="featured-player"
            src={embedUrl}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full bg-[#10170d] object-cover shadow-xl"
          />
        ) : (
          <div
            id="featured-player"
            className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-[#10170d] bg-cover bg-center shadow-xl"
            style={{ backgroundImage: `url(${poster})` }}
          >
            <div className="absolute inset-0 bg-[#071321]/75" />
            <FrameWatermark />

            <div className="relative px-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4]">
                Sorry
              </p>
              <p className="mt-2 max-w-md text-xs leading-5 text-[#f4efe4]/65">
                This video is not available yet. The owner has been notified.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
