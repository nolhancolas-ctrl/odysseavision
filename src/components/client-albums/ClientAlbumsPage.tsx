import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ClientAlbumsHero } from "./ClientAlbumsHero";
import { ClientAlbumsIntro } from "./ClientAlbumsIntro";
import { ClientAlbumsRecent } from "./ClientAlbumsRecent";
import { ClientAlbumsAccess } from "./ClientAlbumsAccess";
import { ClientAlbumsFinalCTA } from "./ClientAlbumsFinalCTA";

export function ClientAlbumsPage() {
  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Client Albums" />
      <ClientAlbumsHero />
      <ClientAlbumsIntro />
      <ClientAlbumsRecent />
      <ClientAlbumsAccess />
      <ClientAlbumsFinalCTA />
      <SiteFooter />
    </main>
  );
}
