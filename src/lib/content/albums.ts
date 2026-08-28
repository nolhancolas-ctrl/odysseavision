import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { clientAlbums as staticClientAlbums } from "@/data/clients";

type ClientAlbumWithImages = Prisma.ClientAlbumGetPayload<{
  include: {
    images: true;
  };
}>;

export type PublicClientAlbumImage = {
  id: string;
  imageSrc: string;
  title: string;
  alt: string;
  watermark: string;
  selected: boolean;
  order: number;
};

export type PublicClientAlbumSummary = {
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
  externalDownloadUrl: string;
  externalDownloadLabel: string;
};

export type PublicClientAlbum = PublicClientAlbumSummary & {
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
    externalDownloadUrl: "",
    externalDownloadLabel: "",
    images: [
      {
        id: `${album.slug}-cover`,
        imageSrc: album.cover.src,
        title: album.title,
        alt: album.title,
        watermark: "NONE",
        selected: false,
        order: 0,
      },
    ],
  }));
}

function mapAlbum(album: ClientAlbumWithImages): PublicClientAlbum {
  const images = album.images.map((image) => ({
    id: image.id,
    imageSrc: image.imageSrc,
    title: image.title ?? "",
    alt: image.alt ?? image.title ?? album.title,
    watermark: image.watermark,
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
    externalDownloadUrl: album.externalDownloadUrl ?? "",
    externalDownloadLabel:
      album.externalDownloadLabel || "Download full gallery",
    images,
  };
}

export async function getPublicClientAlbumSummaries(): Promise<
  PublicClientAlbumSummary[]
> {
  try {
    const albums = await db.clientAlbum.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        coverSrc: true,
        shootingDate: true,
        location: true,
        allowDownload: true,
        allowShare: true,
        externalDownloadUrl: true,
        externalDownloadLabel: true,
        images: {
          select: {
            imageSrc: true,
          },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          take: 1,
        },
        _count: {
          select: {
            images: true,
          },
        },
      },
      orderBy: [{ order: "asc" }, { shootingDate: "desc" }, { createdAt: "desc" }],
    });

    return albums.map((album) => ({
      id: album.id,
      slug: album.slug,
      title: album.title,
      description: album.description ?? "",
      coverSrc:
        album.coverSrc ||
        album.images[0]?.imageSrc ||
        "/images/client-albums/album_01.png",
      href: `/client-albums/${album.slug}`,
      date: formatAlbumDate(album.shootingDate),
      location: album.location ?? "",
      photoCount: album._count.images,
      allowDownload: album.allowDownload,
      allowShare: album.allowShare,
      externalDownloadUrl: album.externalDownloadUrl ?? "",
      externalDownloadLabel:
        album.externalDownloadLabel || "Download full gallery",
    }));
  } catch {
    return [];
  }
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
      orderBy: [{ order: "asc" }, { shootingDate: "desc" }, { createdAt: "desc" }],
    });

    if (albums.length === 0) {
      return [];
    }

    return albums.map(mapAlbum);
  } catch {
    return [];
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
      return null;
    }

    return mapAlbum(album);
  } catch {
    return null;
  }
}
