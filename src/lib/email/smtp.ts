import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import {
  DEFAULT_SMTP_FROM,
  DEFAULT_SMTP_HOST,
  DEFAULT_SMTP_PORT,
  ODYSSEA_NEWSLETTER_EMAIL,
} from "@/lib/email/config";

export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type EmailResult =
  | {
      sent: true;
      messageId?: string;
    }
  | {
      sent: false;
      reason: "SMTP_NOT_CONFIGURED";
    };

type SmtpSettingValue = {
  host?: string;
  port?: string;
  secure?: boolean;
  user?: string;
  password?: string;
  from?: string;
  enabled?: boolean;
};

function parsePort(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === "true") return true;
  if (value === "false") return false;

  return fallback;
}

async function getSmtpSettingsFromDb(): Promise<SmtpSettingValue | null> {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: "smtp" },
    });

    if (!setting?.value || typeof setting.value !== "object") {
      return null;
    }

    return setting.value as SmtpSettingValue;
  } catch {
    return null;
  }
}

async function getSmtpConfig() {
  const environmentUser =
    process.env.SMTP_USER || ODYSSEA_NEWSLETTER_EMAIL;
  const environmentPassword = process.env.SMTP_PASS || "";

  // Vercel secrets are authoritative when present. This prevents an old DB
  // setting from shadowing credentials deliberately configured for a deploy.
  if (environmentPassword) {
    const host = process.env.SMTP_HOST || DEFAULT_SMTP_HOST;
    const port = parsePort(process.env.SMTP_PORT, Number(DEFAULT_SMTP_PORT));
    const secure = parseBoolean(process.env.SMTP_SECURE, port === 465);
    const from = process.env.SMTP_FROM || DEFAULT_SMTP_FROM;

    return {
      host,
      port,
      secure,
      user: environmentUser,
      pass: environmentPassword,
      from,
      configured: Boolean(host && environmentUser && from),
    };
  }

  const dbSettings = await getSmtpSettingsFromDb();

  if (dbSettings?.enabled) {
    const host = dbSettings.host || "";
    const port = parsePort(dbSettings.port, 465);
    const secure = Boolean(dbSettings.secure);
    const user = dbSettings.user || "";
    const pass = dbSettings.password || "";
    const from =
      dbSettings.from || (user ? `Odyssea Vision <${user}>` : "");

    return {
      host,
      port,
      secure,
      user,
      pass,
      from,
      configured: Boolean(host && user && pass && from),
    };
  }

  const host = process.env.SMTP_HOST || DEFAULT_SMTP_HOST;
  const port = parsePort(process.env.SMTP_PORT, Number(DEFAULT_SMTP_PORT));
  const secure = parseBoolean(process.env.SMTP_SECURE, port === 465);
  const user = environmentUser;
  const pass = environmentPassword;
  const from = process.env.SMTP_FROM || DEFAULT_SMTP_FROM;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
    configured: Boolean(host && user && pass && from),
  };
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function textToHtml(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

export async function sendTransactionalEmail(
  email: TransactionalEmail,
): Promise<EmailResult> {
  const config = await getSmtpConfig();

  if (!config.configured) {
    console.warn("[email] SMTP is not configured. Email was not sent.");

    return {
      sent: false,
      reason: "SMTP_NOT_CONFIGURED",
    };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  const info = await transporter.sendMail({
    from: config.from,
    to: email.to,
    replyTo: email.replyTo,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  return {
    sent: true,
    messageId: info.messageId,
  };
}
