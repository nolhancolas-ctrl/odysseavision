import "server-only";

import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE_NAME = "ov_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14;
const CONFIG_ID = "main";
const DEFAULT_PASSWORD = process.env.ADMIN_SECRET_PASSWORD || "odyssea-admin";

type AdminAuthConfig = {
  id: string;
  passwordHash: string;
  salt: string;
  sessionSecret: string;
  updatedAt: string | Date;
};

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function signSession(config: AdminAuthConfig, expiresAt: number) {
  return createHmac("sha256", config.sessionSecret)
    .update(`${expiresAt}.${config.passwordHash}`)
    .digest("hex");
}

export async function getAdminAuthConfig(): Promise<AdminAuthConfig> {
  const existing = await db.adminAuthConfig.findUnique({
    where: { id: CONFIG_ID },
  });

  if (existing) {
    return existing;
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(DEFAULT_PASSWORD, salt);
  const sessionSecret =
    process.env.ADMIN_SESSION_SECRET || randomBytes(32).toString("hex");

  return db.adminAuthConfig.create({
    data: {
      id: CONFIG_ID,
      passwordHash,
      salt,
      sessionSecret,
    },
  });
}

export async function verifyAdminPassword(password: string) {
  const config = await getAdminAuthConfig();

  if (!password) {
    return false;
  }

  const candidateHash = hashPassword(password, config.salt);
  return safeEqual(candidateHash, config.passwordHash);
}

export async function setAdminSessionCookie() {
  const config = await getAdminAuthConfig();
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const signature = signSession(config, expiresAt);
  const token = `${expiresAt}.${signature}`;

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  const [expiresRaw, signature] = token.split(".");

  if (!expiresRaw || !signature) {
    return false;
  }

  const expiresAt = Number(expiresRaw);

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  const config = await getAdminAuthConfig();
  const expectedSignature = signSession(config, expiresAt);

  return safeEqual(signature, expectedSignature);
}

export async function updateAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const sessionSecret = randomBytes(32).toString("hex");

  await db.adminAuthConfig.upsert({
    where: { id: CONFIG_ID },
    update: {
      passwordHash,
      salt,
      sessionSecret,
    },
    create: {
      id: CONFIG_ID,
      passwordHash,
      salt,
      sessionSecret,
    },
  });

  await setAdminSessionCookie();
}

export async function getAdminAuthStatus() {
  const config = await getAdminAuthConfig();
  const authenticated = await isAdminAuthenticated();

  return {
    authenticated,
    updatedAt:
      config.updatedAt instanceof Date
        ? config.updatedAt.toISOString()
        : String(config.updatedAt),
    defaultPasswordHint: process.env.ADMIN_SECRET_PASSWORD
      ? "Configured from environment"
      : "Initial default was odyssea-admin",
  };
}
