import type { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/content/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettings();

  const rules = seo.robotsIndex
    ? {
        userAgent: "*",
        allow: "/",
      }
    : {
        userAgent: "*",
        disallow: "/",
      };

  return {
    rules,
    sitemap: seo.sitemapEnabled
      ? `${seo.siteUrl.replace(/\/+$/, "")}/sitemap.xml`
      : undefined,
  };
}
