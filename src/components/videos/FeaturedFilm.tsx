import { featuredFilm } from "@/data/videos";

export function FeaturedFilm() {
  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 md:px-14 md:py-20">
      <img
        src="/images/videos/featured_drawing_01.png"
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 hidden w-32 opacity-20 md:block"
      />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[250px_1fr]">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#242617]/55">
            Featured film
          </p>

          <h2 className="mt-5 font-serif text-4xl uppercase leading-[1.02]">
            {featuredFilm.title}
          </h2>

          <div className="my-6 h-px w-10 bg-[#242617]/35" />

          <p className="text-sm leading-7 text-[#242617]/65">
            {featuredFilm.description}
          </p>

          <a
            href="#featured-player"
            className="mt-7 inline-block bg-[#414832] px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-white"
          >
            Watch now →
          </a>
        </div>

        <video
          id="featured-player"
          controls
          preload="metadata"
          poster={featuredFilm.poster}
          className="aspect-video w-full bg-[#10170d] object-cover shadow-xl"
        >
          <source src={featuredFilm.video} type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
