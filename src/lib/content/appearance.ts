import { db } from "@/lib/db";

export const APPEARANCE_SETTING_KEY = "appearance";

export type AppearanceSettings = {
  brandLineOne: string;
  brandLineTwo: string;
  publicLogoSrc: string;

  bodyFontFamily: string;
  serifFontFamily: string;
  handFontFamily: string;
  baseFontSize: number;
  textLetterSpacing: string;
  headingLetterSpacing: string;

  creamColor: string;
  textColor: string;
  darkGreenColor: string;
  navyColor: string;
  oliveColor: string;
  goldColor: string;
  mutedGoldColor: string;

  headerOverlayColor: string;
  footerBackgroundColor: string;

  sectionPaddingY: number;
  cardRadius: number;
  buttonRadius: number;
  shadowStrength: number;

  splashEnabled: boolean;
  splashOuterLogoSrc: string;
  splashInnerLogoSrc: string;
  splashText: string;
  splashBackgroundColor: string;
  splashTextColor: string;
  splashInitialDuration: number;
  splashRouteDuration: number;
};

export const defaultAppearanceSettings: AppearanceSettings = {
  brandLineOne: "Odyssea",
  brandLineTwo: "Vision",
  publicLogoSrc: "/images/admin/odyssea_logo.png",

  bodyFontFamily: "",
  serifFontFamily: "",
  handFontFamily: "",
  baseFontSize: 16,
  textLetterSpacing: "0em",
  headingLetterSpacing: "-0.04em",

  creamColor: "#f4efe4",
  textColor: "#242617",
  darkGreenColor: "#11190f",
  navyColor: "#071321",
  oliveColor: "#596044",
  goldColor: "#d5ad68",
  mutedGoldColor: "#b88a3b",

  headerOverlayColor: "#071008",
  footerBackgroundColor: "#030b05",

  sectionPaddingY: 80,
  cardRadius: 32,
  buttonRadius: 999,
  shadowStrength: 0.06,

  splashEnabled: true,
  splashOuterLogoSrc: "/images/splash/logo_outer.png",
  splashInnerLogoSrc: "/images/splash/logo_inner.png",
  splashText: "Odyssea Vision",
  splashBackgroundColor: "#f4efe4",
  splashTextColor: "#071f5c",
  splashInitialDuration: 1400,
  splashRouteDuration: 850,
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

function numberValue(value: unknown, fallback: number, min = 0, max = 9999) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function normalizeAppearanceSettings(value: unknown): AppearanceSettings {
  if (!isObject(value)) {
    return defaultAppearanceSettings;
  }

  return {
    brandLineOne: textValue(value.brandLineOne, defaultAppearanceSettings.brandLineOne),
    brandLineTwo: textValue(value.brandLineTwo, defaultAppearanceSettings.brandLineTwo),
    publicLogoSrc: textValue(value.publicLogoSrc, defaultAppearanceSettings.publicLogoSrc),

    bodyFontFamily: textValue(value.bodyFontFamily, defaultAppearanceSettings.bodyFontFamily),
    serifFontFamily: textValue(value.serifFontFamily, defaultAppearanceSettings.serifFontFamily),
    handFontFamily: textValue(value.handFontFamily, defaultAppearanceSettings.handFontFamily),
    baseFontSize: numberValue(value.baseFontSize, defaultAppearanceSettings.baseFontSize, 12, 22),
    textLetterSpacing: textValue(value.textLetterSpacing, defaultAppearanceSettings.textLetterSpacing),
    headingLetterSpacing: textValue(value.headingLetterSpacing, defaultAppearanceSettings.headingLetterSpacing),

    creamColor: textValue(value.creamColor, defaultAppearanceSettings.creamColor),
    textColor: textValue(value.textColor, defaultAppearanceSettings.textColor),
    darkGreenColor: textValue(value.darkGreenColor, defaultAppearanceSettings.darkGreenColor),
    navyColor: textValue(value.navyColor, defaultAppearanceSettings.navyColor),
    oliveColor: textValue(value.oliveColor, defaultAppearanceSettings.oliveColor),
    goldColor: textValue(value.goldColor, defaultAppearanceSettings.goldColor),
    mutedGoldColor: textValue(value.mutedGoldColor, defaultAppearanceSettings.mutedGoldColor),

    headerOverlayColor: textValue(value.headerOverlayColor, defaultAppearanceSettings.headerOverlayColor),
    footerBackgroundColor: textValue(value.footerBackgroundColor, defaultAppearanceSettings.footerBackgroundColor),

    sectionPaddingY: numberValue(value.sectionPaddingY, defaultAppearanceSettings.sectionPaddingY, 24, 180),
    cardRadius: numberValue(value.cardRadius, defaultAppearanceSettings.cardRadius, 0, 80),
    buttonRadius: numberValue(value.buttonRadius, defaultAppearanceSettings.buttonRadius, 0, 999),
    shadowStrength: numberValue(value.shadowStrength, defaultAppearanceSettings.shadowStrength, 0, 0.35),

    splashEnabled: boolValue(value.splashEnabled, defaultAppearanceSettings.splashEnabled),
    splashOuterLogoSrc: textValue(value.splashOuterLogoSrc, defaultAppearanceSettings.splashOuterLogoSrc),
    splashInnerLogoSrc: textValue(value.splashInnerLogoSrc, defaultAppearanceSettings.splashInnerLogoSrc),
    splashText: textValue(value.splashText, defaultAppearanceSettings.splashText),
    splashBackgroundColor: textValue(value.splashBackgroundColor, defaultAppearanceSettings.splashBackgroundColor),
    splashTextColor: textValue(value.splashTextColor, defaultAppearanceSettings.splashTextColor),
    splashInitialDuration: numberValue(value.splashInitialDuration, defaultAppearanceSettings.splashInitialDuration, 0, 6000),
    splashRouteDuration: numberValue(value.splashRouteDuration, defaultAppearanceSettings.splashRouteDuration, 0, 3000),
  };
}

export async function getAppearanceSettings(): Promise<AppearanceSettings> {
  try {
    const setting = await db.siteSetting.findUnique({
      where: {
        key: APPEARANCE_SETTING_KEY,
      },
    });

    return normalizeAppearanceSettings(setting?.value);
  } catch {
    return defaultAppearanceSettings;
  }
}
