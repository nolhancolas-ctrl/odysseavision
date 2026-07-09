import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WatermarkedPhotoFrame } from "@/components/ui/WatermarkedPhotoFrame";
import { getPhotoWatermarkSettings } from "@/lib/content/photo-watermark";
import { ClientAlbumPasswordGate } from "@/components/client-albums/ClientAlbumPasswordGate";
import { db } from "@/lib/db";
import {
  getAlbumAccessCookieName,
  getAlbumAccessToken,
} from "@/lib/client-albums/access";
import { getPublicClientAlbumBySlug } from "@/lib/content/albums";

export const dynamic = "force-dynamic";

type ClientAlbumPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function hasAlbumAccess(slug: string) {
  const album = await db.clientAlbum.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!album?.passwordHash) {
    return {
      requiresPassword: false,
      hasAccess: true,
    };
  }

  const cookieStore = await cookies();
  const cookieValue =
    cookieStore.get(getAlbumAccessCookieName(album.id))?.value ?? "";

  return {
    requiresPassword: true,
    hasAccess:
      cookieValue === getAlbumAccessToken(album.id, album.passwordHash),
  };
}

export default async function ClientAlbumPage({ params }: ClientAlbumPageProps) {
  const { slug } = await params;
  const album = await getPublicClientAlbumBySlug(slug);

  if (!album) {
    notFound();
  }

  const access = await hasAlbumAccess(slug);
  const photoWatermark = await getPhotoWatermarkSettings();

  if (access.requiresPassword && !access.hasAccess) {
    return (
      <main className="min-h-screen bg-[#11190f] text-[#f4efe4]">
        <SiteHeader active="Client Albums" />

        <section className="relative min-h-screen overflow-hidden">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
            style={{ backgroundImage: `url(${album.coverSrc})` }}
          />
          <div className="absolute inset-0 bg-[#11190f]/78" />

          <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-32 md:px-14">
            <Link
              href="/client-albums"
              className="mb-10 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 transition hover:text-white"
            >
              Back to client albums
            </Link>

            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">
              Private gallery
            </p>

            <h1 className="font-serif text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.9] tracking-[-0.05em]">
              {album.title}
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/65">
              This gallery is password protected. Enter the gallery password to
              view the preview images and delivery link.
            </p>

            <ClientAlbumPasswordGate slug={album.slug} />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Client Albums" />

      <section className="relative min-h-[78svh] overflow-hidden bg-[#11190f] text-[#f4efe4]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${album.coverSrc})` }}
        />
        <div className="absolute inset-0 bg-[#11190f]/65" />

        <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-5xl flex-col justify-end px-6 pb-20 pt-36 md:px-14">
          <Link
            href="/client-albums"
            className="mb-10 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
          >
            Back to client albums
          </Link>

          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            Private gallery
          </p>

          <h1 className="font-serif text-[clamp(3rem,7vw,7rem)] uppercase leading-[0.9] tracking-[-0.05em]">
            {album.title}
          </h1>

          <div className="my-7 h-px w-16 bg-white/45" />

          {album.description ? (
            <p className="max-w-2xl text-sm leading-7 text-white/72">
              {album.description}
            </p>
          ) : null}

          <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-white/45">
            {album.date || "Private gallery"}
            {album.location ? ` · ${album.location}` : ""}
            {album.photoCount ? ` · ${album.photoCount} photos` : ""}
          </p>

          {album.allowDownload && album.externalDownloadUrl ? (
            <Link
              href={album.externalDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-fit rounded-full bg-[#f4efe4] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#11190f] transition hover:bg-[#b88a3b]"
            >
              Download
            </Link>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-16 md:px-14 md:py-20">
        <div className="mx-auto max-w-[1450px]">
          {album.images.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {album.images.map((image) => (
                <article key={image.id}>
                  <WatermarkedPhotoFrame
                    src={image.imageSrc}
                    alt={image.alt}
                    className="aspect-[1.35]"
                    showWatermark={photoWatermark.enabled}
                  />
                  {image.title ? (
                    <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#242617]/45">
                      {image.title}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-8 text-center text-sm text-[#242617]/55">
              This gallery has no preview photos yet.
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
