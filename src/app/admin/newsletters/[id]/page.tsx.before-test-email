import { notFound } from "next/navigation";
import Link from "next/link";
import { NewsletterForm } from "@/components/admin/newsletters/NewsletterForm";
import {
  deleteNewsletterCampaign,
  duplicateNewsletterCampaign,
  saveNewsletterCampaign,
  sendNewsletterCampaign,
} from "@/server/actions/newsletters";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type NewsletterPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditNewsletterPage({ params }: NewsletterPageProps) {
  const { id } = await params;

  const [campaign, activeSubscribers] = await Promise.all([
    db.newsletterCampaign.findUnique({
      where: {
        id,
      },
    }),
    db.newsletterSubscriber.count({
      where: {
        active: true,
      },
    }),
  ]);

  if (!campaign) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b88a3b]">
            Create & manage
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase leading-none text-[#242617] md:text-6xl">
            Edit newsletter
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Update the newsletter content, preview the email and send it to
            active subscribers.
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
        campaign={campaign}
        activeSubscribers={activeSubscribers}
        saveAction={saveNewsletterCampaign.bind(null, campaign.id)}
        sendAction={sendNewsletterCampaign.bind(null, campaign.id)}
        deleteAction={deleteNewsletterCampaign.bind(null, campaign.id)}
        duplicateAction={duplicateNewsletterCampaign.bind(null, campaign.id)}
      />
    </div>
  );
}
