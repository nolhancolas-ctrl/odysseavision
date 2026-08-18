import Link from "next/link";
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
  return (
    <section
      id="recent-client-albums"
      className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 text-[#242617] md:px-14 md:py-20"
    >
      <div className="relative mx-auto max-w-[1450px]">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#242617]/55">
            {content?.eyebrow || "Recent client albums"}
          </p>

          <div className="mx-auto mt-5 h-px w-12 bg-[#242617]/25" />
        </div>

        {albums.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {albums.slice(0, 4).map((album) => (
              <article key={album.slug} className="text-center">
                <Link href={album.href} className="group block">
                  <div
                    className="aspect-[1.35] bg-[#d8d1c4] bg-cover bg-center transition duration-700 group-hover:scale-[1.02]"
                    style={{
                      backgroundImage: `url(${album.coverSrc})`,
                    }}
                  />

                  <h2 className="mt-6 text-sm font-semibold uppercase tracking-[0.08em] text-[#242617]/80">
                    {album.title}
                  </h2>

                  <p className="mt-3 text-[10px] text-[#242617]/50">
                    {album.date || "Private gallery"} &nbsp; · &nbsp;{" "}
                    {album.photoCount} photos
                  </p>

                  <span className="mt-6 inline-block border border-[#242617]/30 px-7 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#242617]/70 transition group-hover:bg-[#11190f] group-hover:text-[#f4efe4]">
                    View album
                  </span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-sm text-[#242617]/50">
            No client albums published yet.
          </p>
        )}
      </div>
    </section>
  );
}
