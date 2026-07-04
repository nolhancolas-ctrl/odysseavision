import { db } from "@/lib/db";
import { contactInfo, projectTypes } from "@/data/contact";

export const FORMS_SETTING_KEY = "forms-emails";

export type FormsContactInfo = {
  id: string;
  title: string;
  value: string;
  href: string;
  visible: boolean;
  order: number;
};

export type FormsSettings = {
  recipientEmail: string;
  notificationSubject: string;
  successMessage: string;
  responseTimeMessage: string;
  newsletterEnabled: boolean;
  newsletterLabel: string;
  newsletterSource: string;
  projectTypes: string[];
  contactInfo: FormsContactInfo[];
  availabilityText: string;
  autoReplyEnabled: boolean;
  autoReplySubject: string;
  autoReplyBody: string;
};

export const defaultFormsSettings: FormsSettings = {
  recipientEmail: "odysseavision@gmail.com",
  notificationSubject: "New enquiry from Odyssea Vision website",
  successMessage: "Thank you. Your message has been saved successfully.",
  responseTimeMessage: "We’ll do our best to get back to you within 48 hours.",
  newsletterEnabled: true,
  newsletterLabel:
    "I’d love to receive news, stories and updates from Odyssea Vision.",
  newsletterSource: "contact-form",
  projectTypes,
  contactInfo: contactInfo.map((item, index) => ({
    id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: item.title,
    value: item.value,
    href: item.href,
    visible: true,
    order: index,
  })),
  availabilityText: "Available for travel worldwide.",
  autoReplyEnabled: false,
  autoReplySubject: "Thank you for contacting Odyssea Vision",
  autoReplyBody:
    "Hi,\n\nThank you for reaching out to Odyssea Vision. We have received your message and will get back to you soon.\n\nAndrew & Morgane",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function textValue(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function boolValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeContactInfo(
  value: unknown,
  fallback: FormsContactInfo,
  index: number,
): FormsContactInfo {
  if (!isObject(value)) {
    return { ...fallback, order: index };
  }

  return {
    id: textValue(value.id, fallback.id || `contact-${index}`),
    title: textValue(value.title, fallback.title),
    value: textValue(value.value, fallback.value),
    href: textValue(value.href, fallback.href),
    visible: boolValue(value.visible, fallback.visible),
    order: numberValue(value.order, index),
  };
}

function normalizeProjectTypes(value: unknown) {
  if (!Array.isArray(value)) return defaultFormsSettings.projectTypes;

  const cleaned = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned : defaultFormsSettings.projectTypes;
}

export function normalizeFormsSettings(value: unknown): FormsSettings {
  if (!isObject(value)) {
    return defaultFormsSettings;
  }

  const rawContactInfo = Array.isArray(value.contactInfo)
    ? value.contactInfo
    : [];

  const contactInfoItems =
    rawContactInfo.length > 0
      ? rawContactInfo.map((item, index) =>
          normalizeContactInfo(
            item,
            defaultFormsSettings.contactInfo[index] ??
              defaultFormsSettings.contactInfo[0],
            index,
          ),
        )
      : defaultFormsSettings.contactInfo;

  return {
    recipientEmail: textValue(
      value.recipientEmail,
      defaultFormsSettings.recipientEmail,
    ),
    notificationSubject: textValue(
      value.notificationSubject,
      defaultFormsSettings.notificationSubject,
    ),
    successMessage: textValue(
      value.successMessage,
      defaultFormsSettings.successMessage,
    ),
    responseTimeMessage: textValue(
      value.responseTimeMessage,
      defaultFormsSettings.responseTimeMessage,
    ),
    newsletterEnabled: boolValue(
      value.newsletterEnabled,
      defaultFormsSettings.newsletterEnabled,
    ),
    newsletterLabel: textValue(
      value.newsletterLabel,
      defaultFormsSettings.newsletterLabel,
    ),
    newsletterSource: textValue(
      value.newsletterSource,
      defaultFormsSettings.newsletterSource,
    ),
    projectTypes: normalizeProjectTypes(value.projectTypes),
    contactInfo: [...contactInfoItems].sort((a, b) => a.order - b.order),
    availabilityText: textValue(
      value.availabilityText,
      defaultFormsSettings.availabilityText,
    ),
    autoReplyEnabled: boolValue(
      value.autoReplyEnabled,
      defaultFormsSettings.autoReplyEnabled,
    ),
    autoReplySubject: textValue(
      value.autoReplySubject,
      defaultFormsSettings.autoReplySubject,
    ),
    autoReplyBody: textValue(
      value.autoReplyBody,
      defaultFormsSettings.autoReplyBody,
    ),
  };
}

export async function getFormsSettings(): Promise<FormsSettings> {
  try {
    const setting = await db.siteSetting.findUnique({
      where: {
        key: FORMS_SETTING_KEY,
      },
    });

    return normalizeFormsSettings(setting?.value);
  } catch {
    return defaultFormsSettings;
  }
}
