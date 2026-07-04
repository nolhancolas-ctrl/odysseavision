import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/content/seo";
import { StoriesPage } from "@/components/stories/StoriesPage";


export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("stories");
}

export const dynamic = "force-dynamic";

export default function Page() {
  return <StoriesPage />;
}
