import {
  deleteContactMessage,
  deleteNewsletterSubscriber,
  resetFormsSettings,
  setNewsletterSubscriberActive,
  updateContactMessageStatus,
  updateFormsSettings,
} from "@/server/actions/forms";
import { FormsSettingsEditor } from "@/components/admin/forms/FormsSettingsEditor";
import { getFormsSettings } from "@/lib/content/forms";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminFormsPage() {
  const [settings, messages, subscribers] = await Promise.all([
    getFormsSettings(),
    db.contactMessage.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    }),
    db.newsletterSubscriber.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 80,
    }),
  ]);

  const newMessages = messages.filter((message) => message.status === "NEW");

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b88a3b]">
            Website & design
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase leading-none text-[#242617] md:text-6xl">
            Forms & emails
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Read contact messages, manage newsletter subscribers and configure
            public form settings.
          </p>
        </div>

        <a
          href="/contact"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#071321] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#f4efe4] hover:text-[#071321]"
        >
          View contact page
        </a>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#242617]/40">
            New messages
          </p>
          <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
            {newMessages.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#242617]/40">
            Total messages
          </p>
          <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
            {messages.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#242617]/40">
            Subscribers
          </p>
          <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
            {subscribers.filter((subscriber) => subscriber.active).length}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="border-b border-[#242617]/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Inbox
          </p>
          <h2 className="mt-2 font-serif text-3xl uppercase leading-none text-[#242617]">
            Contact messages
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Messages submitted through the public contact form.
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="p-6 text-sm text-[#242617]/55">
            No contact messages yet.
          </div>
        ) : (
          <div className="divide-y divide-[#242617]/10">
            {messages.map((message) => (
              <article key={message.id} className="grid gap-5 p-6 lg:grid-cols-[1fr_220px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${
                        message.status === "NEW"
                          ? "border-[#b88a3b]/25 bg-[#d5ad68]/10 text-[#b88a3b]"
                          : "border-[#242617]/10 text-[#242617]/45"
                      }`}
                    >
                      {message.status}
                    </span>

                    {message.projectType ? (
                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        {message.projectType}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 font-serif text-3xl leading-none text-[#242617]">
                    {message.name || "Unnamed contact"}
                  </h3>

                  {message.email ? (
                    <a
                      href={`mailto:${message.email}`}
                      className="mt-2 block text-sm text-[#242617]/55 transition hover:text-[#b88a3b]"
                    >
                      {message.email}
                    </a>
                  ) : null}

                  <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-[#242617]/65">
                    {message.message}
                  </p>

                  <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#242617]/35">
                    {formatDate(message.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                  <form action={updateContactMessageStatus.bind(null, message.id, message.status === "NEW" ? "READ" : "NEW")}>
                    <button className="cursor-pointer rounded-full border border-[#242617]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/60 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]">
                      {message.status === "NEW" ? "Mark read" : "Mark new"}
                    </button>
                  </form>

                  <form action={deleteContactMessage.bind(null, message.id)}>
                    <button className="cursor-pointer rounded-full border border-red-900/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-red-900/55 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]">
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="border-b border-[#242617]/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Newsletter
          </p>
          <h2 className="mt-2 font-serif text-3xl uppercase leading-none text-[#242617]">
            Subscribers
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#242617]/55">
            People who opted into newsletter updates.
          </p>
        </div>

        {subscribers.length === 0 ? (
          <div className="p-6 text-sm text-[#242617]/55">
            No newsletter subscribers yet.
          </div>
        ) : (
          <div className="divide-y divide-[#242617]/10">
            {subscribers.map((subscriber) => (
              <article
                key={subscriber.id}
                className="grid gap-4 p-5 md:grid-cols-[1fr_160px_190px] md:items-center"
              >
                <div>
                  <a
                    href={`mailto:${subscriber.email}`}
                    className="font-semibold text-[#242617] transition hover:text-[#b88a3b]"
                  >
                    {subscriber.email}
                  </a>

                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#242617]/35">
                    {subscriber.source || "unknown source"} ·{" "}
                    {formatDate(subscriber.createdAt)}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${
                    subscriber.active
                      ? "border-[#b88a3b]/25 bg-[#d5ad68]/10 text-[#b88a3b]"
                      : "border-[#242617]/10 text-[#242617]/45"
                  }`}
                >
                  {subscriber.active ? "Active" : "Inactive"}
                </span>

                <div className="flex gap-2 md:justify-end">
                  <form
                    action={setNewsletterSubscriberActive.bind(
                      null,
                      subscriber.id,
                      !subscriber.active,
                    )}
                  >
                    <button className="cursor-pointer rounded-full border border-[#242617]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/60 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]">
                      {subscriber.active ? "Disable" : "Enable"}
                    </button>
                  </form>

                  <form action={deleteNewsletterSubscriber.bind(null, subscriber.id)}>
                    <button className="cursor-pointer rounded-full border border-red-900/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-red-900/55 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]">
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <FormsSettingsEditor
        settings={settings}
        updateAction={updateFormsSettings}
        resetAction={resetFormsSettings}
      />
    </div>
  );
}
