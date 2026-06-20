const missionItems = [
  {
    icon: "≋",
    title: "Ocean Conservation",
    text: "As divers and ocean lovers, we support marine conservation, sustainable fishing and initiatives that protect our oceans.",
  },
  {
    icon: "▣",
    title: "Responsible Storytelling",
    text: "We believe in honest storytelling that raises awareness and inspires respect for nature and wildlife.",
  },
  {
    icon: "◌",
    title: "Leave Only Bubbles",
    text: "We travel mindfully, treading lightly and encouraging others to do the same.",
  },
];

export function HomeMission() {
  return (
    <section className="bg-[#f4efe4] px-8 py-20 text-[#242617] md:px-14">
      <div className="mx-auto max-w-7xl text-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.24em] text-[#596044]">
          Our mission
        </p>

        <h2 className="font-serif text-5xl uppercase tracking-[-0.04em]">
          Protect what we love
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {missionItems.map((item) => (
            <div key={item.title}>
              <div className="mb-5 text-4xl text-[#596044]">{item.icon}</div>
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