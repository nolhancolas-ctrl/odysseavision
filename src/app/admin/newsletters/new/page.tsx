import Link from "next/link";
import { NewsletterForm } from "@/components/admin/newsletters/NewsletterForm";
import { saveNewsletterCampaign } from "@/server/actions/newsletters";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewNewsletterPage() {
  const activeSubscribers = await db.newsletterSubscriber.count({
    where: {
      active: true,
    },
  });

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b88a3b]">
            Create & manage
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase leading-none text-[#242617] md:text-6xl">
            New newsletter
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Draft a newsletter and preview how it will render in email clients.
          </p>
        </div>

        <Link
          href="/admin/newsletters"
          className="rounded-full border border-[#242617]/15 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#071321] hover:text-[#071321]"
        >
          Back
        </Link>
      </section>

      <NewsletterForm
        campaign={{
          title: "",
          subject: "",
          previewText: "",
          heroImage: "",
          body: "",
          ctaLabel: "",
          ctaHref: "",
          status: "DRAFT",
        }}
        activeSubscribers={activeSubscribers}
        saveAction={saveNewsletterCampaign.bind(null, null)}
      />
    </div>
  );
}
