import { recentImages } from "@/data/portfolio";

export function PortfolioRecent() {
  return (
    <section className="bg-[#f4efe4] px-6 py-14 md:px-10">
      <p className="mb-8 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#242617]/65">
        Recent shots from the wild
      </p>

      <div className="mx-auto grid max-w-[1450px] grid-cols-2 gap-2 lg:grid-cols-4">
        {recentImages.map((image) => (
          <div
            key={image.src}
            className="aspect-[1.5] bg-[#d8d1c4] bg-cover bg-center"
            style={{ backgroundImage: `url(${image.src})` }}
          />
        ))}
      </div>

      <p className="mt-7 text-center text-[9px] font-semibold uppercase tracking-[0.18em]">
        View more on Instagram →
      </p>
    </section>
  );
}
