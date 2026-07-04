import Link from "next/link";
import { db } from "@/lib/db";
import { updateFeaturedFilmSelection } from "@/server/actions/site";
import { getVimeoWatchUrl } from "@/lib/vimeo";
import { FeaturedFilmSelectorDropdown } from "./FeaturedFilmSelectorDropdown";

export async function FeaturedFilmSelectorForm() {
  const [videos, savedSection] = await Promise.all([
    db.video.findMany({
      include: {
        category: true,
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    db.pageContent.findUnique({
      where: {
        pageKey_sectionKey: {
          pageKey: "videos",
          sectionKey: "featured-film",
        },
      },
    }),
  ]);

  const savedContent =
    savedSection?.content &&
    typeof savedSection.content === "object" &&
    !Array.isArray(savedSection.content)
      ? savedSection.content
      : {};

  const rawSelected =
    "featuredVideoId" in savedContent
      ? String(savedContent.featuredVideoId ?? "__latest__")
      : "__latest__";

  const selectedValue = rawSelected || "__latest__";

  const currentVideo =
    selectedValue === "__latest__"
      ? videos[0] ?? null
      : videos.find((video) => video.id === selectedValue) ?? videos[0] ?? null;

  const watchUrl = currentVideo
    ? getVimeoWatchUrl(currentVideo.vimeoUrl, currentVideo.vimeoId)
    : "";

  return (
    <section className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
      <div className="flex flex-col justify-between gap-5 border-b border-[#242617]/10 pb-5 md:flex-row md:items-start">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b88a3b]">
            Featured film
          </p>
          <h2 className="mt-2 font-serif text-3xl leading-none text-[#242617]">
            Featured video source
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Choose which uploaded Vimeo video appears in the Featured Film block.
            By default, the latest uploaded video is displayed.
          </p>
        </div>

        {currentVideo ? (
          <span className="rounded-full border border-[#b88a3b]/25 bg-[#d5ad68]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b88a3b]">
            {selectedValue === "__latest__" ? "Latest video" : "Selected video"}
          </span>
        ) : null}
      </div>

      <form action={updateFeaturedFilmSelection} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
            Featured film selector
          </label>

          <FeaturedFilmSelectorDropdown
            defaultValue={selectedValue}
            videos={videos.map((video) => ({
              id: video.id,
              title: video.title,
            }))}
          />
        </div>

        {currentVideo ? (
          <div className="grid gap-5 rounded-[1.5rem] border border-[#242617]/10 bg-[#f4efe4]/60 p-4 md:grid-cols-[220px_1fr_auto] md:items-center">
            <div
              className="aspect-video rounded-2xl bg-[#071321] bg-cover bg-center"
              style={{ backgroundImage: `url(${currentVideo.thumbnailSrc})` }}
            />

            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                  {currentVideo.status}
                </span>

                {currentVideo.category ? (
                  <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                    {currentVideo.category.name}
                  </span>
                ) : null}
              </div>

              <h3 className="font-serif text-2xl uppercase leading-none text-[#242617]">
                {currentVideo.title}
              </h3>

              <p className="mt-2 break-all text-xs leading-5 text-[#242617]/45">
                {currentVideo.vimeoUrl || "No Vimeo URL yet"}
              </p>
            </div>

            <div className="flex gap-2 md:justify-end">
              {watchUrl ? (
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[#242617]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/65 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
                >
                  Open
                </a>
              ) : null}

              <Link
                href={`/admin/videos/${currentVideo.id}`}
                className="rounded-full border border-[#242617]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/65 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
              >
                Edit
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-[#242617]/15 bg-[#f4efe4]/50 p-6 text-sm text-[#242617]/50">
            No uploaded videos yet.
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="cursor-pointer rounded-full bg-[#071008] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#d5ad68] hover:text-[#071008]"
          >
            Save selection
          </button>
        </div>
      </form>
    </section>
  );
}
