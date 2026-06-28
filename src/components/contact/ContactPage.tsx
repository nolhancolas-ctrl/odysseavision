import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ContactHero } from "./ContactHero";
import { ContactServices } from "./ContactServices";
import { ContactNewsletter } from "./ContactNewsletter";
import { ContactFormSection } from "./ContactFormSection";

export function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Contact" />
      <ContactHero />
      <ContactServices />
      <ContactFormSection />
      <ContactNewsletter />
      <SiteFooter />
    </main>
  );
}
