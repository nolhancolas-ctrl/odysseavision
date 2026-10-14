import type { Metadata } from "next";

export const DEFAULT_FAVICON_SRC = "/images/seo/odyssea-blue-lens-v1-32.png";

export function resolveFaviconSrc(value: unknown): string {
  const source = typeof value === "string" ? value.trim() : "";
  const path = source.split(/[?#]/)[0];
  return !source || path === "/favicon.ico" || path === "/images/seo/favicon.png"
    ? DEFAULT_FAVICON_SRC
    : source;
}

export function faviconMetadata(value: unknown): Metadata["icons"] {
  const source = resolveFaviconSrc(value);
  // Preserve the SEO editor's ability to select a custom icon later.
  if (source !== DEFAULT_FAVICON_SRC) return { icon: source };

  return {
    icon: [
      { url: DEFAULT_FAVICON_SRC, sizes: "32x32", type: "image/png" },
      { url: "/images/seo/odyssea-blue-lens-v1-48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: DEFAULT_FAVICON_SRC,
    apple: [{ url: "/images/seo/odyssea-blue-lens-v1-180.png", sizes: "180x180", type: "image/png" }],
  };
}

