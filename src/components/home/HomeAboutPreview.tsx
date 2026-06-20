import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { homeImages } from "@/data/home";

export function HomeAboutPreview() {
  return (
    <section className="grid bg-[#11190f] text-[#f4efe4] md:grid-cols-2">
      <div className="flex items-center px-8 py-20 md:px-24">
        <div>
          <p className="mb-5 text-[11px] uppercase tracking-[0.24em] text-[#f4efe4]/55">
            Meet Andrew & Morgane
          </p>

          <h2 className="font-serif text-5xl uppercase leading-none tracking-[-0.04em]">
            Two souls, one vision
          </h2>

          <p className="mt-6 max-w-md text-sm leading-7 text-[#f4efe4]/70">
            We’re a couple, a team and partners in adventure. Photography
            brought us together and the ocean keeps guiding our path.
          </p>

          <a
            href="/about"
            className="mt-8 inline-flex text-[11px] uppercase tracking-[0.18em] underline underline-offset-8"
          >
            More about us →
          </a>
        </div>
      </div>

      <PhotoFrame
        src={homeImages.aboutDuo.src}
        label={homeImages.aboutDuo.label}
        className="h-[420px] w-full border-0 md:h-auto"
      />
    </section>
  );
}