import Link from "next/link";
import { portfolioPreviewItems } from "@/data/home";

export function PortfolioCategories() {
  return (
    <section className="bg-[#f4efe4] px-6 py-16 md:px-14 md:py-20">
      <p className="mb-10 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#242617]/65">
        Explore our categories
      </p>

      <div className="mx-auto grid max-w-[1450px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {portfolioPreviewItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group relative min-h-[470px] overflow-hidden bg-[#172016] text-white"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="absolute inset-0 bg-black/40" />

            <div className="relative flex h-full min-h-[470px] flex-col p-6">
              <p className="font-serif text-2xl text-white/55">{item.number}</p>
              <h2 className="font-serif text-4xl uppercase">{item.title}</h2>
              <div className="mt-4 h-px w-10 bg-white/50" />

              <div className="mt-auto">
                <p className="mb-5 text-xs leading-6 text-white/75">
                  {item.description}
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                  Explore →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
