import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/content/seo";
import { PortfolioPage } from "@/components/portfolio/PortfolioPage";


export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("portfolio");
}

export const dynamic = "force-dynamic";

export default function Page() {
  return <PortfolioPage />;
}
