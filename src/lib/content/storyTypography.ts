import type { CSSProperties } from "react";
import { db } from "@/lib/db";

export const STORY_TYPOGRAPHY_SETTING_KEY = "story-typography";

export const storyFontChoices = [
  "sans",
  "serif",
  "hand",
  "anyway",
  "custom",
] as const;

export type StoryFontChoice = (typeof storyFontChoices)[number];

export type StoryTypographySettings = {
  titleFont: StoryFontChoice;
  headingFont: StoryFontChoice;
  bodyFont: StoryFontChoice;
  quoteFont: StoryFontChoice;
  captionFont: StoryFontChoice;

  titleSize: number;
  headingTwoSize: number;
  headingThreeSize: number;
  bodySize: number;
  quoteSize: number;
  captionSize: number;

  headingLineHeight: number;
  bodyLineHeight: number;
  quoteLineHeight: number;

  headingLetterSpacing: number;
  bodyLetterSpacing: number;

  paragraphSpacing: number;
  sectionSpacing: number;

  headingColor: string;
  textColor: string;
  accentColor: string;

  customFontName: string;
  customFontUrl: string;
};

export const defaultStoryTypographySettings: StoryTypographySettings = {
  titleFont: "serif",
  headingFont: "serif",
  bodyFont: "sans",
  quoteFont: "serif",
  captionFont: "sans",

  titleSize: 64,
  headingTwoSize: 48,
  headingThreeSize: 35,
  bodySize: 15,
  quoteSize: 22,
  captionSize: 12,

  headingLineHeight: 1.08,
  bodyLineHeight: 2,
  quoteLineHeight: 1.55,

  headingLetterSpacing: 0,
  bodyLetterSpacing: 0,

  paragraphSpacing: 26,
  sectionSpacing: 48,

  headingColor: "#242617",
  textColor: "#242617",
  accentColor: "#b88a3b",

  customFontName: "",
  customFontUrl: "",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fontValue(
  value: unknown,
  fallback: StoryFontChoice,
): StoryFontChoice {
  return storyFontChoices.includes(value as StoryFontChoice)
    ? (value as StoryFontChoice)
    : fallback;
}

function numberValue(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(maximum, Math.max(minimum, parsed));
}

function textValue(value: unknown, fallback: string, maximum = 100) {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, maximum);
}

function colorValue(value: unknown, fallback: string) {
  if (
    typeof value === "string" &&
    /^#[0-9a-f]{6}$/i.test(value.trim())
  ) {
    return value.trim().toLowerCase();
  }

  return fallback;
}

function fontUrlValue(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

export function normalizeStoryTypographySettings(
  value: unknown,
): StoryTypographySettings {
  if (!isObject(value)) {
    return defaultStoryTypographySettings;
  }

  const fallback = defaultStoryTypographySettings;

  return {
    titleFont: fontValue(value.titleFont, fallback.titleFont),
    headingFont: fontValue(value.headingFont, fallback.headingFont),
    bodyFont: fontValue(value.bodyFont, fallback.bodyFont),
    quoteFont: fontValue(value.quoteFont, fallback.quoteFont),
    captionFont: fontValue(value.captionFont, fallback.captionFont),

    titleSize: numberValue(value.titleSize, fallback.titleSize, 34, 100),
    headingTwoSize: numberValue(
      value.headingTwoSize,
      fallback.headingTwoSize,
      26,
      72,
    ),
    headingThreeSize: numberValue(
      value.headingThreeSize,
      fallback.headingThreeSize,
      20,
      56,
    ),
    bodySize: numberValue(value.bodySize, fallback.bodySize, 12, 24),
    quoteSize: numberValue(value.quoteSize, fallback.quoteSize, 16, 40),
    captionSize: numberValue(
      value.captionSize,
      fallback.captionSize,
      9,
      18,
    ),

    headingLineHeight: numberValue(
      value.headingLineHeight,
      fallback.headingLineHeight,
      0.9,
      1.8,
    ),
    bodyLineHeight: numberValue(
      value.bodyLineHeight,
      fallback.bodyLineHeight,
      1.2,
      2.5,
    ),
    quoteLineHeight: numberValue(
      value.quoteLineHeight,
      fallback.quoteLineHeight,
      1,
      2.2,
    ),

    headingLetterSpacing: numberValue(
      value.headingLetterSpacing,
      fallback.headingLetterSpacing,
      -0.08,
      0.2,
    ),
    bodyLetterSpacing: numberValue(
      value.bodyLetterSpacing,
      fallback.bodyLetterSpacing,
      -0.05,
      0.2,
    ),

    paragraphSpacing: numberValue(
      value.paragraphSpacing,
      fallback.paragraphSpacing,
      8,
      64,
    ),
    sectionSpacing: numberValue(
      value.sectionSpacing,
      fallback.sectionSpacing,
      16,
      100,
    ),

    headingColor: colorValue(value.headingColor, fallback.headingColor),
    textColor: colorValue(value.textColor, fallback.textColor),
    accentColor: colorValue(value.accentColor, fallback.accentColor),

    customFontName: textValue(value.customFontName, "", 80),
    customFontUrl: fontUrlValue(value.customFontUrl),
  };
}


function safeCustomFontName(value: string) {
  return value
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .trim()
    .slice(0, 80);
}

export function getStoryCustomFontFace(settings: StoryTypographySettings) {
  const fontFamily = safeCustomFontName(settings.customFontName);

  if (!fontFamily || !settings.customFontUrl) {
    return null;
  }

  return {
    fontFamily,
    url: settings.customFontUrl,
  };
}

function getStoryFontStack(
  choice: StoryTypographySettings["titleFont"],
  settings: StoryTypographySettings,
) {
  const customFont = getStoryCustomFontFace(settings);

  if (choice === "sans") {
    return 'var(--font-sans, Arial), Helvetica, sans-serif';
  }

  if (choice === "hand") {
    return 'var(--font-script, "Brush Script MT"), cursive';
  }

  if (choice === "anyway") {
    return '"Anyway", var(--font-serif, Georgia), serif';
  }

  if (choice === "custom" && customFont) {
    return `"${customFont.fontFamily}", var(--font-serif, Georgia), serif`;
  }

  return 'var(--font-serif, Georgia), "Times New Roman", serif';
}

export type StoryTypographyVariables = CSSProperties & {
  [key: `--story-${string}`]: string | number;
};

export function getStoryTypographyVariables(
  settings: StoryTypographySettings,
): StoryTypographyVariables {
  return {
    "--story-title-font": getStoryFontStack(settings.titleFont, settings),
    "--story-heading-font": getStoryFontStack(settings.headingFont, settings),
    "--story-body-font": getStoryFontStack(settings.bodyFont, settings),
    "--story-quote-font": getStoryFontStack(settings.quoteFont, settings),
    "--story-caption-font": getStoryFontStack(settings.captionFont, settings),

    "--story-title-size": `${settings.titleSize}px`,
    "--story-h2-size": `${settings.headingTwoSize}px`,
    "--story-h3-size": `${settings.headingThreeSize}px`,
    "--story-body-size": `${settings.bodySize}px`,
    "--story-quote-size": `${settings.quoteSize}px`,
    "--story-caption-size": `${settings.captionSize}px`,

    "--story-heading-line-height": String(settings.headingLineHeight),
    "--story-body-line-height": String(settings.bodyLineHeight),
    "--story-quote-line-height": String(settings.quoteLineHeight),

    "--story-heading-letter-spacing": `${settings.headingLetterSpacing}em`,
    "--story-body-letter-spacing": `${settings.bodyLetterSpacing}em`,
    "--story-paragraph-spacing": `${settings.paragraphSpacing}px`,
    "--story-section-spacing": `${settings.sectionSpacing}px`,

    "--story-heading-color": settings.headingColor,
    "--story-text-color": settings.textColor,
    "--story-accent-color": settings.accentColor,
  };
}

export async function getStoryTypographySettings(): Promise<StoryTypographySettings> {
  try {
    const setting = await db.siteSetting.findUnique({
      where: {
        key: STORY_TYPOGRAPHY_SETTING_KEY,
      },
    });

    return normalizeStoryTypographySettings(setting?.value);
  } catch {
    return defaultStoryTypographySettings;
  }
}
