import Link from "next/link";
import { db } from "@/lib/db";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getEmail(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const email = getEmail(params.email).trim().toLowerCase();

  let status: "missing" | "done" | "not-found" = "missing";

  if (email) {
    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (subscriber) {
      await db.newsletterSubscriber.update({
        where: { email },
        data: { active: false },
      });

      status = "done";
    } else {
      status = "not-found";
    }
  }

  return (
    <main className="min-h-screen bg-[#f4efe4] px-6 py-16 text-[#242617]">
      <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[2.5rem] border border-[#242617]/10 bg-white/45 p-8 text-center shadow-[0_24px_80px_rgba(20,20,10,0.08)] md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b88a3b]">
            Newsletter
          </p>

          <h1 className="mt-4 font-serif text-4xl text-[#242617]">
            {status === "done"
              ? "You have been unsubscribed"
              : status === "not-found"
                ? "Email not found"
                : "Unsubscribe"}
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#242617]/60">
            {status === "done"
              ? "You will no longer receive Odyssea Vision newsletter emails."
              : status === "not-found"
                ? "This email address is not currently registered in the newsletter list."
                : "The unsubscribe link is missing an email address."}
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-[#242617] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b]"
          >
            Back to website
          </Link>
        </div>
      </section>
    </main>
  );
}
