import Link from "next/link";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { portfolioPreviewItems } from "@/data/home";

export function HomePortfolioPreview() {
  return (
    <section className="bg-[#11190f] px-8 py-24 text-[#f4efe4] md:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <SectionLabel dark>Portfolio</SectionLabel>
          <h2 className="font-serif text-5xl uppercase tracking-[-0.04em]">
            Explore our world
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {portfolioPreviewItems.map((item) => (
            <Link
              href={item.href}
              key={item.title}
              className="group bg-[#30331f] p-5 transition hover:-translate-y-1 hover:bg-[#3b3e27]"
            >
              <p className="mb-2 font-serif text-3xl text-[#b7a879]/75">
                {item.number}
              </p>

              <h3 className="mb-6 font-serif text-4xl uppercase leading-none">
                {item.title}
              </h3>

              <PhotoFrame
                src={item.image}
                label={item.label}
                className="mb-6 h-52 w-full"
              />

              <p className="mb-5 text-sm leading-6 text-[#f4efe4]/70">
                {item.description}
              </p>

              <span className="text-[11px] uppercase tracking-[0.18em] text-[#f4efe4]">
                View gallery →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}