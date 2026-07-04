import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/content/seo";
import { ContactPage } from "@/components/contact/ContactPage";


export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("contact");
}

export const dynamic = "force-dynamic";

export default function Page() {
  return <ContactPage />;
}
