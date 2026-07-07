import Link from "next/link";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { deleteClientAlbum } from "@/server/actions/albums";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminAlbumsPage() {
  const [albums, clients] = await Promise.all([
    db.clientAlbum.findMany({
      include: {
        client: true,
        _count: {
          select: { images: true },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    db.client.findMany({
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
  ]);

  const publishedCount = albums.filter(
    (album) => album.status === "PUBLISHED",
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Create & manage
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617] md:text-6xl">
            Client albums
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-[#242617]/55 md:text-base md:leading-8">
            Create private galleries, manage client access, passwords, album
            covers, downloads and publication status.
          </p>
        </div>

        <Link
          href="/admin/albums/new"
          className="rounded-full bg-[#071008] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008]"
        >
          Create album
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Total albums
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {albums.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Published
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Clients
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {clients.length}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="flex items-center justify-between gap-5 border-b border-[#242617]/10 p-6">
          <h2 className="font-serif text-3xl text-[#242617]">
            Albums
          </h2>

          <Link
            href="/admin/albums/new"
            className="rounded-full border border-[#242617]/15 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/50 transition hover:border-[#b88a3b]/60 hover:text-[#b88a3b]"
          >
            Create album
          </Link>
        </div>

        {albums.length === 0 ? (
          <div className="p-8 text-sm text-[#242617]/55">
            No client albums yet. Create your first private gallery.
          </div>
        ) : (
          <div className="divide-y divide-[#242617]/10">
            {albums.map((album) => (
              <article
                key={album.id}
                className="grid gap-5 p-5 md:grid-cols-[150px_1fr_auto]"
              >
                <div
                  className="aspect-[4/3] rounded-2xl bg-[#e8dfcf] bg-cover bg-center"
                  style={{
                    backgroundImage: album.coverSrc
                      ? `url(${album.coverSrc})`
                      : undefined,
                  }}
                />

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/50">
                      {album.status}
                    </span>

                    {album.passwordHash ? (
                      <span className="rounded-full border border-[#b88a3b]/30 bg-[#b88a3b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b88a3b]">
                        Password
                      </span>
                    ) : null}

                    {album.allowDownload ? (
                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        Downloads
                      </span>
                    ) : null}

                    {album.externalDownloadUrl ? (
                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        External link
                      </span>
                    ) : null}

                    {album.client ? (
                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        {album.client.firstName} {album.client.lastName ?? ""}
                      </span>
                    ) : null}

                    <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                      {album._count.images} photos
                    </span>
                  </div>

                  <h2 className="font-serif text-3xl uppercase leading-none text-[#242617]">
                    {album.title}
                  </h2>

                  <p className="mt-2 text-xs text-[#242617]/35">
                    /client-albums/{album.slug}
                  </p>

                  {album.description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#242617]/55">
                      {album.description}
                    </p>
                  ) : null}

                  <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#242617]/35">
                    {album.location ? album.location : "No location"}
                    {album.shootingDate
                      ? ` · ${album.shootingDate.toISOString().slice(0, 10)}`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-col items-stretch gap-2 md:items-end">
                  <Link
                    href={`/client-albums/${album.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-full border border-[#242617]/15 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b] md:w-28"
                  >
                    Preview
                  </Link>

                  <Link
                    href={`/admin/albums/${album.id}`}
                    className="w-full rounded-full border border-[#242617]/15 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b] md:w-28"
                  >
                    Edit
                  </Link>

                  <form action={deleteClientAlbum.bind(null, album.id)}>
                    <ConfirmSubmitButton
                      className="w-full rounded-full border border-red-900/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800/40 hover:text-red-900 md:w-28"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
