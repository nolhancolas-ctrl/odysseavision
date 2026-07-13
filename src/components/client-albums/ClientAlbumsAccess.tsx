"use client";

import { useState } from "react";
import { clientAlbumAccessFeatures, clientAlbumImages } from "@/data/clients";
import type { PublicSectionContent } from "@/lib/content/site";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { shouldShowImageWatermark } from "@/lib/content/image-watermarks";

type ClientAlbumsAccessProps = {
  content?: PublicSectionContent;
};

function renderLines(text: string) {
  return text.split("\n").filter(Boolean);
}

export function ClientAlbumsAccess({ content }: ClientAlbumsAccessProps) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const background =
    content?.images.background ||
    content?.imageSrc ||
    clientAlbumImages.accessFond.src;
  const showBackgroundWatermark = Boolean(background) && shouldShowImageWatermark(content, "background", false);
  const handwritten = content?.drawings.handwritten || "access your\ngallery";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password.trim()) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    const response = await fetch("/api/client-albums/access-by-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const result = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      redirectTo?: string;
    };

    if (response.ok && result.ok && result.redirectTo) {
      window.location.href = result.redirectTo;
      return;
    }

    setStatus("error");
  }

  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 md:px-14 md:py-20">
      <div className="mx-auto grid max-w-[1450px] items-center gap-12 lg:grid-cols-[0.55fr_1.45fr]">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#242617]/55">
            {content?.eyebrow || "Easy & secure access"}
          </p>

          <h2 className="mt-5 font-serif text-4xl uppercase leading-[1.05]">
            {content?.title || "Your gallery, your way."}
          </h2>

          <div className="my-6 h-px w-10 bg-[#242617]/35" />

          {content?.description ? (
            <p className="mb-7 max-w-sm text-sm leading-7 text-[#242617]/60">
              {content.description}
            </p>
          ) : null}

          <div className="space-y-6">
            {clientAlbumAccessFeatures.map((feature) => (
              <div
                key={feature.title}
                className="grid grid-cols-[64px_1fr] gap-5"
              >
                <div className="flex h-28 w-28 -translate-x-10 -translate-y-5 items-center justify-center">
                  <img
                    src={feature.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-28 w-28 object-contain opacity-100"
                  />
                </div>

                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#242617]/70">
                    {feature.title}
                  </h3>

                  <p className="mt-2 max-w-xs text-xs leading-6 text-[#242617]/60">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[520px] md:min-h-[560px] lg:min-h-[430px]">
          {background ? (
            <div
              className="ml-auto mt-[150px] h-[330px] w-full bg-cover bg-center md:mt-[165px] md:h-[390px] lg:mt-0 lg:h-[430px] lg:w-[82%]"
              style={{
                backgroundImage: `url(${background})`,
              }}
            />
          ) : null}
          <FrameWatermark enabled={showBackgroundWatermark} mode="background" />

          <form
            onSubmit={onSubmit}
            className="absolute left-1/2 top-0 w-[min(86vw,330px)] -translate-x-1/2 rotate-[-4deg] border-[5px] border-white/70 bg-[#172016] p-7 text-[#f4efe4] shadow-2xl md:w-[350px] lg:left-0 lg:top-1/2 lg:w-[340px] lg:-translate-y-1/2 lg:translate-x-0"
          >
            <div className="absolute left-1/2 top-[-22px] h-9 w-28 -translate-x-1/2 rotate-[2deg] bg-[#d8cdb8]/70 shadow-sm backdrop-blur-[1px]" />

            <p className="mb-5 font-hand text-3xl leading-[0.95] text-white/80">
              {renderLines(handwritten).map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </p>

            <label className="text-[9px] uppercase tracking-[0.18em] text-white/50">
              Enter your password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="mt-3 w-full border border-white/30 bg-transparent px-4 py-3 text-xs outline-none placeholder:text-white/35"
            />

            {status === "error" ? (
              <p className="mt-3 text-xs text-white/55">
                No published gallery found for this password.
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-5 w-full cursor-pointer border border-white/35 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-[#172016] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Opening..." : "View gallery"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
