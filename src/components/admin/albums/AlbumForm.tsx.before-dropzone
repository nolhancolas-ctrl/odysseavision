import Link from "next/link";
import type { Client, ClientAlbum } from "@prisma/client";

type AlbumWithClient = ClientAlbum & {
  client: Client | null;
};

type AlbumFormProps = {
  album?: AlbumWithClient | null;
  clients: Client[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function AlbumForm({
  album,
  clients,
  action,
  submitLabel,
}: AlbumFormProps) {
  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-6 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
            Title
          </label>
          <input
            name="title"
            required
            defaultValue={album?.title ?? ""}
            className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
            placeholder="Whales of Ningaloo"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
            Slug
          </label>
          <input
            name="slug"
            defaultValue={album?.slug ?? ""}
            className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
            placeholder="whales-of-ningaloo"
          />
          <p className="mt-2 text-xs text-[#242617]/35">
            Leave empty to generate it from the title.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
            Description
          </label>
          <textarea
            name="description"
            rows={5}
            defaultValue={album?.description ?? ""}
            className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm leading-6 text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
            placeholder="Private gallery description shown to the client."
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
            Cover image
          </label>
          <input
            name="coverSrc"
            defaultValue={album?.coverSrc ?? ""}
            className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
            placeholder="/images/client-albums/album_01.png"
          />

          {album?.coverSrc ? (
            <div
              className="mt-5 aspect-[4/3] rounded-3xl bg-[#e8dfcf] bg-cover bg-center"
              style={{ backgroundImage: `url(${album.coverSrc})` }}
            />
          ) : null}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="space-y-4 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              Status
            </label>
            <select
              name="status"
              defaultValue={album?.status ?? "DRAFT"}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              Existing client
            </label>
            <select
              name="clientId"
              defaultValue={album?.clientId ?? ""}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
            >
              <option value="">No client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName ?? ""}
                  {client.email ? ` — ${client.email}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-[#242617]/10 p-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              Or create new client
            </p>

            <div className="grid gap-3">
              <input
                name="newClientFirstName"
                className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                placeholder="First name"
              />

              <input
                name="newClientLastName"
                className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                placeholder="Last name"
              />

              <input
                name="newClientEmail"
                type="email"
                className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                Shooting date
              </label>
              <input
                type="date"
                name="shootingDate"
                defaultValue={
                  album?.shootingDate
                    ? album.shootingDate.toISOString().slice(0, 10)
                    : ""
                }
                className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                Expires at
              </label>
              <input
                type="date"
                name="expiresAt"
                defaultValue={
                  album?.expiresAt
                    ? album.expiresAt.toISOString().slice(0, 10)
                    : ""
                }
                className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              Location
            </label>
            <input
              name="location"
              defaultValue={album?.location ?? ""}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
              placeholder="Ningaloo"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              Password
            </label>
            <input
              name="password"
              type="password"
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
              placeholder={album?.passwordHash ? "Leave empty to keep current password" : "Set album password"}
            />

            {album?.passwordHash ? (
              <label className="mt-3 flex items-center gap-3 text-sm text-[#242617]/60">
                <input
                  type="checkbox"
                  name="clearPassword"
                  className="h-4 w-4 accent-[#b88a3b]"
                />
                Remove current password
              </label>
            ) : null}
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617]/70">
            <input
              type="checkbox"
              name="allowDownload"
              defaultChecked={album?.allowDownload ?? false}
              className="h-4 w-4 accent-[#b88a3b]"
            />
            Allow downloads
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617]/70">
            <input
              type="checkbox"
              name="allowShare"
              defaultChecked={album?.allowShare ?? true}
              className="h-4 w-4 accent-[#b88a3b]"
            />
            Allow sharing
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full bg-[#071008] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008]"
          >
            {submitLabel}
          </button>

          <Link
            href="/admin/albums"
            className="rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#b88a3b]/60 hover:text-[#b88a3b]"
          >
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
