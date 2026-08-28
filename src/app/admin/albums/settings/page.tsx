import Link from "next/link";
import { ClientAlbumSettingsManager } from "@/components/admin/albums/ClientAlbumSettingsManager";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ClientAlbumSettingsPage() {
  const albums = await db.clientAlbum.findMany({
    include: {
      _count: {
        select: { images: true },
      },
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const totalPhotos = albums.reduce(
    (total, album) => total + album._count.images,
    0,
  );
  const publishedCount = albums.filter(
    (album) => album.status === "PUBLISHED",
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Client gallery configuration
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617]">
            Client Album settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#242617]/55">
            Organize the public order of Client Albums. Changes are saved
            automatically.
          </p>
        </div>

        <Link
          href="/admin/albums"
          className="inline-flex items-center justify-center rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#071321] hover:bg-[#071321] hover:text-white"
        >
          Back to Client Albums
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Total albums", albums.length],
          ["Published", publishedCount],
          ["Total photos", totalPhotos],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[#242617]/45">
              {label}
            </p>
            <p className="mt-3 font-serif text-4xl text-[#242617]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="border-b border-[#242617]/10 p-5 md:px-6 md:py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b88a3b]">
            Public galleries
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#242617]">
            Client Album order
          </h2>
        </div>

        <div className="p-5 md:p-6">
          {albums.length ? (
            <ClientAlbumSettingsManager
              initialItems={albums.map((album) => ({
                id: album.id,
                title: album.title,
                slug: album.slug,
                coverSrc: album.coverSrc ?? "",
                status: album.status,
                location: album.location ?? "",
                photoCount: album._count.images,
                order: album.order,
              }))}
            />
          ) : (
            <p className="text-sm text-[#242617]/45">
              No Client Albums are available yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
