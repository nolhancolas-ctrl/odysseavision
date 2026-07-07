import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  buildNewsletterHtml,
  buildNewsletterText,
} from "@/lib/newsletters/render";
import { sendTransactionalEmail } from "@/lib/email/smtp";

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  );
}

function appendUnsubscribeFooter(html: string, email: string) {
  const unsubscribeUrl = `${getSiteUrl()}/unsubscribe?email=${encodeURIComponent(
    email,
  )}`;

  const footer = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;">
      <tr>
        <td align="center" style="padding:22px 24px 28px 24px;font-family:Arial,sans-serif;font-size:12px;line-height:18px;color:#777064;">
          You are receiving this email because you subscribed to Odyssea Vision.<br />
          <a href="${unsubscribeUrl}" style="color:#777064;text-decoration:underline;">Unsubscribe</a>
        </td>
      </tr>
    </table>
  `;

  return html.includes("</body>")
    ? html.replace("</body>", `${footer}</body>`)
    : `${html}${footer}`;
}

function appendUnsubscribeText(text: string, email: string) {
  const unsubscribeUrl = `${getSiteUrl()}/unsubscribe?email=${encodeURIComponent(
    email,
  )}`;

  return `${text}\n\nUnsubscribe: ${unsubscribeUrl}`;
}

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");

  return authHeader === `Bearer ${secret}` || querySecret === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const dueCampaigns = await db.newsletterCampaign.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  const subscribers = await db.newsletterSubscriber.findMany({
    where: {
      active: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const results = [];

  for (const campaign of dueCampaigns) {
    if (subscribers.length === 0) {
      await db.newsletterCampaign.update({
        where: { id: campaign.id },
        data: {
          status: "READY",
          recipientCount: 0,
        },
      });

      results.push({
        id: campaign.id,
        title: campaign.title,
        status: "no-subscribers",
        sent: 0,
      });

      continue;
    }

    const html = buildNewsletterHtml(campaign);
    const text = buildNewsletterText(campaign);

    let sentCount = 0;
    let failedCount = 0;
    let smtpNotConfigured = false;

    for (const subscriber of subscribers) {
      try {
        const result = await sendTransactionalEmail({
          to: subscriber.email,
          subject: campaign.subject,
          text: appendUnsubscribeText(text, subscriber.email),
          html: appendUnsubscribeFooter(html, subscriber.email),
        });

        if (result.sent) {
          sentCount += 1;
        } else {
          smtpNotConfigured = true;
        }
      } catch (error) {
        failedCount += 1;
        console.error("[newsletter cron] Send failed:", subscriber.email, error);
      }
    }

    if (smtpNotConfigured && sentCount === 0) {
      results.push({
        id: campaign.id,
        title: campaign.title,
        status: "smtp-not-configured",
        sent: 0,
      });

      continue;
    }

    await db.newsletterCampaign.update({
      where: { id: campaign.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        scheduledAt: null,
        recipientCount: sentCount,
      },
    });

    results.push({
      id: campaign.id,
      title: campaign.title,
      status: failedCount > 0 ? "partial" : "sent",
      sent: sentCount,
      failed: failedCount,
    });
  }

  return NextResponse.json({
    ok: true,
    due: dueCampaigns.length,
    results,
  });
}
