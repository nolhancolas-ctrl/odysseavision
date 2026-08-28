import Link from "next/link";
import type { PublicClientAlbumSummary } from "@/lib/content/albums";

export function ClientAlbumCard({
  album,
}: {
  album: PublicClientAlbumSummary;
}) {
  const destinationLine = [
    album.date || "Private gallery",
    album.location,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="h-full text-center">
      <Link
        href={album.href}
        className="group flex h-full flex-col"
      >
        <div className="shrink-0 overflow-hidden bg-[#d8d1c4]">
          <div
            className="aspect-[1.35] bg-cover bg-center transition duration-700 group-hover:scale-[1.035]"
            style={{
              backgroundImage: `url(${album.coverSrc})`,
            }}
          />
        </div>

        <div className="mt-6 min-h-[3.75rem]">
          <h2 className="line-clamp-2 text-sm font-semibold uppercase leading-5 tracking-[0.08em] text-[#242617]/80">
            {album.title}
          </h2>

          <p
            title={destinationLine}
            className="mt-1.5 truncate text-[10px] uppercase leading-4 tracking-[0.12em] text-[#242617]/45"
          >
            {destinationLine}
          </p>
        </div>

        <span className="mx-auto mt-auto inline-block border border-[#242617]/30 px-7 py-3 pt-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#242617]/70 transition group-hover:bg-[#11190f] group-hover:text-[#f4efe4]">
          View album
        </span>
      </Link>
    </article>
  );
}
