import { db } from "@/lib/db";

export const PHOTO_WATERMARK_SETTING_KEY = "photoWatermark";

export type PhotoWatermarkSettings = {
  enabled: boolean;
};

export const DEFAULT_PHOTO_WATERMARK_SETTINGS: PhotoWatermarkSettings = {
  enabled: true,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function getPhotoWatermarkSettings(): Promise<PhotoWatermarkSettings> {
  const setting = await db.siteSetting.findUnique({
    where: {
      key: PHOTO_WATERMARK_SETTING_KEY,
    },
  });

  if (!isObject(setting?.value)) {
    return DEFAULT_PHOTO_WATERMARK_SETTINGS;
  }

  return {
    enabled:
      typeof setting.value.enabled === "boolean"
        ? setting.value.enabled
        : DEFAULT_PHOTO_WATERMARK_SETTINGS.enabled,
  };
}
