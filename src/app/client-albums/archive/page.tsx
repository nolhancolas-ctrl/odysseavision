import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ClientAlbumCard } from "@/components/client-albums/ClientAlbumCard";
import { getPublicClientAlbumSummaries } from "@/lib/content/albums";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Album Archive | Odyssea Vision",
  description:
    "Browse the complete archive of published Odyssea Vision client galleries.",
};

export default async function ClientAlbumArchivePage() {
  const albums = await getPublicClientAlbumSummaries();

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Client Albums" />

      <section className="px-6 pb-16 pt-32 md:px-14 md:pb-20 md:pt-40">
        <div className="mx-auto max-w-[1450px]">
          <div className="flex flex-col justify-between gap-8 border-b border-[#242617]/15 pb-10 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b88a3b]">
                Client gallery archive
              </p>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.95] tracking-[-0.05em] md:text-7xl">
                All client albums
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-[#242617]/50">
                Browse every published client gallery, ordered from the most
                recent session to the oldest.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 md:items-end">
              <p className="text-xs uppercase tracking-[0.16em] text-[#242617]/40">
                {albums.length} album{albums.length === 1 ? "" : "s"}
              </p>
              <Link
                href="/client-albums#recent-client-albums"
                className="border border-[#242617]/30 px-7 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#242617]/65 transition hover:bg-[#242617] hover:text-[#f4efe4]"
              >
                Back to recent albums
              </Link>
            </div>
          </div>

          {albums.length > 0 ? (
            <div className="mt-14 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
              {albums.map((album) => (
                <ClientAlbumCard key={album.slug} album={album} />
              ))}
            </div>
          ) : (
            <p className="py-24 text-center text-sm text-[#242617]/50">
              No client albums published yet.
            </p>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
