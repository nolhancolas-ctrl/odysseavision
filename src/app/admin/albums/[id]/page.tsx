import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientAlbumGalleryBulkUploader } from "@/components/admin/albums/ClientAlbumGalleryBulkUploader";
import { ClientAlbumPhotoSorter } from "@/components/admin/albums/ClientAlbumPhotoSorter";
import { ClientAlbumSettingsForm } from "@/components/admin/albums/ClientAlbumSettingsForm";
import { updateClientAlbum } from "@/server/actions/albums";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type EditAlbumPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function singleParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function EditAlbumPage({
  params,
  searchParams,
}: EditAlbumPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const imported = singleParam(query, "imported");
  const saved = singleParam(query, "saved");
  const error = singleParam(query, "error");

  const [album, clients] = await Promise.all([
    db.clientAlbum.findUnique({
      where: { id },
      include: {
        client: true,
        images: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    }),
    db.client.findMany({
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
  ]);

  if (!album) notFound();

  const returnTo = `/admin/albums/${album.id}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
            Client gallery
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.05em] text-[#242617] md:text-6xl">
            Edit {album.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#242617]/50">
            Edit the album details, add photos and manage the gallery content
            from one place.
          </p>
          <p className="mt-2 text-xs text-[#242617]/35">
            {album.images.length} photos · /client-albums/{album.slug}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/client-albums/${album.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#242617]/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b] hover:text-[#242617]"
          >
            View public
          </Link>
          <Link
            href="/admin/albums"
            className="rounded-full border border-[#242617]/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b] hover:text-[#242617]"
          >
            Back
          </Link>
        </div>
      </header>

      {saved ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-800">
          Album settings saved successfully.
        </div>
      ) : null}

      {imported ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-800">
          {imported} photos added successfully.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          Error: {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr] xl:items-stretch">
        <ClientAlbumSettingsForm
          album={album}
          clients={clients}
          action={updateClientAlbum.bind(null, album.id)}
          returnTo={returnTo}
        />

        <ClientAlbumGalleryBulkUploader
          existingImageUrls={album.images.map((image) => image.imageSrc)}
          albumId={album.id}
          albumSlug={album.slug}
          returnTo={returnTo}
        />
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_22px_70px_rgba(20,20,10,0.07)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#242617]/10 px-6 py-5 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
              Gallery content
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#242617]">
              Photos
            </h2>
          </div>

          <p className="text-xs uppercase tracking-[0.16em] text-[#242617]/40">
            {album.images.length} items
          </p>
        </div>

        {album.images.length === 0 ? (
          <div className="p-8 text-sm text-[#242617]/50">
            No photos in this album yet. Upload photos above to start filling
            the gallery.
          </div>
        ) : (
          <ClientAlbumPhotoSorter
            albumId={album.id}
            initialItems={album.images.map((image, index) => ({
              id: image.id,
              imageSrc: image.imageSrc,
              title: image.title || image.alt || `Photo ${index + 1}`,
              watermark: image.watermark,
              order: image.order,
            }))}
          />
        )}
      </section>
    </div>
  );
}
