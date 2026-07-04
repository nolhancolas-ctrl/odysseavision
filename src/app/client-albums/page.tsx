import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/content/seo";
import { ClientAlbumsPage } from "@/components/client-albums/ClientAlbumsPage";


export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("client-albums");
}

export const dynamic = "force-dynamic";

export default function Page() {
  return <ClientAlbumsPage />;
}
