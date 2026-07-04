import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) return "Not sent";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClass(status: string) {
  if (status === "SENT") {
    return "border-[#596044]/25 bg-[#596044]/10 text-[#596044]";
  }

  if (status === "READY") {
    return "border-[#b88a3b]/25 bg-[#d5ad68]/10 text-[#b88a3b]";
  }

  return "border-[#242617]/10 text-[#242617]/45";
}

export default async function AdminNewslettersPage() {
  const [campaigns, activeSubscribers] = await Promise.all([
    db.newsletterCampaign.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    }),
    db.newsletterSubscriber.count({
      where: {
        active: true,
      },
    }),
  ]);

  const draftCount = campaigns.filter((campaign) => campaign.status === "DRAFT").length;
  const readyCount = campaigns.filter((campaign) => campaign.status === "READY").length;
  const sentCount = campaigns.filter((campaign) => campaign.status === "SENT").length;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b88a3b]">
            Create & manage
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase leading-none text-[#242617] md:text-6xl">
            Newsletters
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Create, preview and send email newsletters to active subscribers.
          </p>
        </div>

        <Link
          href="/admin/newsletters/new"
          className="rounded-full bg-[#071321] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#f4efe4] hover:text-[#071321]"
        >
          Create newsletter
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#242617]/40">
            Drafts
          </p>
          <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
            {draftCount}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#242617]/40">
            Ready
          </p>
          <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
            {readyCount}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#242617]/40">
            Sent
          </p>
          <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
            {sentCount}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#242617]/40">
            Subscribers
          </p>
          <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
            {activeSubscribers}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="border-b border-[#242617]/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Archive
          </p>

          <h2 className="mt-2 font-serif text-3xl uppercase leading-none text-[#242617]">
            Created newsletters
          </h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-6 text-sm text-[#242617]/55">
            No newsletter created yet.
          </div>
        ) : (
          <div className="divide-y divide-[#242617]/10">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/admin/newsletters/${campaign.id}`}
                className="grid gap-5 p-6 transition hover:bg-[#f4efe4]/60 md:grid-cols-[1fr_160px_180px] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${statusClass(campaign.status)}`}
                    >
                      {campaign.status}
                    </span>

                    {campaign.recipientCount > 0 ? (
                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        {campaign.recipientCount} recipients
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 font-serif text-3xl uppercase leading-none text-[#242617]">
                    {campaign.title}
                  </h3>

                  <p className="mt-2 text-sm text-[#242617]/55">
                    {campaign.subject}
                  </p>
                </div>

                <p className="text-xs uppercase tracking-[0.16em] text-[#242617]/35">
                  Updated
                  <br />
                  {formatDate(campaign.updatedAt)}
                </p>

                <p className="text-xs uppercase tracking-[0.16em] text-[#242617]/35 md:text-right">
                  Sent
                  <br />
                  {formatDate(campaign.sentAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
