import Link from "next/link";
import { featuredImages } from "@/data/portfolio";

function ImageTile({
  src,
  className,
}: {
  src: string;
  className: string;
}) {
  return (
    <div
      className={`bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}

export function PortfolioFeatured() {
  return (
    <section className="bg-[#11190f] px-6 py-16 text-[#f4efe4] md:px-14">
      <div className="mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[250px_1fr]">
        <div className="flex flex-col justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
            Featured gallery
          </p>
          <h2 className="mt-4 font-serif text-4xl uppercase">Wildlife</h2>
          <div className="my-5 h-px w-10 bg-white/35" />
          <p className="max-w-[190px] text-xs leading-6 text-white/60">
            Quiet encounters, fleeting moments and a deep respect for all living
            creatures.
          </p>

          <Link
            href="/portfolio/wildlife"
            className="mt-8 w-fit border border-white/35 px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.18em]"
          >
            View full gallery →
          </Link>
        </div>

        <div className="grid min-h-[510px] grid-cols-12 grid-rows-2 gap-2">
          <ImageTile src={featuredImages[0].src} className="col-span-7" />
          <ImageTile src={featuredImages[1].src} className="col-span-5" />
          <ImageTile src={featuredImages[2].src} className="col-span-3" />
          <ImageTile src={featuredImages[3].src} className="col-span-4" />
          <ImageTile src={featuredImages[4].src} className="col-span-2" />
          <ImageTile src={featuredImages[5].src} className="col-span-3" />
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-4xl text-center font-hand text-xl text-white/55">
        The best wildlife moments are the ones you never planned.
      </p>
    </section>
  );
}
