import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { homeImages } from "@/data/home";
import type { PublicSectionContent } from "@/lib/content/site";

type HomeAboutPreviewProps = {
  content?: PublicSectionContent;
};

function fileLabel(src: string, fallback: string) {
  return src.split("/").pop() || fallback;
}

export function HomeAboutPreview({ content }: HomeAboutPreviewProps) {
  const image = content?.images.photo || content?.imageSrc || homeImages.aboutDuo.src;

  return (
    <section className="grid bg-[#11190f] text-[#f4efe4] lg:grid-cols-2">
      <div className="flex items-center px-6 py-16 md:px-14 lg:px-24">
        <div>
          <p className="mb-5 text-[11px] uppercase tracking-[0.24em] text-[#f4efe4]/55">
            {content?.eyebrow || "Meet Andrew & Morgane"}
          </p>

          <h2 className="font-serif text-5xl uppercase leading-none tracking-[-0.04em] md:text-6xl">
            {content?.title || "Two souls, one vision"}
          </h2>

          <p className="mt-6 max-w-md text-sm leading-7 text-[#f4efe4]/70">
            {content?.description ||
              "We’re a couple, a team and partners in adventure. Photography brought us together and the ocean keeps guiding our path."}
          </p>

          <a
            href={content?.ctaHref || "/about"}
            className="mt-8 inline-flex text-[11px] uppercase tracking-[0.18em] underline underline-offset-8"
          >
            {content?.ctaLabel || "More about us"}
          </a>
        </div>
      </div>

      {image ? (
        <PhotoFrame
          src={image}
          label={fileLabel(image, homeImages.aboutDuo.label)}
          className="h-[380px] w-full border-0 lg:h-auto"
        />
      ) : null}
    </section>
  );
}
