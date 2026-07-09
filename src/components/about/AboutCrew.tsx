import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { aboutImages } from "@/data/about";
import type { PublicSectionContent } from "@/lib/content/site";

type AboutCrewProps = {
  content?: PublicSectionContent;
};

function fileLabel(src: string, fallback: string) {
  return src.split("/").pop() || fallback;
}

function shouldShowWatermark(
  content: PublicSectionContent | undefined,
  key: string,
  defaultValue = true,
) {
  return content?.imageWatermarks?.[key] ?? defaultValue;
}

const defaultAndrewDescription = `Golden retriever energy, always up for the next adventure. Sporty, smiley and often the goofy one.

Serious when it comes to driving a boat or guiding divers, he loves capturing real, raw moments through film.

The ocean is his home.`;

const defaultMorganeDescription = `Photographer, dreamer and ocean lover. She sees beauty in the small details and seeks the magic in every place.

Passionate about marine life and conservation, she brings a sensitive eye to every story we tell.

Always chasing the light.`;

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split("\n")
        .filter(Boolean)
        .map((paragraph) => (
          <p
            key={paragraph}
            className="mt-5 text-sm leading-8 text-[#333525]/75 first:mt-0"
          >
            {paragraph}
          </p>
        ))}
    </>
  );
}

export function AboutCrew({ content }: AboutCrewProps) {
  const andrewImage = content?.images.andrew || aboutImages.crewAndrew.src;
  const morganeImage = content?.images.morgane || aboutImages.crewMorgane.src;
  const andrewDescription =
    content?.andrewDescription || defaultAndrewDescription;
  const morganeDescription =
    content?.morganeDescription || defaultMorganeDescription;

  return (
    <section className="bg-[#f4efe4] px-6 py-20 text-[#242617] md:px-14 md:py-24">
      <div className="mx-auto max-w-[1250px]">
        <div className="mb-14 text-center">
          <h2 className="font-serif text-5xl uppercase tracking-[-0.04em] md:text-6xl">
            {content?.title || "Meet the crew"}
          </h2>
          <div className="mx-auto mt-5 h-px w-14 bg-[#596044]" />
        </div>

        <div className="grid gap-14 lg:grid-cols-2">
          <article className="grid items-center gap-8 md:grid-cols-[0.8fr_1fr]">
            <div className="relative">
              {andrewImage ? (
                <PhotoFrame
                  src={andrewImage}
                  label={fileLabel(andrewImage, aboutImages.crewAndrew.label)}
                  className="h-[360px] w-full rotate-[-2deg] border-[6px] border-white/70"
                  showWatermark={shouldShowWatermark(content, "andrew")}
                />
              ) : null}

              <p className="mt-4 font-hand text-lg leading-8 text-[#596044]/80">
                {content?.drawings.andrewWords ||
                  "energetic · sporty · goofy · friendly · ambitious"}
              </p>
            </div>

            <div>
              <h3 className="font-serif text-4xl uppercase tracking-[-0.03em]">
                Andrew
              </h3>

              <div className="mt-5">
                <Paragraphs text={andrewDescription} />
              </div>

              <div className="mt-8">
                <ButtonLink href="/contact" variant="light" className="min-w-44">
                  Read more
                </ButtonLink>
              </div>
            </div>
          </article>

          <article className="grid items-center gap-8 md:grid-cols-[0.8fr_1fr]">
            <div className="relative">
              {morganeImage ? (
                <PhotoFrame
                  src={morganeImage}
                  label={fileLabel(morganeImage, aboutImages.crewMorgane.label)}
                  className="h-[360px] w-full rotate-[2deg] border-[6px] border-white/70"
                  showWatermark={shouldShowWatermark(content, "morgane")}
                />
              ) : null}

              <p className="mt-4 font-hand text-lg leading-8 text-[#596044]/80">
                {content?.drawings.morganeWords ||
                  "curious · sensitive · determined · adventurous · ocean lover"}
              </p>
            </div>

            <div>
              <h3 className="font-serif text-4xl uppercase tracking-[-0.03em]">
                Morgane
              </h3>

              <div className="mt-5">
                <Paragraphs text={morganeDescription} />
              </div>

              <div className="mt-8">
                <ButtonLink href="/contact" variant="light" className="min-w-44">
                  Read more
                </ButtonLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
