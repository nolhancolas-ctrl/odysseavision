import Link from "next/link";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { clientAlbumImages } from "@/data/clients";
import type { PublicSectionContent } from "@/lib/content/site";

type ClientAlbumsFinalCTAProps = {
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

function renderLines(text: string) {
  return text.split("\n").filter(Boolean);
}

export function ClientAlbumsFinalCTA({ content }: ClientAlbumsFinalCTAProps) {
  const background =
    content?.images.background ||
    content?.imageSrc ||
    clientAlbumImages.ctaFond.src;
  const whale = content?.images.whale || clientAlbumImages.ctaWhale.src;
  const handwritten = content?.drawings.handwritten || "we’re here\nfor you!";

  return (
    <section className="relative min-h-[280px] overflow-hidden bg-[#11190f] px-6 py-14 text-[#f4efe4] md:px-14">
      {background ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage: `url(${background})`,
          }}
        />
      ) : null}

      <div className="absolute inset-0 bg-[#11190f]/55" />

      <div className="relative mx-auto flex min-h-[180px] max-w-[1450px] items-center justify-center">
        <div className="pointer-events-none absolute left-0 hidden h-[180px] w-[260px] lg:block">
          {whale ? (
            <PhotoFrame
              src={whale}
              label={fileLabel(whale, clientAlbumImages.ctaWhale.label)}
              className="absolute left-0 top-1/2 h-[145px] w-[205px] -translate-y-1/2 rotate-[-4deg] border-[5px] border-white/80 shadow-xl"
              showWatermark={shouldShowWatermark(content, "whale")}
            />
          ) : null}
        </div>

        <div className="relative z-10 text-center">
          <h2 className="font-serif text-4xl uppercase md:text-5xl">
            {content?.title || "Have a project in mind?"}
          </h2>

          <p className="mt-3 font-hand text-xl text-white/70">
            {content?.description ||
              "Let’s create something unforgettable together."}
          </p>

          <Link
            href="/contact"
            className="mt-7 inline-block border border-white/45 px-10 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-[#11190f]"
          >
            {content?.ctaLabel || "Let’s connect"}
          </Link>
        </div>

        <div className="pointer-events-none absolute right-0 hidden text-right lg:block">
          <p className="-rotate-6 font-hand text-2xl leading-9 text-white/60">
            {renderLines(handwritten).map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
