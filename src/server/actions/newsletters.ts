"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  buildNewsletterHtml,
  buildNewsletterText,
} from "@/lib/newsletters/render";
import { sendTransactionalEmail } from "@/lib/email/smtp";

function revalidateNewsletters() {
  revalidatePath("/admin/newsletters");
  revalidatePath("/contact");
  revalidatePath("/portfolio");
  revalidatePath("/stories");
}

function cleanStatus(value: string) {
  if (value === "READY" || value === "SENT") return value;
  return "DRAFT";
}

export async function saveNewsletterCampaign(
  campaignId: string | null,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const previewText = String(formData.get("previewText") ?? "").trim();
  const heroImage = String(formData.get("heroImage") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim();
  const ctaHref = String(formData.get("ctaHref") ?? "").trim();
  const status = cleanStatus(String(formData.get("status") ?? "DRAFT"));

  if (!title) {
    throw new Error("Newsletter title is required.");
  }

  if (!subject) {
    throw new Error("Newsletter subject is required.");
  }

  const data = {
    title,
    subject,
    previewText: previewText || null,
    heroImage: heroImage || null,
    body,
    ctaLabel: ctaLabel || null,
    ctaHref: ctaHref || null,
    status,
  };

  const campaign = campaignId
    ? await db.newsletterCampaign.update({
        where: {
          id: campaignId,
        },
        data,
      })
    : await db.newsletterCampaign.create({
        data,
      });

  revalidateNewsletters();

  redirect(`/admin/newsletters/${campaign.id}`);
}

export async function duplicateNewsletterCampaign(campaignId: string) {
  const campaign = await db.newsletterCampaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    throw new Error("Newsletter not found.");
  }

  const copy = await db.newsletterCampaign.create({
    data: {
      title: `${campaign.title} copy`,
      subject: campaign.subject,
      previewText: campaign.previewText,
      heroImage: campaign.heroImage,
      body: campaign.body,
      ctaLabel: campaign.ctaLabel,
      ctaHref: campaign.ctaHref,
      status: "DRAFT",
    },
  });

  revalidateNewsletters();

  redirect(`/admin/newsletters/${copy.id}`);
}

export async function deleteNewsletterCampaign(campaignId: string) {
  await db.newsletterCampaign.delete({
    where: {
      id: campaignId,
    },
  });

  revalidateNewsletters();

  redirect("/admin/newsletters");
}

export async function sendNewsletterCampaign(
  campaignId: string,
  _formData?: FormData,
) {
  const [campaign, subscribers] = await Promise.all([
    db.newsletterCampaign.findUnique({
      where: {
        id: campaignId,
      },
    }),
    db.newsletterSubscriber.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  if (!campaign) {
    throw new Error("Newsletter not found.");
  }

  if (subscribers.length === 0) {
    throw new Error("No active subscribers.");
  }

  const html = buildNewsletterHtml(campaign);
  const text = buildNewsletterText(campaign);

  let sentCount = 0;

  for (const subscriber of subscribers) {
    const result = await sendTransactionalEmail({
      to: subscriber.email,
      subject: campaign.subject,
      text,
      html,
    });

    if (result.sent) {
      sentCount += 1;
    }
  }

  await db.newsletterCampaign.update({
    where: {
      id: campaign.id,
    },
    data: {
      status: "SENT",
      sentAt: new Date(),
      recipientCount: sentCount,
    },
  });

  revalidateNewsletters();

  redirect(`/admin/newsletters/${campaign.id}`);
}
