import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { aboutImages } from "@/data/about";

const oceanDreamItems = [
  {
    icon: "/images/about/ocean_icon_01.png",
    text: "Andrew works as a deckhand and is training to become a licensed skipper.",
  },
  {
    icon: "/images/about/ocean_icon_02.png",
    text: "One day, we’ll sail the world on our own boat, our floating home.",
  },
  {
    icon: "/images/about/ocean_icon_03.png",
    text: "Morgane is a certified diver and dreaming of becoming a scuba instructor.",
  },
  {
    icon: "/images/about/ocean_icon_04.png",
    text: "Morgane is passionate about marine biology and the wonder of underwater life.",
  },
];

export function AboutOceanDreams() {
  return (
    <section className="relative overflow-hidden bg-[#10190f] px-6 py-14 text-[#f4efe4] md:px-14 md:py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

      <div className="relative mx-auto grid max-w-[1350px] items-center gap-12 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
        {/* Left visual collage */}
        <div className="relative mx-auto h-[410px] w-full max-w-[560px] md:h-[460px] lg:mx-0">
          <img
            src="/images/about/ocean_drawing_01.png"
            alt=""
            className="pointer-events-none absolute -left-8 bottom-2 z-0 hidden w-28 opacity-20 md:block"
          />

          <PhotoFrame
            src={aboutImages.ocean01.src}
            label={aboutImages.ocean01.label}
            imagePosition="center"
            className="absolute left-[-3%] top-[4%] z-10 h-[350px] w-[245px] border-0 shadow-2xl md:h-[390px] md:w-[270px]"
          />

          <PhotoFrame
            src={aboutImages.ocean02.src}
            label={aboutImages.ocean02.label}
            imagePosition="center"
            className="absolute left-[42%] top-[-80%] z-20 h-[330px] w-[215px] border-0 shadow-2xl md:h-[370px] md:w-[240px]"
          />

          {/* tape */}
          <div className="absolute left-[-65px] top-[100px] z-30 h-7 w-24 -rotate-12 bg-[#d8c7a8]/90 shadow-md" />

          <p className="absolute bottom-[0px] left-[42%] z-30 max-w-[230px] -rotate-6 font-hand text-xl leading-8 text-[#f4efe4]/72">
            home is
            <br />
            where the ocean is
          </p>
        </div>

        {/* Right content */}
        <div className="mx-auto w-full max-w-[640px] lg:mx-0">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#f4efe4]/50">
            Ocean life & future dreams
          </p>

          <h2 className="max-w-xl font-serif text-[clamp(2.2rem,3.1vw,3.55rem)] uppercase leading-[0.98] tracking-[-0.04em]">
            Living for the ocean,
            <br />
            dreaming of tomorrow
          </h2>

          <div className="my-6 h-px w-14 bg-[#f4efe4]/35" />

          <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
            {oceanDreamItems.map((item) => (
              <div key={item.text} className="grid grid-cols-[54px_1fr] gap-4">
                <div
                  className="mt-0 h-12 w-12 bg-center bg-no-repeat opacity-80"
                  style={{
                    backgroundImage: `url(${item.icon})`,
                    backgroundSize: "220%",
                  }}
                />

                <p className="max-w-[230px] text-[13px] font-medium leading-6 text-[#f4efe4]/66">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-9 max-w-xl text-[13px] font-medium leading-7 text-[#f4efe4]/72">
            The ocean is our playground, our teacher and our biggest inspiration.
          </p>
        </div>
      </div>
    </section>
  );
}
