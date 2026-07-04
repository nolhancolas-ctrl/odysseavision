"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  defaultFormsSettings,
  FORMS_SETTING_KEY,
  getFormsSettings,
  normalizeFormsSettings,
  type FormsSettings,
} from "@/lib/content/forms";
import { db } from "@/lib/db";
import {
  escapeHtml,
  sendTransactionalEmail,
  textToHtml,
} from "@/lib/email/smtp";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type NewsletterFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

function revalidateForms() {
  revalidatePath("/contact");
  revalidatePath("/admin/forms");
}

function buildAutoReplyBody({
  body,
  name,
  projectType,
}: {
  body: string;
  name: string;
  projectType: string;
}) {
  return body
    .replaceAll("{name}", name)
    .replaceAll("{projectType}", projectType || "your project");
}

async function sendContactEmails({
  settings,
  name,
  email,
  projectType,
  message,
  messageId,
}: {
  settings: FormsSettings;
  name: string;
  email: string;
  projectType: string;
  message: string;
  messageId: string;
}) {
  const notificationSubject = `${settings.notificationSubject} · ${name}`;

  const notificationText = [
    "New contact message from Odyssea Vision website",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Project type: ${projectType || "Not specified"}`,
    `Message ID: ${messageId}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const notificationHtml = `
    <div style="font-family: Arial, sans-serif; color: #242617; line-height: 1.6;">
      <p style="text-transform: uppercase; letter-spacing: 0.16em; font-size: 11px; color: #b88a3b;">
        Odyssea Vision
      </p>

      <h1 style="font-size: 24px; margin: 0 0 18px;">
        New contact message
      </h1>

      <table style="border-collapse: collapse; margin-bottom: 22px;">
        <tr>
          <td style="padding: 4px 18px 4px 0; color: #777;">Name</td>
          <td style="padding: 4px 0;"><strong>${escapeHtml(name)}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 18px 4px 0; color: #777;">Email</td>
          <td style="padding: 4px 0;">${escapeHtml(email)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 18px 4px 0; color: #777;">Project type</td>
          <td style="padding: 4px 0;">${escapeHtml(projectType || "Not specified")}</td>
        </tr>
        <tr>
          <td style="padding: 4px 18px 4px 0; color: #777;">Message ID</td>
          <td style="padding: 4px 0;">${escapeHtml(messageId)}</td>
        </tr>
      </table>

      <div style="padding: 18px; background: #f4efe4; border: 1px solid rgba(36,38,23,0.12); border-radius: 18px;">
        ${textToHtml(message)}
      </div>
    </div>
  `;

  try {
    const result = await sendTransactionalEmail({
      to: settings.recipientEmail,
      replyTo: email,
      subject: notificationSubject,
      text: notificationText,
      html: notificationHtml,
    });

    if (!result.sent) {
      console.warn("[email] Contact notification was not sent:", result.reason);
    }
  } catch (error) {
    console.error("[email] Contact notification failed:", error);
  }

  if (!settings.autoReplyEnabled) {
    return;
  }

  const autoReplyBody = buildAutoReplyBody({
    body: settings.autoReplyBody,
    name,
    projectType,
  });

  const autoReplySubject =
    settings.autoReplySubject || "Thank you for contacting Odyssea Vision";

  const autoReplyHtml = `
    <div style="font-family: Arial, sans-serif; color: #242617; line-height: 1.7;">
      <p style="text-transform: uppercase; letter-spacing: 0.16em; font-size: 11px; color: #b88a3b;">
        Odyssea Vision
      </p>

      <div style="padding: 20px; background: #f4efe4; border: 1px solid rgba(36,38,23,0.12); border-radius: 18px;">
        ${textToHtml(autoReplyBody)}
      </div>
    </div>
  `;

  try {
    const result = await sendTransactionalEmail({
      to: email,
      replyTo: settings.recipientEmail,
      subject: autoReplySubject,
      text: autoReplyBody,
      html: autoReplyHtml,
    });

    if (!result.sent) {
      console.warn("[email] Auto-reply was not sent:", result.reason);
    }
  } catch (error) {
    console.error("[email] Auto-reply failed:", error);
  }
}

export async function updateFormsSettings(formData: FormData) {
  const rawValue = String(formData.get("formsSettings") ?? "{}");

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new Error("Invalid forms settings.");
  }

  const settings = normalizeFormsSettings(parsed);

  await db.siteSetting.upsert({
    where: {
      key: FORMS_SETTING_KEY,
    },
    update: {
      value: settings as unknown as Prisma.InputJsonValue,
    },
    create: {
      key: FORMS_SETTING_KEY,
      value: settings as unknown as Prisma.InputJsonValue,
    },
  });

  revalidateForms();
}

export async function resetFormsSettings(_formData?: FormData) {
  await db.siteSetting.upsert({
    where: {
      key: FORMS_SETTING_KEY,
    },
    update: {
      value: defaultFormsSettings as unknown as Prisma.InputJsonValue,
    },
    create: {
      key: FORMS_SETTING_KEY,
      value: defaultFormsSettings as unknown as Prisma.InputJsonValue,
    },
  });

  revalidateForms();
}

export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const projectType = String(formData.get("projectType") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const newsletterConsent = formData.get("newsletterConsent") === "on";

  const settings = await getFormsSettings();

  const name = `${firstName} ${lastName}`.trim();

  if (!name) {
    return {
      status: "error",
      message: "Please enter your name.",
    };
  }

  if (!email || !email.includes("@")) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  if (!message) {
    return {
      status: "error",
      message: "Please write a message.",
    };
  }

  const contactMessage = await db.contactMessage.create({
    data: {
      name,
      email,
      projectType: projectType || null,
      message,
      status: "NEW",
    },
  });

  if (newsletterConsent && settings.newsletterEnabled) {
    await db.newsletterSubscriber.upsert({
      where: {
        email,
      },
      update: {
        active: true,
        source: settings.newsletterSource,
      },
      create: {
        email,
        source: settings.newsletterSource,
        active: true,
      },
    });
  }

  await sendContactEmails({
    settings,
    name,
    email,
    projectType,
    message,
    messageId: contactMessage.id,
  });

  revalidateForms();

  return {
    status: "success",
    message: settings.successMessage,
  };
}

export async function submitNewsletterForm(
  _previousState: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const source = String(formData.get("source") ?? "newsletter").trim();

  if (!email || !email.includes("@")) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  await db.newsletterSubscriber.upsert({
    where: {
      email,
    },
    update: {
      active: true,
      source,
    },
    create: {
      email,
      source,
      active: true,
    },
  });

  revalidateForms();

  return {
    status: "success",
    message: "Thank you. You are now subscribed.",
  };
}

export async function updateContactMessageStatus(id: string, status: string) {
  await db.contactMessage.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  revalidateForms();
}

export async function deleteContactMessage(id: string) {
  await db.contactMessage.delete({
    where: {
      id,
    },
  });

  revalidateForms();
}

export async function setNewsletterSubscriberActive(id: string, active: boolean) {
  await db.newsletterSubscriber.update({
    where: {
      id,
    },
    data: {
      active,
    },
  });

  revalidateForms();
}

export async function deleteNewsletterSubscriber(id: string) {
  await db.newsletterSubscriber.delete({
    where: {
      id,
    },
  });

  revalidateForms();
}
