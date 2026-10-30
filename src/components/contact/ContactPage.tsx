import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getFormsSettings } from "@/lib/content/forms";
import { getSeoSettings } from "@/lib/content/seo";
import { getPublicPageContent } from "@/lib/content/site";
import { ContactHero } from "./ContactHero";
import { ContactServices } from "./ContactServices";
import { ContactNewsletter } from "./ContactNewsletter";
import { ContactFormSection } from "./ContactFormSection";

export async function ContactPage() {
  const [pageContent, formsSettings, seoSettings] = await Promise.all([
    getPublicPageContent("contact"),
    getFormsSettings(),
    getSeoSettings(),
  ]);

  const sections = pageContent?.sections ?? {};

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Contact" />
      <ContactHero content={sections.hero} />
      <ContactServices content={sections.services} />
      <ContactFormSection
        content={sections.form}
        settings={formsSettings}
        instagramUrl={seoSettings.instagramUrl.trim()}
      />
      <ContactNewsletter content={sections.newsletter} />
      <SiteFooter />
    </main>
  );
}
