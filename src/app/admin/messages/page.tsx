import Link from "next/link";
import { getMessageCenterData } from "@/lib/admin/insights";

export const dynamic = "force-dynamic";

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#242617]/45">
        {label}
      </p>
      <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
        {value}
      </p>
      <p className="mt-3 text-sm text-[#2b6b3c]">{detail}</p>
    </article>
  );
}

function statusClass(status: string) {
  if (status === "New") {
    return "bg-[#f3dfb8] text-[#8a6314]";
  }

  if (status === "Archived") {
    return "bg-[#e8d6d1] text-[#8a3d2f]";
  }

  return "bg-[#d9ead5] text-[#286235]";
}

export default async function AdminMessagesPage() {
  const data = await getMessageCenterData();

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Inbox
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-[#242617] md:text-6xl">
            Messages
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Review every contact request and reply directly from your mailbox.
          </p>
        </div>

        <Link
          href="/admin/forms"
          className="rounded-full bg-[#071321] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4efe4] transition hover:bg-[#142844]"
        >
          Forms settings
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total messages" value={data.total} detail="All submissions" />
        <MetricCard label="New" value={data.newCount} detail="Waiting for review" />
        <MetricCard label="This week" value={data.thisWeek} detail="Recent messages" />
      </section>

      <section className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
              Message center
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#242617]">
              All messages
            </h2>
          </div>
          <p className="text-sm text-[#242617]/45">
            Reply opens your default email app.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {data.messages.length > 0 ? (
            data.messages.map((message) => {
              const canReply = message.email && message.email !== "No email";
              const replyHref = canReply
                ? `mailto:${message.email}?subject=${encodeURIComponent(
                    `Re: ${message.subject}`
                  )}&body=${encodeURIComponent(`Hi ${message.name},\n\n`)}`
                : "";

              return (
                <article
                  key={message.id}
                  className="rounded-[1.75rem] border border-[#242617]/8 bg-[#f4efe4]/55 p-5"
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-serif text-2xl leading-tight text-[#242617]">
                          {message.subject}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass(
                            message.status
                          )}`}
                        >
                          {message.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-[#242617]/60">
                        {message.name} · {message.email}
                        {message.phone ? ` · ${message.phone}` : ""}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#242617]/35">
                        {message.date}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                      {canReply ? (
                        <a
                          href={replyHref}
                          className="rounded-full bg-[#071321] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4efe4] transition hover:bg-[#142844]"
                        >
                          Reply
                        </a>
                      ) : null}

                      {canReply ? (
                        <a
                          href={`mailto:${message.email}`}
                          className="rounded-full border border-[#242617]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#242617]/60 transition hover:bg-white"
                        >
                          Email
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-5 whitespace-pre-wrap rounded-3xl border border-[#242617]/8 bg-white/45 p-4 text-sm leading-7 text-[#242617]/65">
                    {message.message}
                  </p>
                </article>
              );
            })
          ) : (
            <p className="rounded-3xl border border-[#242617]/8 bg-[#f4efe4]/55 p-5 text-sm text-[#242617]/45">
              No message yet.
            </p>
          )}
        </div>
      </section>

      {!data.available ? (
        <p className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 text-sm text-[#242617]/55">
          Contact message storage is not available yet.
        </p>
      ) : null}
    </div>
  );
}
