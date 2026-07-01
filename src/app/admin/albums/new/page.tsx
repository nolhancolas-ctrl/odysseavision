import { AlbumForm } from "@/components/admin/albums/AlbumForm";
import { createClientAlbum } from "@/server/actions/albums";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewAlbumPage() {
  const clients = await db.client.findMany({
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
          New album
        </p>
        <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617]">
          Create album
        </h1>
      </div>

      <AlbumForm
        clients={clients}
        action={createClientAlbum}
        submitLabel="Create album"
      />
    </div>
  );
}
