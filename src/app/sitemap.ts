import type { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/content/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSeoSettings();

  if (!seo.sitemapEnabled) {
    return [];
  }

  const siteUrl = seo.siteUrl.replace(/\/+$/, "");
  const now = new Date();

  return seo.pages
    .filter((page) => !page.noIndex)
    .map((page) => ({
      url: `${siteUrl}${page.path === "/" ? "" : page.path}`,
      lastModified: now,
      changeFrequency: page.path === "/" ? "weekly" : "monthly",
      priority: page.path === "/" ? 1 : 0.7,
    }));
}
