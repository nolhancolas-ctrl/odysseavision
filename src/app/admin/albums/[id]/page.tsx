import { notFound } from "next/navigation";
import { AlbumForm } from "@/components/admin/albums/AlbumForm";
import { updateClientAlbum } from "@/server/actions/albums";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type EditAlbumPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAlbumPage({ params }: EditAlbumPageProps) {
  const { id } = await params;

  const [album, clients] = await Promise.all([
    db.clientAlbum.findUnique({
      where: { id },
      include: { client: true },
    }),
    db.client.findMany({
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
  ]);

  if (!album) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
          Edit album
        </p>
        <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617]">
          {album.title}
        </h1>
      </div>

      <AlbumForm
        album={album}
        clients={clients}
        action={updateClientAlbum.bind(null, album.id)}
        submitLabel="Save changes"
      />
    </div>
  );
}
