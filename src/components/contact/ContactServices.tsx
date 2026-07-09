import Link from "next/link";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { contactServiceImages, contactServices } from "@/data/contact";
import type { PublicSectionContent } from "@/lib/content/site";

type ContactServicesProps = {
  content?: PublicSectionContent;
};

function shouldShowWatermark(
  content: PublicSectionContent | undefined,
  key: string,
  defaultValue = true,
) {
  return content?.imageWatermarks?.[key] ?? defaultValue;
}

function ServiceIcon({ type }: { type: string }) {
  if (type === "camera") {
    return (
      <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" aria-hidden="true">
        <rect x="10" y="17" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M17 17l3-6h8l3 6" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="27" r="6" stroke="currentColor" strokeWidth="2" />
        <circle cx="34" cy="21" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  if (type === "video") {
    return (
      <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" aria-hidden="true">
        <rect x="9" y="18" width="23" height="17" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M32 23l8-5v17l-8-5" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="13" r="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="27" cy="13" r="5" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="2" />
      <path d="M7 24h34M24 7c5 5 7 11 7 17s-2 12-7 17M24 7c-5 5-7 11-7 17s2 12 7 17" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ContactServices({ content }: ContactServicesProps) {
  const leftTall = content?.images.leftTall || contactServiceImages.leftTall;
  const leftSmall = content?.images.leftSmall || contactServiceImages.leftSmall;
  const rightTall = content?.images.rightTall || contactServiceImages.rightTall;
  const rightSmall = content?.images.rightSmall || contactServiceImages.rightSmall;
  const stamp = content?.images.stamp ?? "";
  const leaf = content?.images.leaf ?? "";

  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 text-[#242617] md:px-14 md:py-20">
      <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-[330px] lg:block">
        {leftTall ? (
          <PhotoFrame
            src={leftTall}
            label="services_left_01.png"
            className="absolute left-[70px] top-[55px] h-[285px] w-[205px] rotate-[-4deg] border-[5px] border-white/85 opacity-40 shadow-xl [@media_(min-aspect-ratio:2/1)]:opacity-100"
            showWatermark={shouldShowWatermark(content, "leftTall")}
          />
        ) : null}

        {leftSmall ? (
          <PhotoFrame
            src={leftSmall}
            label="services_left_02.png"
            className="absolute left-[25px] top-[35px] h-[155px] w-[230px] rotate-[-5deg] border-[5px] border-white/85 opacity-40 shadow-xl [@media_(min-aspect-ratio:2/1)]:opacity-100"
            showWatermark={shouldShowWatermark(content, "leftSmall")}
          />
        ) : null}
      </div>

      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[360px] lg:block">
        {stamp ? (
          <img
            src={stamp}
            alt=""
            aria-hidden="true"
            className="absolute right-[180px] top-[8px] w-32 opacity-35"
          />
        ) : null}

        {rightTall ? (
          <PhotoFrame
            src={rightTall}
            label="services_right_01.png"
            className="absolute right-[-80px] top-[55px] h-[285px] w-[205px] rotate-[5deg] border-[5px] border-white/85 opacity-40 shadow-xl [@media_(min-aspect-ratio:2/1)]:opacity-100"
            showWatermark={shouldShowWatermark(content, "rightTall")}
          />
        ) : null}

        {rightSmall ? (
          <PhotoFrame
            src={rightSmall}
            label="services_right_02.png"
            className="absolute right-[-100px] top-[35px] h-[155px] w-[230px] rotate-[4deg] border-[5px] border-white/85 opacity-40 shadow-xl [@media_(min-aspect-ratio:2/1)]:opacity-100"
            showWatermark={shouldShowWatermark(content, "rightSmall")}
          />
        ) : null}

        {leaf ? (
          <img
            src={leaf}
            alt=""
            aria-hidden="true"
            className="absolute right-[22px] top-[150px] w-24 opacity-25"
          />
        ) : null}
      </div>

      <div className="relative mx-auto max-w-[850px] text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#242617]/55">
          {content?.eyebrow || "What we do"}
        </p>

        <h2 className="mt-5 font-serif text-4xl leading-none tracking-[-0.04em] md:text-5xl">
          {content?.title || "How can we work together?"}
        </h2>

        {content?.description ? (
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#242617]/55">
            {content.description}
          </p>
        ) : null}

        <div className="mx-auto my-7 h-px w-12 bg-[#242617]/35" />

        <div className="grid gap-10 md:grid-cols-3 md:divide-x md:divide-[#242617]/12">
          {contactServices.map((service) => (
            <div key={service.title} className="px-4">
              <div className="mx-auto mb-6 flex justify-center text-[#242617]/55">
                <ServiceIcon type={service.icon} />
              </div>

              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#242617]/70">
                {service.title}
              </h3>

              <p className="mx-auto mt-5 max-w-[210px] text-sm leading-7 text-[#242617]/60">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/portfolio"
          className="mt-12 inline-block border border-[#242617]/35 px-14 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] transition hover:bg-[#242617] hover:text-[#f4efe4]"
        >
          {content?.ctaLabel || "View portfolio"}
        </Link>
      </div>
    </section>
  );
}
