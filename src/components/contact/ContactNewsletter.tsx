"use client";

import { useActionState } from "react";
import { contactNewsletterImages } from "@/data/contact";
import type { PublicSectionContent } from "@/lib/content/site";
import { submitNewsletterForm } from "@/server/actions/forms";

type ContactNewsletterProps = {
  content?: PublicSectionContent;
};

const initialNewsletterState = {
  status: "idle" as const,
  message: "",
};

export function ContactNewsletter({ content }: ContactNewsletterProps) {
  const [state, formAction, isPending] = useActionState(
    submitNewsletterForm,
    initialNewsletterState,
  );

  const images = [
    content?.images.image01 || contactNewsletterImages.image01,
    content?.images.image02 || contactNewsletterImages.image02,
    content?.images.image03 || contactNewsletterImages.image03,
    content?.images.image04 || contactNewsletterImages.image04,
  ].filter(Boolean);

  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-20 text-[#242617] md:px-14">
      <div className="mx-auto grid max-w-[1450px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative">
          <h2 className="font-serif text-4xl uppercase leading-none tracking-[-0.04em] md:text-5xl">
            {content?.title || "Stay inspired"}
          </h2>

          <p className="mt-5 font-hand text-xl leading-8 text-[#242617]/55">
            {content?.description ||
              "Join our mailing list for new stories, photos and behind the scenes."}
          </p>

          <form
            action={formAction}
            className="mt-8 flex max-w-xl border border-[#242617]/35 bg-transparent"
          >
            <input type="hidden" name="source" value="contact-newsletter" />

            <input
              name="email"
              type="email"
              required
              placeholder="Your email address"
              className="min-w-0 flex-1 bg-transparent px-5 py-4 text-sm text-[#242617] outline-none placeholder:text-[#242617]/45"
            />

            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer border-l border-[#242617]/35 px-8 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#242617] transition hover:bg-[#10190f] hover:text-[#f4efe4] disabled:cursor-wait disabled:opacity-60"
            >
              {isPending ? "Saving..." : content?.ctaLabel || "Subscribe"}
            </button>
          </form>

          {state.message ? (
            <p
              className={`mt-4 text-xs font-semibold ${
                state.status === "success"
                  ? "text-[#596044]"
                  : "text-red-900/70"
              }`}
            >
              {state.message}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {images.map((src, index) => (
            <div
              key={src}
              className={`aspect-[0.82] bg-[#d8cfc0] bg-cover bg-center ${
                index % 2 === 0 ? "translate-y-2" : "-translate-y-2"
              }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
