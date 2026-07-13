import type { PublicSectionContent } from "@/lib/content/site";

export function shouldShowImageWatermark(
  content: PublicSectionContent | undefined,
  key: string,
  defaultValue = true,
) {
  return content?.imageWatermarks?.[key] ?? defaultValue;
}
