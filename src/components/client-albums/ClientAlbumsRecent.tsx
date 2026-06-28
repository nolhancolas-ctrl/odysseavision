import Link from "next/link";
import { clientAlbums } from "@/data/clients";

export function ClientAlbumsRecent() {
  return (
    <section
      id="recent-client-albums"
      className="relative overflow-hidden bg-[#11190f] px-6 py-16 text-[#f4efe4] md:px-14 md:py-20"
    >
      <img
        src="/images/about/ocean_icon_04.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-70 left-0 hidden w-125 opacity-15 md:block"
      />

      <div className="relative mx-auto max-w-[1450px]">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
            Recent client albums
          </p>

          <div className="mx-auto mt-5 h-px w-12 bg-white/35" />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {clientAlbums.map((album) => (
            <article key={album.slug} className="text-center">
              <Link href={album.href} className="group block">
                <div
                  className="aspect-[1.35] bg-[#273023] bg-cover bg-center transition duration-700 group-hover:scale-[1.02]"
                  style={{
                    backgroundImage: `url(${album.cover.src})`,
                  }}
                />

                <h2 className="mt-6 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
                  {album.title}
                </h2>

                <p className="mt-3 text-[10px] text-white/45">
                  {album.date} &nbsp; · &nbsp; {album.photoCount} photos
                </p>

                <span className="mt-6 inline-block border border-white/35 px-7 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/75 transition group-hover:bg-white group-hover:text-[#11190f]">
                  View album
                </span>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/75">
            Can’t find your gallery?
          </p>

          <p className="mt-3 text-sm text-white/45">
            Send us a message and we’ll help you out.
          </p>

          <Link
            href="/contact"
            className="mt-7 inline-block border border-white/35 px-10 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:bg-white hover:text-[#11190f]"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
