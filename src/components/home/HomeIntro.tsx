import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { homeImages } from "@/data/home";

export function HomeIntro() {
  return (
    <section className="bg-[#f4efe4] px-8 py-24 md:px-14">
      <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-[0.9fr_1.4fr]">
        <div>
          <SectionLabel>Welcome</SectionLabel>

          <h2 className="font-serif text-5xl uppercase leading-[0.95] tracking-[-0.04em] md:text-6xl">
            Visual Storytellers
            <br />& Ocean Lovers
          </h2>

          <div className="my-8 h-px w-16 bg-[#596044]" />

          <p className="max-w-md text-sm leading-7 text-[#333525]/75">
            We travel the world in search of wild places, genuine encounters and
            stories that inspire. Through photography and film, we aim to share
            the beauty of our planet, raise awareness about its fragility and
            remind us all why it’s worth protecting.
          </p>

          <a
            href="/about"
            className="mt-8 inline-flex text-[11px] font-semibold uppercase tracking-[0.18em] text-[#333525] underline underline-offset-8"
          >
            Discover our story →
          </a>
        </div>

        <PhotoFrame
          src={homeImages.introDuo.src}
          label={homeImages.introDuo.label}
          className="h-[440px] w-full"
        />
      </div>
    </section>
  );
}