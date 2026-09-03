import { OptionalImage } from "@/components/site/OptionalImage";
import type { PublicSectionContent } from "@/lib/content/site";

type HomeMissionProps = {
  content?: PublicSectionContent;
};

const missionIconCreamFilter =
  "invert(1) grayscale(0.05) sepia(0.4) saturate(0.0) hue-rotate(340deg) brightness(1.02) contrast(0.9)";

const defaultMissionItems = [
  {
    iconKey: "oceanIcon",
    fallbackIcon: "/images/home/mission_ocean_01.png",
    title: "Ocean Conservation",
    text: "As divers and ocean lovers, we support marine conservation, sustainable fishing and initiatives that protect our oceans.",
  },
  {
    iconKey: "storytellingIcon",
    fallbackIcon: "/images/home/mission_storytelling_01.png",
    title: "Responsible Storytelling",
    text: "We believe in honest storytelling that raises awareness and inspires respect for nature and wildlife.",
  },
  {
    iconKey: "bubblesIcon",
    fallbackIcon: "/images/home/mission_bubbles_01.png",
    title: "Leave Only Bubbles",
    text: "We travel mindfully, treading lightly and encouraging others to do the same.",
  },
];

export function HomeMission({ content }: HomeMissionProps) {
  const turtle =
    content?.images.turtle ?? "/images/home/mission_turtle_transparent_01.png";

  return (
    <section className="relative overflow-hidden bg-[#11190f] px-5 py-16 text-[#f4efe4] sm:px-6 md:px-14 md:py-20">
      {turtle ? (
        <OptionalImage
          src={turtle}
          alt=""
          className="pointer-events-none absolute right-[-8px] top-[14px] hidden w-[210px] opacity-100 md:block lg:w-[245px] xl:w-[275px] 2xl:w-[290px]"
        />
      ) : null}

      <div className="mx-auto max-w-7xl text-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.24em] text-[#b7a879]">
          {content?.eyebrow || "Our mission"}
        </p>

        <h2 className="font-serif text-[clamp(2.7rem,12vw,3.75rem)] uppercase leading-[0.95] tracking-[-0.04em]">
          {content?.title || "Protect what we love"}
        </h2>

        <div className="mt-10 grid gap-10 md:mt-12 md:grid-cols-3 md:gap-7 lg:gap-10">
          {defaultMissionItems.map((item) => {
            const icon = content?.images[item.iconKey] ?? item.fallbackIcon;

            return (
              <div key={item.title}>
                <div className="mb-5 flex h-11 items-center justify-center">
                  {icon ? (
                    <OptionalImage
                      src={icon}
                      alt=""
                      className="h-60 w-40 object-contain opacity-82"
                      style={{ filter: missionIconCreamFilter }}
                    />
                  ) : null}
                </div>

                <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f4efe4]">
                  {item.title}
                </h3>

                <p className="mx-auto max-w-xs text-sm leading-7 text-[#f4efe4]/72">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
