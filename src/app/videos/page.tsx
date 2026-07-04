import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/content/seo";
import { VideosPage } from "@/components/videos/VideosPage";


export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("videos");
}

export const dynamic = "force-dynamic";

export default function Page() {
  return <VideosPage />;
}
