import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/content/seo";
import { AboutPage } from "@/components/about/AboutPage";


export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("about");
}

export const dynamic = "force-dynamic";

export default function Page() {
  return <AboutPage />;
}
