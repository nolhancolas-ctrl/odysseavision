import { db } from "@/lib/db";
import {
  featuredFilm,
  videoCategories as staticCategories,
  videos as staticVideos,
} from "@/data/videos";
import {
  extractVimeoId,
  getVimeoEmbedUrl,
  getVimeoWatchUrl,
  isPlaceholderVimeoId,
} from "@/lib/vimeo";

export type PublicVideo = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  vimeoUrl: string;
  vimeoId: string;
  embedUrl: string;
  watchUrl: string;
  thumbnailSrc: string;
  duration: string;
  date: string;
  createdAt: string;
  featured: boolean;
  playable: boolean;
};

export type PublicVideosArchive = {
  videos: PublicVideo[];
  videoCategories: string[];
  featuredVideo: PublicVideo | null;
  latestVideo: PublicVideo | null;
};

function toPlayable(vimeoUrl: string, vimeoId: string) {
  return Boolean(getVimeoEmbedUrl(vimeoUrl, vimeoId)) && !isPlaceholderVimeoId(vimeoId || vimeoUrl);
}

function getStaticVideos(): PublicVideo[] {
  return staticVideos.map((video, index) => {
    const vimeoId = video.vimeoId || extractVimeoId(video.vimeoUrl);
    const vimeoUrl = video.vimeoUrl || `https://vimeo.com/${vimeoId}`;
    const embedUrl = getVimeoEmbedUrl(vimeoUrl, vimeoId);

    return {
      id: video.slug,
      slug: video.slug,
      title: video.title,
      category: video.category,
      description: video.description,
      vimeoUrl,
      vimeoId,
      embedUrl,
      watchUrl: getVimeoWatchUrl(vimeoUrl, vimeoId),
      thumbnailSrc: video.image.src,
      duration: video.duration,
      date: "",
      createdAt: String(index).padStart(3, "0"),
      featured: index === 0,
      playable: Boolean(embedUrl) && !isPlaceholderVimeoId(vimeoId || vimeoUrl),
    };
  });
}

function getStaticFeaturedVideo() {
  const vimeoId =
    featuredFilm.vimeoId || extractVimeoId(featuredFilm.vimeoUrl);
  const vimeoUrl = featuredFilm.vimeoUrl || `https://vimeo.com/${vimeoId}`;
  const embedUrl = getVimeoEmbedUrl(vimeoUrl, vimeoId);

  return {
    id: "thailand-episode-1",
    slug: "thailand-episode-1",
    title: featuredFilm.title,
    category: "Travel films",
    description: featuredFilm.description,
    vimeoUrl,
    vimeoId,
    embedUrl,
    watchUrl: getVimeoWatchUrl(vimeoUrl, vimeoId),
    thumbnailSrc: featuredFilm.poster,
    duration: "06:48",
    date: "",
    createdAt: "999",
    featured: true,
    playable: Boolean(embedUrl) && !isPlaceholderVimeoId(vimeoId || vimeoUrl),
  };
}

export async function getPublicVideosArchive(): Promise<PublicVideosArchive> {
  try {
    const dbVideos = await db.video.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        category: true,
      },
      orderBy: [
        { featured: "desc" },
        { order: "asc" },
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });

    if (dbVideos.length === 0) {
      const videos = getStaticVideos();
      const latestVideo = videos[0] ?? getStaticFeaturedVideo();

      return {
        videos,
        videoCategories: staticCategories,
        featuredVideo: getStaticFeaturedVideo(),
        latestVideo,
      };
    }

    const videos = dbVideos.map((video) => {
      const vimeoId = video.vimeoId || extractVimeoId(video.vimeoUrl);
      const vimeoUrl =
        video.vimeoUrl || (vimeoId ? `https://vimeo.com/${vimeoId}` : "");
      const embedUrl = getVimeoEmbedUrl(vimeoUrl, vimeoId);

      return {
        id: video.id,
        slug: video.slug,
        title: video.title,
        category: video.category?.name ?? "Films",
        description: video.description ?? "",
        vimeoUrl,
        vimeoId,
        embedUrl,
        watchUrl: getVimeoWatchUrl(vimeoUrl, vimeoId),
        thumbnailSrc: video.thumbnailSrc,
        duration: video.duration ?? "",
        date: video.date ? video.date.toISOString().slice(0, 10) : "",
        createdAt: video.createdAt.toISOString(),
        featured: video.featured,
        playable: Boolean(embedUrl) && !isPlaceholderVimeoId(vimeoId || vimeoUrl),
      };
    });

    const categories = Array.from(
      new Set(videos.map((video) => video.category).filter(Boolean)),
    );

    const latestVideo =
      [...videos].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ??
      null;

    return {
      videos,
      videoCategories: ["All films", ...categories],
      featuredVideo: videos.find((video) => video.featured) ?? videos[0] ?? null,
      latestVideo,
    };
  } catch {
    const videos = getStaticVideos();
    const latestVideo = videos[0] ?? getStaticFeaturedVideo();

    return {
      videos,
      videoCategories: staticCategories,
      featuredVideo: getStaticFeaturedVideo(),
      latestVideo,
    };
  }
}
