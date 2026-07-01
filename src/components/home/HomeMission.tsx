import type { PublicSectionContent } from "@/lib/content/site";

type HomeMissionProps = {
  content?: PublicSectionContent;
};

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
    content?.images.turtle || "/images/home/mission_turtle_transparent_01.png";

  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 text-[#242617] md:px-14 md:py-20">
      {turtle ? (
        <img
          src={turtle}
          alt=""
          className="pointer-events-none absolute right-[-51px] top-[-21px] hidden w-104 opacity-30 md:block"
        />
      ) : null}

      <div className="mx-auto max-w-7xl text-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.24em] text-[#596044]">
          {content?.eyebrow || "Our mission"}
        </p>

        <h2 className="font-serif text-5xl uppercase tracking-[-0.04em] md:text-6xl">
          {content?.title || "Protect what we love"}
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {defaultMissionItems.map((item) => {
            const icon = content?.images[item.iconKey] || item.fallbackIcon;

            return (
              <div key={item.title}>
                <div className="mb-5 flex h-11 items-center justify-center">
                  {icon ? (
                    <img
                      src={icon}
                      alt=""
                      className="h-60 w-40 object-contain opacity-75"
                    />
                  ) : null}
                </div>
                <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em]">
                  {item.title}
                </h3>
                <p className="mx-auto max-w-xs text-sm leading-7 text-[#333525]/70">
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
