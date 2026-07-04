import { SplashScreen } from "@/components/layout/SplashScreen";
import { getAppearanceSettings } from "@/lib/content/appearance";
import { buildMetadata, getSeoSettings } from "@/lib/content/seo";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Cormorant_Garamond, Homemade_Apple, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const homemadeApple = Homemade_Apple({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});


function getAppearanceVariables(appearance: Awaited<ReturnType<typeof getAppearanceSettings>>) {
  const variables: CSSProperties & Record<`--${string}`, string> = {
    "--ov-cream": appearance.creamColor,
    "--ov-text": appearance.textColor,
    "--ov-green-dark": appearance.darkGreenColor,
    "--ov-navy": appearance.navyColor,
    "--ov-olive": appearance.oliveColor,
    "--ov-gold": appearance.goldColor,
    "--ov-muted-gold": appearance.mutedGoldColor,
    "--ov-header-overlay": appearance.headerOverlayColor,
    "--ov-footer-background": appearance.footerBackgroundColor,
    "--ov-base-font-size": `${appearance.baseFontSize}px`,
    "--ov-text-letter-spacing": appearance.textLetterSpacing,
    "--ov-heading-letter-spacing": appearance.headingLetterSpacing,
    "--ov-section-padding-y": `${appearance.sectionPaddingY}px`,
    "--ov-card-radius": `${appearance.cardRadius}px`,
    "--ov-button-radius": `${appearance.buttonRadius}px`,
    "--ov-shadow-strength": String(appearance.shadowStrength),
  };

  if (appearance.bodyFontFamily.trim()) {
    variables["--ov-font-sans"] = appearance.bodyFontFamily;
  }

  if (appearance.serifFontFamily.trim()) {
    variables["--ov-font-serif"] = appearance.serifFontFamily;
  }

  if (appearance.handFontFamily.trim()) {
    variables["--ov-font-hand"] = appearance.handFontFamily;
  }

  return variables;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();

  return buildMetadata(seo, "home");
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appearance = await getAppearanceSettings();

  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <body
        style={getAppearanceVariables(appearance)}
        className={`${inter.variable} ${cormorant.variable} ${homemadeApple.variable} font-sans`}
      >
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
