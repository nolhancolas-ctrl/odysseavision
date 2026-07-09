import Link from "next/link";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import type { PublicClientAlbum } from "@/lib/content/albums";
import type { PublicSectionContent } from "@/lib/content/site";

type ClientAlbumsRecentProps = {
  content?: PublicSectionContent;
  albums: PublicClientAlbum[];
};

export function ClientAlbumsRecent({
  content,
  albums,
}: ClientAlbumsRecentProps) {
  const ornament =
    content?.images.ornament || "/images/client-albums/ocean_icon_01.png";

  return (
    <section
      id="recent-client-albums"
      className="relative overflow-hidden bg-[#11190f] px-6 py-16 text-[#f4efe4] md:px-14 md:py-20"
    >
      {ornament ? (
        <img
          src={ornament}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-35 left-10 hidden w-85 opacity-15 md:block"
        />
      ) : null}

      <div className="relative mx-auto max-w-[1450px]">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
            {content?.eyebrow || "Recent client albums"}
          </p>

          <div className="mx-auto mt-5 h-px w-12 bg-white/35" />
        </div>

        {albums.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {albums.slice(0, 4).map((album) => (
              <article key={album.slug} className="text-center">
                <Link href={album.href} className="group block">
                  <div
                    className="relative aspect-[1.35] overflow-hidden bg-[#273023] bg-cover bg-center transition duration-700 group-hover:scale-[1.02]"
                    style={{
                      backgroundImage: `url(${album.coverSrc})`,
                    }}
                  >
                    <FrameWatermark />
                  </div>

                  <h2 className="mt-6 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
                    {album.title}
                  </h2>

                  <p className="mt-3 text-[10px] text-white/45">
                    {album.date || "Private gallery"} &nbsp; · &nbsp;{" "}
                    {album.photoCount} photos
                  </p>

                  <span className="mt-6 inline-block border border-white/35 px-7 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/75 transition group-hover:bg-white group-hover:text-[#11190f]">
                    View album
                  </span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-sm text-white/45">
            No client albums published yet.
          </p>
        )}

        <div className="mt-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/75">
            {content?.title || "Can’t find your gallery?"}
          </p>

          <p className="mt-3 text-sm text-white/45">
            {content?.description || "Send us a message and we’ll help you out."}
          </p>

          <Link
            href="/contact"
            className="mt-7 inline-block border border-white/35 px-10 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:bg-white hover:text-[#11190f]"
          >
            {content?.ctaLabel || "Contact us"}
          </Link>
        </div>
      </div>
    </section>
  );
}
