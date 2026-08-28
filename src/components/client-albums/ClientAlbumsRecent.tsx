"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicClientAlbumSummary } from "@/lib/content/albums";
import type { PublicSectionContent } from "@/lib/content/site";
import { ClientAlbumCard } from "./ClientAlbumCard";

type ClientAlbumsRecentProps = {
  content?: PublicSectionContent;
  albums: PublicClientAlbumSummary[];
};

const INITIAL_ALBUM_COUNT = 4;
const ALBUM_INCREMENT = 4;

export function ClientAlbumsRecent({
  content,
  albums,
}: ClientAlbumsRecentProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_ALBUM_COUNT);
  const visibleAlbums = albums.slice(0, visibleCount);
  const hasMore = visibleCount < albums.length;

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

        {visibleAlbums.length > 0 ? (
          <>
            <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {visibleAlbums.map((album) => (
                <ClientAlbumCard key={album.slug} album={album} />
              ))}
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
              {hasMore ? (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((current) =>
                      Math.min(current + ALBUM_INCREMENT, albums.length),
                    )
                  }
                  className="border border-[#242617]/30 px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#242617]/65 transition hover:bg-[#242617] hover:text-[#f4efe4]"
                >
                  Show more
                </button>
              ) : null}

              <Link
                href="/client-albums/archive"
                className="bg-[#242617] px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b]"
              >
                View all
              </Link>
            </div>

            <p className="mt-5 text-center text-[10px] uppercase tracking-[0.14em] text-[#242617]/35">
              Showing {visibleAlbums.length} of {albums.length} albums
            </p>
          </>
        ) : (
          <p className="mt-12 text-center text-sm text-[#242617]/50">
            No client albums published yet.
          </p>
        )}
      </div>
    </section>
  );
}
