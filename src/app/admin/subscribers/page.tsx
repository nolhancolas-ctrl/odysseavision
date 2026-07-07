import {
  addNewsletterSubscriber,
  deleteNewsletterSubscriber,
  importNewsletterSubscribers,
  setNewsletterSubscriberActive,
} from "@/server/actions/subscribers";
import { db } from "@/lib/db";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getStatusMessage(params: Record<string, string | string[] | undefined>) {
  const status = params.subscribers;
  const count = params.count;

  if (status === "added") return "Subscriber added.";
  if (status === "updated") return "Subscriber updated.";
  if (status === "deleted") return "Subscriber deleted.";
  if (status === "invalid-email") return "Please enter a valid email address.";
  if (status === "empty-import") return "No valid email address found in import.";
  if (status === "imported") return `${count || "Some"} subscribers imported.`;

  return "";
}

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const message = getStatusMessage(params);

  const subscribers = await db.newsletterSubscriber.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const activeCount = subscribers.filter((subscriber) => subscriber.active).length;
  const inactiveCount = subscribers.length - activeCount;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b88a3b]">
            Newsletter
          </p>
          <h1 className="mt-3 font-serif text-4xl text-[#242617]">
            Subscribers
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#242617]/60">
            Manage the audience used by newsletter campaigns.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-[1.5rem] border border-[#242617]/10 bg-white/45 px-5 py-4">
            <p className="text-2xl font-semibold text-[#242617]">
              {subscribers.length}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/45">
              Total
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[#242617]/10 bg-white/45 px-5 py-4">
            <p className="text-2xl font-semibold text-[#242617]">
              {activeCount}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/45">
              Active
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[#242617]/10 bg-white/45 px-5 py-4">
            <p className="text-2xl font-semibold text-[#242617]">
              {inactiveCount}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/45">
              Inactive
            </p>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/50 px-5 py-4 text-sm text-[#242617]/65 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <form
          action={addNewsletterSubscriber}
          className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_22px_70px_rgba(20,20,10,0.07)]"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
            Add subscriber
          </p>
          <label className="mt-5 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-2 w-full rounded-[1.4rem] border border-[#242617]/10 bg-[#f4efe4]/70 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]"
            />
          </label>

          <button
            type="submit"
            className="mt-5 cursor-pointer rounded-full bg-[#242617] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b]"
          >
            Add subscriber
          </button>
        </form>

        <form
          action={importNewsletterSubscribers}
          encType="multipart/form-data"
          className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_22px_70px_rgba(20,20,10,0.07)]"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
            Import CSV
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
                CSV file
              </span>
              <input
                name="csvFile"
                type="file"
                accept=".csv,text/csv,text/plain"
                className="mt-2 w-full rounded-[1.4rem] border border-[#242617]/10 bg-[#f4efe4]/70 px-4 py-3 text-sm text-[#242617] file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#242617] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-[#f4efe4]"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
                Or paste emails
              </span>
              <textarea
                name="csvText"
                rows={4}
                placeholder="email@example.com, hello@example.com"
                className="mt-2 w-full resize-none rounded-[1.4rem] border border-[#242617]/10 bg-[#f4efe4]/70 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-5 cursor-pointer rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/70 transition hover:bg-[#242617] hover:text-[#f4efe4]"
          >
            Import subscribers
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-4 shadow-[0_22px_70px_rgba(20,20,10,0.07)]">
        <div className="overflow-hidden rounded-[1.6rem] border border-[#242617]/10">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#242617] text-[#f4efe4]">
              <tr>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em]">
                  Email
                </th>
                <th className="hidden px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] md:table-cell">
                  Source
                </th>
                <th className="hidden px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] lg:table-cell">
                  Created
                </th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em]">
                  Status
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.16em]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#242617]/10">
              {subscribers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-[#242617]/50"
                  >
                    No subscribers yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="bg-[#f4efe4]/45">
                    <td className="px-5 py-4 font-medium text-[#242617]">
                      {subscriber.email}
                    </td>
                    <td className="hidden px-5 py-4 text-[#242617]/55 md:table-cell">
                      {subscriber.source || "manual"}
                    </td>
                    <td className="hidden px-5 py-4 text-[#242617]/55 lg:table-cell">
                      {formatDate(subscriber.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-[#242617]/10 bg-white/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/60">
                        {subscriber.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <form
                          action={setNewsletterSubscriberActive.bind(
                            null,
                            subscriber.id,
                            !subscriber.active,
                          )}
                        >
                          <button
                            type="submit"
                            className="cursor-pointer rounded-full border border-[#242617]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/60 transition hover:bg-[#242617] hover:text-[#f4efe4]"
                          >
                            {subscriber.active ? "Disable" : "Enable"}
                          </button>
                        </form>

                        <form action={deleteNewsletterSubscriber.bind(null, subscriber.id)}>
                          <button
                            type="submit"
                            className="cursor-pointer rounded-full border border-red-900/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-red-900/60 transition hover:bg-red-900 hover:text-white"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
