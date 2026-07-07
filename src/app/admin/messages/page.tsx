import Link from "next/link";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { db } from "@/lib/db";
import {
  archiveContactMessage,
  markContactMessageRead,
  markContactMessageUnread,
  unarchiveContactMessage,
} from "@/server/actions/messages";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getFilter(value: string | string[] | undefined) {
  const filter = Array.isArray(value) ? value[0] : value;

  if (filter === "new" || filter === "archived" || filter === "week") {
    return filter;
  }

  return "all";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function normalizeStatus(status: string) {
  if (status === "ARCHIVED") return "Archived";
  if (status === "READ") return "Read";
  return "New";
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

function filterLabel(filter: string) {
  if (filter === "new") return "New messages";
  if (filter === "archived") return "Archived messages";
  if (filter === "week") return "This week";
  return "All messages";
}

function MetricCard({
  label,
  value,
  detail,
  href,
  active,
}: {
  label: string;
  value: string | number;
  detail: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-[2rem] border p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)] transition hover:-translate-y-0.5 hover:bg-white/65 ${
        active
          ? "border-[#b88a3b]/45 bg-white/70"
          : "border-[#242617]/10 bg-white/45"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#242617]/45">
        {label}
      </p>
      <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
        {value}
      </p>
      <p className="mt-3 text-sm text-[#2b6b3c]">{detail}</p>
    </Link>
  );
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const activeFilter = getFilter(params.filter);

  const messages = await db.contactMessage.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = messages.length;
  const newCount = messages.filter((message) => message.status === "NEW").length;
  const archivedCount = messages.filter(
    (message) => message.status === "ARCHIVED",
  ).length;
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = messages.filter(
    (message) => message.createdAt.getTime() >= oneWeekAgo,
  ).length;

  const filteredMessages = messages.filter((message) => {
    if (activeFilter === "new") return message.status === "NEW";
    if (activeFilter === "archived") return message.status === "ARCHIVED";
    if (activeFilter === "week") return message.createdAt.getTime() >= oneWeekAgo;

    return true;
  });

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
            Review contact requests, mark them as read, archive them and reply
            directly from your mailbox.
          </p>
        </div>

        <Link
          href="/admin/forms"
          className="rounded-full bg-[#071321] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4efe4] transition hover:bg-[#142844]"
        >
          Forms settings
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Total messages"
          value={total}
          detail="All submissions"
          href="/admin/messages"
          active={activeFilter === "all"}
        />
        <MetricCard
          label="New"
          value={newCount}
          detail="Waiting for review"
          href="/admin/messages?filter=new"
          active={activeFilter === "new"}
        />
        <MetricCard
          label="Archived"
          value={archivedCount}
          detail="Stored away"
          href="/admin/messages?filter=archived"
          active={activeFilter === "archived"}
        />
        <MetricCard
          label="This week"
          value={thisWeek}
          detail="Recent messages"
          href="/admin/messages?filter=week"
          active={activeFilter === "week"}
        />
      </section>

      <section className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
              Message center
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#242617]">
              {filterLabel(activeFilter)}
            </h2>
          </div>

          <p className="text-sm text-[#242617]/45">
            Showing {filteredMessages.length} of {total} messages.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message) => {
              const status = normalizeStatus(message.status);
              const subject = message.projectType || "Contact request";
              const name = message.name || "Unknown sender";
              const email = message.email || "No email";
              const canReply = Boolean(message.email);

              const replyHref = canReply
                ? `mailto:${message.email}?subject=${encodeURIComponent(
                    `Re: ${subject}`,
                  )}&body=${encodeURIComponent(`Hi ${message.name || ""},\n\n`)}`
                : "";

              return (
                <article
                  key={message.id}
                  className={`rounded-[1.75rem] border p-5 transition ${
                    status === "Archived"
                      ? "border-[#242617]/6 bg-[#f4efe4]/35 opacity-75"
                      : "border-[#242617]/8 bg-[#f4efe4]/55"
                  }`}
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-serif text-2xl leading-tight text-[#242617]">
                          {subject}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-[#242617]/60">
                        {name} · {email}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#242617]/35">
                        {formatDate(message.createdAt)}
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

                      {message.status !== "ARCHIVED" ? (
                        message.status === "NEW" ? (
                          <form action={markContactMessageRead.bind(null, message.id)}>
                            <button
                              type="submit"
                              className="cursor-pointer rounded-full border border-[#242617]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#242617]/60 transition hover:bg-white"
                            >
                              Mark read
                            </button>
                          </form>
                        ) : (
                          <form action={markContactMessageUnread.bind(null, message.id)}>
                            <button
                              type="submit"
                              className="cursor-pointer rounded-full border border-[#242617]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#242617]/60 transition hover:bg-white"
                            >
                              Mark unread
                            </button>
                          </form>
                        )
                      ) : null}

                      {message.status === "ARCHIVED" ? (
                        <form action={unarchiveContactMessage.bind(null, message.id)}>
                          <button
                            type="submit"
                            className="cursor-pointer rounded-full border border-[#242617]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#242617]/60 transition hover:bg-white"
                          >
                            Unarchive
                          </button>
                        </form>
                      ) : (
                        <form action={archiveContactMessage.bind(null, message.id)}>
                          <ConfirmSubmitButton
                            className="cursor-pointer rounded-full border border-red-900/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-900/60 transition hover:bg-red-900 hover:text-white"
                          >
                            Archive
                          </ConfirmSubmitButton>
                        </form>
                      )}
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
              No message in this filter.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
