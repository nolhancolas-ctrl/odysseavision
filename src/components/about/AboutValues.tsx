import { aboutImages, aboutValues } from "@/data/about";
import type { PublicSectionContent } from "@/lib/content/site";

type AboutValuesProps = {
  content?: PublicSectionContent;
};

const valueIcons = [
  { key: "icon01", fallback: "/images/about/values_icon_01.png", className: "h-24 w-24" },
  { key: "icon02", fallback: "/images/about/values_icon_02.png", className: "h-24 w-24" },
  { key: "icon03", fallback: "/images/about/values_icon_03.png", className: "h-24 w-24" },
  { key: "icon04", fallback: "/images/about/values_icon_04.png", className: "h-24 w-24" },
  { key: "icon05", fallback: "/images/about/values_icon_05.png", className: "h-24 w-24" },
] as const;

export function AboutValues({ content }: AboutValuesProps) {
  const background =
    content?.images.background || content?.imageSrc || aboutImages.valuesFond.src;

  return (
    <section className="relative overflow-hidden bg-[#10190f] px-6 py-20 text-[#f4efe4] md:px-14 md:py-24">
      {background ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(38, 54, 35, 0.78), rgba(41, 50, 39, 0.86)), url(${background})`,
          }}
        />
      ) : null}

      <div className="relative mx-auto max-w-[1350px] text-center">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4efe4]/55">
          {content?.eyebrow || "Our values"}
        </p>

        <h2 className="font-serif text-5xl uppercase tracking-[-0.04em] md:text-6xl">
          {content?.title || "What guides us"}
        </h2>

        <div className="mx-auto mt-5 h-px w-14 bg-[#f4efe4]/35" />

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {aboutValues.map((item, index) => {
            const icon = valueIcons[index];
            const iconSrc = content?.images[icon.key] || icon.fallback;

            return (
              <div key={item.title}>
                <div className="mx-auto mb-5 flex h-14 items-center justify-center">
                  {iconSrc ? (
                    <img
                      src={iconSrc}
                      alt=""
                      aria-hidden="true"
                      className={`${icon.className} object-contain opacity-80`}
                    />
                  ) : null}
                </div>

                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  {item.title}
                </h3>

                <p className="mx-auto max-w-xs text-sm leading-7 text-[#f4efe4]/65">
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
