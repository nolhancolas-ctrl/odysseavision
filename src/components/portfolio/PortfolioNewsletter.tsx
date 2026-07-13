"use client";

import { useActionState } from "react";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { homeImages } from "@/data/home";
import { portfolioImages } from "@/data/portfolio";
import type { PublicSectionContent } from "@/lib/content/site";
import { submitNewsletterForm } from "@/server/actions/forms";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { shouldShowImageWatermark } from "@/lib/content/image-watermarks";

type PortfolioNewsletterProps = {
  content?: PublicSectionContent;
};

const initialNewsletterState = {
  status: "idle" as const,
  message: "",
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

export function PortfolioNewsletter({ content }: PortfolioNewsletterProps) {
  const [state, formAction, isPending] = useActionState(
    submitNewsletterForm,
    initialNewsletterState,
  );

  const background =
    content?.images.background ||
    content?.imageSrc ||
    portfolioImages.newsletterFond.src;
  const showBackgroundWatermark = Boolean(background) && shouldShowImageWatermark(content, "background", false);
  const leftPhoto = content?.images.leftPhoto || homeImages.ctaSailboat.src;
  const rightPhoto = content?.images.rightPhoto || homeImages.ctaOceanCliff.src;
  const stamp = content?.images.stamp || "/images/home/cta_stamp_01.png";

  return (
    <section className="relative min-h-[340px] overflow-hidden bg-[#172016] px-6 py-16 text-[#f4efe4] md:px-14">
      {background ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 md:bg-top"
          style={{
            backgroundImage: `url(${background})`,
          }}
        />
      ) : null}
      <FrameWatermark enabled={showBackgroundWatermark} mode="background" />

      <div className="absolute inset-0 bg-[#222d20]/45" />

      <div className="relative mx-auto flex min-h-[230px] max-w-[1500px] items-center justify-center">
        <div className="pointer-events-none absolute left-0 top-1/2 hidden h-[230px] w-[350px] -translate-y-1/2 lg:block xl:left-6">
          {leftPhoto ? (
            <PhotoFrame
              src={leftPhoto}
              label={fileLabel(leftPhoto, homeImages.ctaSailboat.label)}
              className="absolute left-8 top-1/2 h-[285px] w-[245px] -translate-y-1/2 rotate-[-4deg] border-[5px] border-white/90 shadow-xl"
              showWatermark={shouldShowWatermark(content, "leftPhoto")}
            />
          ) : null}

          {stamp ? (
            <img
              src={stamp}
              alt=""
              aria-hidden="true"
              className="absolute left-[235px] top-[108px] w-[178px] rotate-[-8deg] opacity-80"
            />
          ) : null}
        </div>

        <div className="relative z-10 w-full max-w-xl text-center">
          <h2 className="font-serif text-4xl uppercase md:text-5xl">
            {content?.title || "Stay inspired"}
          </h2>

          <p className="mt-2 font-hand text-xl text-[#f4efe4]/75">
            {content?.drawings.handwritten || "stories, new photos & adventures"}
          </p>

          <div className="mx-auto my-6 h-px w-10 bg-[#f4efe4]/45" />

          <form
            action={formAction}
            className="flex border border-[#f4efe4]/45 bg-[#11190f]/20 backdrop-blur-[2px]"
          >
            <input type="hidden" name="source" value="portfolio-newsletter" />

            <input
              name="email"
              type="email"
              required
              placeholder="Your email address"
              className="min-w-0 flex-1 bg-transparent px-5 py-4 text-xs text-white outline-none placeholder:text-white/55"
            />

            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer border-l border-[#f4efe4]/45 px-7 text-[9px] font-semibold uppercase tracking-[0.18em] transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
            >
              {isPending ? "Saving..." : content?.ctaLabel || "Subscribe"}
            </button>
          </form>

          {state.message ? (
            <p
              className={`mt-4 text-xs font-semibold ${
                state.status === "success"
                  ? "text-[#f4efe4]/85"
                  : "text-red-200"
              }`}
            >
              {state.message}
            </p>
          ) : null}
        </div>

        <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[230px] w-[390px] -translate-y-1/2 lg:block xl:right-6">
          {rightPhoto ? (
            <PhotoFrame
              src={rightPhoto}
              label={fileLabel(rightPhoto, homeImages.ctaOceanCliff.label)}
              className="absolute right-[-185px] top-2/3 h-[185px] w-[230px] -translate-y-1/2 rotate-[3deg] border-[5px] border-white/90 shadow-xl"
              showWatermark={shouldShowWatermark(content, "rightPhoto")}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
