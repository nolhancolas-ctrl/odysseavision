import Link from "next/link";
import { deleteClient } from "@/server/actions/clients";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const clients = await db.client.findMany({
    include: {
      _count: {
        select: { albums: true },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const activeCount = clients.filter((client) => client.active).length;
  const albumCount = clients.reduce(
    (total, client) => total + client._count.albums,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Create & manage
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617] md:text-6xl">
            Clients
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-[#242617]/55 md:text-base md:leading-8">
            Manage client profiles, contact details, notes and linked private
            galleries from one clean workspace.
          </p>
        </div>

        <Link
          href="/admin/clients/new"
          className="rounded-full bg-[#071008] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008]"
        >
          Add client
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Total clients
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {clients.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Active
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {activeCount}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#242617]/40">
            Linked albums
          </p>
          <p className="mt-8 font-serif text-5xl text-[#242617]">
            {albumCount}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="flex items-center justify-between gap-5 border-b border-[#242617]/10 p-6">
          <h2 className="font-serif text-3xl text-[#242617]">
            Client list
          </h2>

          <Link
            href="/admin/clients/new"
            className="rounded-full border border-[#242617]/15 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/50 transition hover:border-[#b88a3b]/60 hover:text-[#b88a3b]"
          >
            Add client
          </Link>
        </div>

        {clients.length === 0 ? (
          <div className="p-8 text-sm text-[#242617]/55">
            No clients yet. Create your first client profile.
          </div>
        ) : (
          <div className="divide-y divide-[#242617]/10">
            {clients.map((client) => {
              const fullName = `${client.firstName} ${
                client.lastName ?? ""
              }`.trim();

              return (
                <article
                  key={client.id}
                  className="grid gap-5 p-5 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/50">
                        {client.active ? "Active" : "Inactive"}
                      </span>

                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        {client.language}
                      </span>

                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        {client._count.albums} albums
                      </span>
                    </div>

                    <h2 className="font-serif text-3xl uppercase leading-none text-[#242617]">
                      {fullName}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#242617]/55">
                      {client.email ? <span>{client.email}</span> : null}
                      {client.phone ? <span>{client.phone}</span> : null}
                    </div>

                    {client.notes ? (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#242617]/55">
                        {client.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-start gap-3 md:justify-end">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="rounded-full border border-[#242617]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
                    >
                      Edit
                    </Link>

                    <form action={deleteClient.bind(null, client.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-red-900/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800/40 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
