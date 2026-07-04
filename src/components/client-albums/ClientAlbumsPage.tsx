import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicClientAlbums } from "@/lib/content/albums";
import { getPublicPageContent } from "@/lib/content/site";
import { ClientAlbumsHero } from "./ClientAlbumsHero";
import { ClientAlbumsIntro } from "./ClientAlbumsIntro";
import { ClientAlbumsRecent } from "./ClientAlbumsRecent";
import { ClientAlbumsAccess } from "./ClientAlbumsAccess";
import { ClientAlbumsFinalCTA } from "./ClientAlbumsFinalCTA";

export async function ClientAlbumsPage() {
  const [pageContent, albums] = await Promise.all([
    getPublicPageContent("client-albums"),
    getPublicClientAlbums(),
  ]);

  const sections = pageContent?.sections ?? {};

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Client Albums" />
      <ClientAlbumsHero content={sections.hero} />
      <ClientAlbumsIntro content={sections.intro} />
      <ClientAlbumsRecent content={sections.recent} albums={albums} />
      <ClientAlbumsAccess content={sections.access} />
      <ClientAlbumsFinalCTA content={sections["final-cta"]} />
      <SiteFooter />
    </main>
  );
}
