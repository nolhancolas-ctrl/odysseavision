import { getPublicPortfolioItems } from "@/lib/content/portfolio";
import type { PublicSectionContent } from "@/lib/content/site";

type PortfolioLiveGalleryProps = {
  content?: PublicSectionContent;
};

export async function PortfolioLiveGallery({
  content,
}: PortfolioLiveGalleryProps) {
  const items = await getPublicPortfolioItems();

  return (
    <section className="bg-[#10190f] px-6 py-20 text-[#f4efe4] md:px-14 md:py-24">
      <div className="mx-auto max-w-[1450px]">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f4efe4]/45">
              {content?.eyebrow || "Published from admin"}
            </p>
            <h2 className="mt-4 font-serif text-5xl uppercase tracking-[-0.04em] md:text-6xl">
              {content?.title || "Latest frames"}
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-[#f4efe4]/55">
            {content?.description ||
              "This gallery now reads published portfolio items from the admin platform."}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden bg-[#30331f]"
            >
              <div
                className="aspect-[4/3] bg-[#242617] bg-cover bg-center transition duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${item.imageSrc})` }}
              />

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b7a879]">
                    {item.category}
                  </p>

                  {item.featured ? (
                    <span className="rounded-full border border-[#f4efe4]/15 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-[#f4efe4]/55">
                      Featured
                    </span>
                  ) : null}
                </div>

                <h3 className="font-serif text-3xl uppercase leading-none">
                  {item.title}
                </h3>

                {item.description ? (
                  <p className="mt-4 text-sm leading-6 text-[#f4efe4]/62">
                    {item.description}
                  </p>
                ) : null}

                {item.location ? (
                  <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#f4efe4]/42">
                    {item.location}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
