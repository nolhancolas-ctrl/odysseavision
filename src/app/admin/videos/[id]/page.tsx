import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoForm } from "@/components/admin/videos/VideoForm";
import { db } from "@/lib/db";
import { updateVideo } from "@/server/actions/videos";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditVideoPage({ params }: PageProps) {
  const { id } = await params;

  const [video, categories] = await Promise.all([
    db.video.findUnique({
      where: { id },
      include: { category: true },
    }),
    db.videoCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);

  if (!video) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Vimeo manager
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617]">
            Edit Vimeo video
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#242617]/55">
            Update the Vimeo URL, thumbnail, description, category and
            publication status for this video.
          </p>
        </div>

        <Link
          href="/admin/videos"
          className="rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/60 transition hover:border-[#071321] hover:text-[#071321]"
        >
          Back to videos
        </Link>
      </header>

      <VideoForm
        video={video}
        categories={categories}
        action={updateVideo.bind(null, video.id)}
        submitLabel="Save Vimeo video"
      />
    </div>
  );
}
