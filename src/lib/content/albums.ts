import { db } from "@/lib/db";
import { clientAlbums as staticClientAlbums } from "@/data/clients";

export type PublicClientAlbumImage = {
  id: string;
  imageSrc: string;
  title: string;
  alt: string;
  selected: boolean;
  order: number;
};

export type PublicClientAlbum = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverSrc: string;
  href: string;
  date: string;
  location: string;
  photoCount: number;
  allowDownload: boolean;
  allowShare: boolean;
  images: PublicClientAlbumImage[];
};

function formatAlbumDate(date: Date | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getStaticAlbums(): PublicClientAlbum[] {
  return staticClientAlbums.map((album) => ({
    id: album.slug,
    slug: album.slug,
    title: album.title,
    description: "",
    coverSrc: album.cover.src,
    href: album.href,
    date: album.date,
    location: "",
    photoCount: album.photoCount,
    allowDownload: false,
    allowShare: true,
    images: [
      {
        id: `${album.slug}-cover`,
        imageSrc: album.cover.src,
        title: album.title,
        alt: album.title,
        selected: false,
        order: 0,
      },
    ],
  }));
}

export async function getPublicClientAlbums(): Promise<PublicClientAlbum[]> {
  try {
    const albums = await db.clientAlbum.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        images: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ shootingDate: "desc" }, { createdAt: "desc" }],
    });

    if (albums.length === 0) {
      return getStaticAlbums();
    }

    return albums.map((album) => {
      const images = album.images.map((image) => ({
        id: image.id,
        imageSrc: image.imageSrc,
        title: image.title ?? "",
        alt: image.alt ?? image.title ?? album.title,
        selected: image.selected,
        order: image.order,
      }));

      return {
        id: album.id,
        slug: album.slug,
        title: album.title,
        description: album.description ?? "",
        coverSrc:
          album.coverSrc ||
          images[0]?.imageSrc ||
          "/images/client-albums/album_01.png",
        href: `/client-albums/${album.slug}`,
        date: formatAlbumDate(album.shootingDate),
        location: album.location ?? "",
        photoCount: images.length,
        allowDownload: album.allowDownload,
        allowShare: album.allowShare,
        images,
      };
    });
  } catch {
    return getStaticAlbums();
  }
}

export async function getPublicClientAlbumBySlug(
  slug: string,
): Promise<PublicClientAlbum | null> {
  try {
    const album = await db.clientAlbum.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      include: {
        images: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!album) {
      return getStaticAlbums().find((item) => item.slug === slug) ?? null;
    }

    const images = album.images.map((image) => ({
      id: image.id,
      imageSrc: image.imageSrc,
      title: image.title ?? "",
      alt: image.alt ?? image.title ?? album.title,
      selected: image.selected,
      order: image.order,
    }));

    return {
      id: album.id,
      slug: album.slug,
      title: album.title,
      description: album.description ?? "",
      coverSrc:
        album.coverSrc ||
        images[0]?.imageSrc ||
        "/images/client-albums/album_01.png",
      href: `/client-albums/${album.slug}`,
      date: formatAlbumDate(album.shootingDate),
      location: album.location ?? "",
      photoCount: images.length,
      allowDownload: album.allowDownload,
      allowShare: album.allowShare,
      images,
    };
  } catch {
    return getStaticAlbums().find((item) => item.slug === slug) ?? null;
  }
}
