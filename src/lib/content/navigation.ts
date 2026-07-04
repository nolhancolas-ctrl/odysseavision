import { db } from "@/lib/db";
import { mainNavigation } from "@/data/navigation";

export const NAVIGATION_SETTING_KEY = "navigation";

export type NavigationLink = {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  order: number;
};

export type SocialLink = {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  visible: boolean;
  order: number;
};

export type NavigationSettings = {
  mainLinks: NavigationLink[];
  footerLinks: NavigationLink[];
  socialLinks: SocialLink[];
  footerCopyright: string;
  footerTagline: string;
};

export const defaultNavigationSettings: NavigationSettings = {
  mainLinks: mainNavigation.map((item, index) => ({
    id: item.href === "/" ? "home" : item.href.replace(/\//g, "-").replace(/^-/, ""),
    label: item.label,
    href: item.href,
    visible: true,
    order: index,
  })),
  footerLinks: mainNavigation.map((item, index) => ({
    id: `footer-${item.href === "/" ? "home" : item.href.replace(/\//g, "-").replace(/^-/, "")}`,
    label: item.label,
    href: item.href,
    visible: true,
    order: index,
  })),
  socialLinks: [
    {
      id: "instagram",
      label: "Instagram",
      shortLabel: "Ig",
      href: "https://www.instagram.com/odyssea.vision",
      visible: true,
      order: 0,
    },
    {
      id: "youtube",
      label: "YouTube",
      shortLabel: "Yt",
      href: "https://www.youtube.com/",
      visible: true,
      order: 1,
    },
    {
      id: "email",
      label: "Email",
      shortLabel: "@",
      href: "mailto:odysseavision@gmail.com",
      visible: true,
      order: 2,
    },
  ],
  footerCopyright: "© 2024 Odyssea Vision. All rights reserved.",
  footerTagline: "Photography & Film",
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

function normalizeLink(
  value: unknown,
  fallback: NavigationLink,
  index: number,
): NavigationLink {
  if (!isObject(value)) {
    return { ...fallback, order: index };
  }

  return {
    id: textValue(value.id, fallback.id || `link-${index}`),
    label: textValue(value.label, fallback.label),
    href: textValue(value.href, fallback.href),
    visible: boolValue(value.visible, fallback.visible),
    order: numberValue(value.order, index),
  };
}

function normalizeSocialLink(
  value: unknown,
  fallback: SocialLink,
  index: number,
): SocialLink {
  if (!isObject(value)) {
    return { ...fallback, order: index };
  }

  return {
    id: textValue(value.id, fallback.id || `social-${index}`),
    label: textValue(value.label, fallback.label),
    shortLabel: textValue(value.shortLabel, fallback.shortLabel),
    href: textValue(value.href, fallback.href),
    visible: boolValue(value.visible, fallback.visible),
    order: numberValue(value.order, index),
  };
}

function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

export function normalizeNavigationSettings(value: unknown): NavigationSettings {
  if (!isObject(value)) {
    return defaultNavigationSettings;
  }

  const mainLinksRaw = Array.isArray(value.mainLinks) ? value.mainLinks : [];
  const footerLinksRaw = Array.isArray(value.footerLinks) ? value.footerLinks : [];
  const socialLinksRaw = Array.isArray(value.socialLinks) ? value.socialLinks : [];

  const mainLinks =
    mainLinksRaw.length > 0
      ? mainLinksRaw.map((item, index) =>
          normalizeLink(
            item,
            defaultNavigationSettings.mainLinks[index] ??
              defaultNavigationSettings.mainLinks[0],
            index,
          ),
        )
      : defaultNavigationSettings.mainLinks;

  const footerLinks =
    footerLinksRaw.length > 0
      ? footerLinksRaw.map((item, index) =>
          normalizeLink(
            item,
            defaultNavigationSettings.footerLinks[index] ??
              defaultNavigationSettings.footerLinks[0],
            index,
          ),
        )
      : defaultNavigationSettings.footerLinks;

  const socialLinks =
    socialLinksRaw.length > 0
      ? socialLinksRaw.map((item, index) =>
          normalizeSocialLink(
            item,
            defaultNavigationSettings.socialLinks[index] ??
              defaultNavigationSettings.socialLinks[0],
            index,
          ),
        )
      : defaultNavigationSettings.socialLinks;

  return {
    mainLinks: sortByOrder(mainLinks),
    footerLinks: sortByOrder(footerLinks),
    socialLinks: sortByOrder(socialLinks),
    footerCopyright: textValue(
      value.footerCopyright,
      defaultNavigationSettings.footerCopyright,
    ),
    footerTagline: textValue(
      value.footerTagline,
      defaultNavigationSettings.footerTagline,
    ),
  };
}

export async function getNavigationSettings(): Promise<NavigationSettings> {
  try {
    const setting = await db.siteSetting.findUnique({
      where: {
        key: NAVIGATION_SETTING_KEY,
      },
    });

    return normalizeNavigationSettings(setting?.value);
  } catch {
    return defaultNavigationSettings;
  }
}
