import type { Metadata } from "next";
import { db } from "@/lib/db";
import { editablePages } from "@/data/sitePages";

export const SEO_SETTING_KEY = "seo";

export type PageSeoSettings = {
  pageKey: string;
  label: string;
  path: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  noIndex: boolean;
};

export type SeoSettings = {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string;
  author: string;
  language: string;
  faviconSrc: string;

  robotsIndex: boolean;
  robotsFollow: boolean;
  sitemapEnabled: boolean;

  openGraphType: string;
  openGraphLocale: string;
  openGraphImage: string;

  twitterCard: "summary" | "summary_large_image";
  twitterCreator: string;
  twitterImage: string;

  pages: PageSeoSettings[];
};

const defaultPageDescriptions: Record<string, string> = {
  home: "Photography and film from land and sea by Andrew & Morgane.",
  about: "Meet Odyssea Vision, two visual storytellers chasing wild horizons from land and sea.",
  portfolio: "Explore a portfolio of wildlife, ocean, travel and documentary photography.",
  stories: "Read travel stories, behind-the-lens notes and conservation-inspired articles.",
  videos: "Watch cinematic films and travel videos from the road, ocean and wild places.",
  "client-albums": "Private client galleries, protected albums and memories beautifully preserved.",
  contact: "Contact Odyssea Vision for photography, film, collaborations and private galleries.",
};

function defaultPageSeo(): PageSeoSettings[] {
  return editablePages.map((page) => ({
    pageKey: page.key,
    label: page.title,
    path: page.href,
    title: page.title === "Home" ? "Odyssea Vision" : page.title,
    description:
      defaultPageDescriptions[page.key] ||
      `${page.title} · Odyssea Vision`,
    keywords: "",
    ogImage: "",
    noIndex: false,
  }));
}

export const defaultSeoSettings: SeoSettings = {
  siteName: "Odyssea Vision",
  siteUrl: "https://odysseavision.com",
  defaultTitle: "Odyssea Vision",
  titleTemplate: "%s · Odyssea Vision",
  defaultDescription:
    "Photography and film from land and sea by Andrew & Morgane.",
  defaultKeywords:
    "photography, film, wildlife, ocean, travel, documentary, Odyssea Vision",
  author: "Andrew & Morgane",
  language: "en",
  faviconSrc: "/favicon.ico",

  robotsIndex: true,
  robotsFollow: true,
  sitemapEnabled: true,

  openGraphType: "website",
  openGraphLocale: "en_US",
  openGraphImage: "/images/home/hero_fond.png",

  twitterCard: "summary_large_image",
  twitterCreator: "@odyssea.vision",
  twitterImage: "/images/home/hero_fond.png",

  pages: defaultPageSeo(),
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

function normalizeTwitterCard(value: unknown): "summary" | "summary_large_image" {
  return value === "summary" ? "summary" : "summary_large_image";
}

function normalizePageSeo(value: unknown, fallback: PageSeoSettings) {
  if (!isObject(value)) return fallback;

  return {
    pageKey: fallback.pageKey,
    label: fallback.label,
    path: fallback.path,
    title: textValue(value.title, fallback.title),
    description: textValue(value.description, fallback.description),
    keywords: textValue(value.keywords, fallback.keywords),
    ogImage: textValue(value.ogImage, fallback.ogImage),
    noIndex: boolValue(value.noIndex, fallback.noIndex),
  };
}

export function normalizeSeoSettings(value: unknown): SeoSettings {
  if (!isObject(value)) {
    return defaultSeoSettings;
  }

  const savedPages = Array.isArray(value.pages) ? value.pages : [];
  const fallbackPages = defaultPageSeo();

  const pages = fallbackPages.map((fallback) => {
    const saved = savedPages.find(
      (item) =>
        isObject(item) &&
        typeof item.pageKey === "string" &&
        item.pageKey === fallback.pageKey,
    );

    return normalizePageSeo(saved, fallback);
  });

  return {
    siteName: textValue(value.siteName, defaultSeoSettings.siteName),
    siteUrl: textValue(value.siteUrl, defaultSeoSettings.siteUrl),
    defaultTitle: textValue(value.defaultTitle, defaultSeoSettings.defaultTitle),
    titleTemplate: textValue(
      value.titleTemplate,
      defaultSeoSettings.titleTemplate,
    ),
    defaultDescription: textValue(
      value.defaultDescription,
      defaultSeoSettings.defaultDescription,
    ),
    defaultKeywords: textValue(
      value.defaultKeywords,
      defaultSeoSettings.defaultKeywords,
    ),
    author: textValue(value.author, defaultSeoSettings.author),
    language: textValue(value.language, defaultSeoSettings.language),
    faviconSrc: textValue(value.faviconSrc, defaultSeoSettings.faviconSrc),

    robotsIndex: boolValue(value.robotsIndex, defaultSeoSettings.robotsIndex),
    robotsFollow: boolValue(value.robotsFollow, defaultSeoSettings.robotsFollow),
    sitemapEnabled: boolValue(
      value.sitemapEnabled,
      defaultSeoSettings.sitemapEnabled,
    ),

    openGraphType: textValue(
      value.openGraphType,
      defaultSeoSettings.openGraphType,
    ),
    openGraphLocale: textValue(
      value.openGraphLocale,
      defaultSeoSettings.openGraphLocale,
    ),
    openGraphImage: textValue(
      value.openGraphImage,
      defaultSeoSettings.openGraphImage,
    ),

    twitterCard: normalizeTwitterCard(value.twitterCard),
    twitterCreator: textValue(
      value.twitterCreator,
      defaultSeoSettings.twitterCreator,
    ),
    twitterImage: textValue(
      value.twitterImage,
      defaultSeoSettings.twitterImage,
    ),

    pages,
  };
}

export async function getSeoSettings(): Promise<SeoSettings> {
  try {
    const setting = await db.siteSetting.findUnique({
      where: {
        key: SEO_SETTING_KEY,
      },
    });

    return normalizeSeoSettings(setting?.value);
  } catch {
    return defaultSeoSettings;
  }
}

function normalizeSiteUrl(siteUrl: string) {
  return siteUrl.replace(/\/+$/, "");
}

function toAbsoluteUrl(siteUrl: string, value: string) {
  if (!value) return undefined;

  try {
    return new URL(value).toString();
  } catch {
    return `${normalizeSiteUrl(siteUrl)}${value.startsWith("/") ? value : `/${value}`}`;
  }
}

export function getSeoPage(settings: SeoSettings, pageKey: string) {
  return (
    settings.pages.find((page) => page.pageKey === pageKey) ??
    settings.pages.find((page) => page.pageKey === "home") ??
    defaultSeoSettings.pages[0]
  );
}

export function buildMetadata(settings: SeoSettings, pageKey = "home"): Metadata {
  const page = getSeoPage(settings, pageKey);
  const siteUrl = normalizeSiteUrl(settings.siteUrl);
  const title = page.title || settings.defaultTitle;
  const description = page.description || settings.defaultDescription;
  const keywords = page.keywords || settings.defaultKeywords;
  const ogImage =
    page.ogImage || settings.openGraphImage || settings.twitterImage;
  const canonicalPath = page.path || "/";
  const canonicalUrl = `${siteUrl}${canonicalPath === "/" ? "" : canonicalPath}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.defaultTitle,
      template: settings.titleTemplate,
      absolute: pageKey === "home" ? settings.defaultTitle : title,
    },
    description,
    keywords,
    authors: settings.author ? [{ name: settings.author }] : undefined,
    icons: settings.faviconSrc
      ? {
          icon: settings.faviconSrc,
        }
      : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: settings.robotsIndex && !page.noIndex,
      follow: settings.robotsFollow,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: settings.siteName,
      type: settings.openGraphType as "website",
      locale: settings.openGraphLocale,
      images: ogImage
        ? [
            {
              url: toAbsoluteUrl(siteUrl, ogImage) ?? ogImage,
            },
          ]
        : undefined,
    },
    twitter: {
      card: settings.twitterCard,
      title,
      description,
      creator: settings.twitterCreator || undefined,
      images: settings.twitterImage || ogImage
        ? [toAbsoluteUrl(siteUrl, settings.twitterImage || ogImage) ?? ""]
        : undefined,
    },
  };
}

export async function getPageMetadata(pageKey: string): Promise<Metadata> {
  const settings = await getSeoSettings();
  return buildMetadata(settings, pageKey);
}
