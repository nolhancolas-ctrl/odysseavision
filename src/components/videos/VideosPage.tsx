import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  getPublicPageContent,
  type PublicSectionContent,
} from "@/lib/content/site";
import { getPublicVideosArchive } from "@/lib/content/videos";
import { VideosHero } from "./VideosHero";
import { FeaturedFilm } from "./FeaturedFilm";
import { VideoCollection } from "./VideoCollection";
import { VideosInspiration } from "./VideosInspiration";
import { VideosFinalCTA } from "./VideosFinalCTA";

type FeaturedFilmSettings = PublicSectionContent & {
  featuredVideoMode?: string;
  featuredVideoId?: string;
};

export async function VideosPage() {
  const [pageContent, archive] = await Promise.all([
    getPublicPageContent("videos"),
    getPublicVideosArchive(),
  ]);

  const sections = pageContent?.sections ?? {};
  const featuredSettings = sections["featured-film"] as
    | FeaturedFilmSettings
    | undefined;

  const selectedFeaturedVideo =
    featuredSettings?.featuredVideoId &&
    featuredSettings.featuredVideoId !== "__latest__"
      ? archive.videos.find(
          (video) => video.id === featuredSettings.featuredVideoId,
        ) ??
        archive.latestVideo ??
        archive.featuredVideo
      : archive.latestVideo ?? archive.featuredVideo;

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Videos" />
      <VideosHero content={sections.hero} />
      <FeaturedFilm video={selectedFeaturedVideo} />
      <VideoCollection
        content={sections.collection}
        videos={archive.videos}
        videoCategories={archive.videoCategories}
      />
      <VideosInspiration content={sections.inspiration} />
      <VideosFinalCTA content={sections["final-cta"]} />
      <SiteFooter />
    </main>
  );
}
