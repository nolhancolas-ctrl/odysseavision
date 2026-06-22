const missionItems = [
  {
    icon: "/images/home/mission_ocean_01.png",
    title: "Ocean Conservation",
    text: "As divers and ocean lovers, we support marine conservation, sustainable fishing and initiatives that protect our oceans.",
  },
  {
    icon: "/images/home/mission_storytelling_01.png",
    title: "Responsible Storytelling",
    text: "We believe in honest storytelling that raises awareness and inspires respect for nature and wildlife.",
  },
  {
    icon: "/images/home/mission_bubbles_01.png",
    title: "Leave Only Bubbles",
    text: "We travel mindfully, treading lightly and encouraging others to do the same.",
  },
];

export function HomeMission() {
  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 text-[#242617] md:px-14 md:py-20">
      <img
        src="/images/home/mission_turtle_transparent_01.png"
        alt=""
        className="pointer-events-none absolute right-10 top-6 hidden w-44 opacity-15 md:block"
      />

      <div className="mx-auto max-w-7xl text-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.24em] text-[#596044]">
          Our mission
        </p>

        <h2 className="font-serif text-5xl uppercase tracking-[-0.04em] md:text-6xl">
          Protect what we love
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {missionItems.map((item) => (
            <div key={item.title}>
              <div className="mb-5 flex h-11 items-center justify-center">
                <img
                  src={item.icon}
                  alt=""
                  className="h-10 w-10 object-contain opacity-75"
                />
              </div>
              <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em]">
                {item.title}
              </h3>
              <p className="mx-auto max-w-xs text-sm leading-7 text-[#333525]/70">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
