"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { contactImages } from "@/data/contact";
import type { FormsSettings } from "@/lib/content/forms";
import type { PublicSectionContent } from "@/lib/content/site";
import { submitContactForm } from "@/server/actions/forms";

type ContactFormSectionProps = {
  content?: PublicSectionContent;
  settings: FormsSettings;
};

const initialContactFormState = {
  status: "idle" as const,
  message: "",
};

function renderLines(text: string) {
  return text.split("\n").filter(Boolean);
}

export function ContactFormSection({
  content,
  settings,
}: ContactFormSectionProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialContactFormState,
  );
  const availableProjectTypes = settings.projectTypes.length
    ? settings.projectTypes
    : ["Photography"];
  const [projectType, setProjectType] = useState(availableProjectTypes[0]);
  const [projectTypeOpen, setProjectTypeOpen] = useState(false);
  const projectTypeMenuRef = useRef<HTMLDivElement>(null);

  const ornament =
    content?.images.ornament || "/images/about/hero_drawing_01.png";
  const panelPhoto = content?.images.photo || contactImages.form01.src;
  const panelEyebrow = content?.drawings.panelEyebrow || "Get in touch";
  const panelText =
    content?.body ||
    "We believe in real connections,\nwild places and telling\nstories that matter.";

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        projectTypeMenuRef.current &&
        !projectTypeMenuRef.current.contains(event.target as Node)
      ) {
        setProjectTypeOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProjectTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <section className="relative overflow-hidden bg-[#f4efe4]">
      <div className="grid min-h-[860px] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative px-6 py-16 md:px-14 md:py-20 lg:pr-24">
          {ornament ? (
            <img
              src={ornament}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-30 left-140 hidden w-82 opacity-20 md:block"
            />
          ) : null}

          <div className="mx-auto max-w-[680px]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#242617]/55">
              {content?.eyebrow || "Send us a message"}
            </p>

            <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-[-0.04em] md:text-5xl">
              {content?.title || "Tell us about your project"}
            </h2>

            <div className="my-7 h-px w-14 bg-[#242617]/35" />

            <form ref={formRef} action={formAction} className="grid gap-5">
              <input type="hidden" name="projectType" value={projectType} />
              <div className="grid gap-5 md:grid-cols-2">
                <input
                  name="firstName"
                  type="text"
                  required
                  placeholder="First name"
                  className="w-full border border-[#242617]/20 bg-transparent px-5 py-4 text-sm outline-none placeholder:text-[#242617]/45 transition focus:border-[#596044]"
                />

                <input
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  className="w-full border border-[#242617]/20 bg-transparent px-5 py-4 text-sm outline-none placeholder:text-[#242617]/45 transition focus:border-[#596044]"
                />
              </div>

              <input
                name="email"
                type="email"
                required
                placeholder="Email address"
                className="w-full border border-[#242617]/20 bg-transparent px-5 py-4 text-sm outline-none placeholder:text-[#242617]/45 transition focus:border-[#596044]"
              />

              <div ref={projectTypeMenuRef} className="relative z-40 w-full">
                <button
                  type="button"
                  onClick={() => setProjectTypeOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={projectTypeOpen}
                  className="flex w-full cursor-pointer items-center justify-between border border-[#242617]/20 bg-transparent px-5 py-4 text-left text-sm text-[#242617]/65 outline-none transition hover:border-[#596044]/70"
                >
                  <span>{projectType}</span>

                  <span
                    className={`h-2 w-2 border-b border-r border-current transition-transform duration-200 ${
                      projectTypeOpen
                        ? "translate-y-0.5 rotate-[225deg]"
                        : "-translate-y-0.5 rotate-45"
                    }`}
                  />
                </button>

                <div
                  role="listbox"
                  aria-label="Project type"
                  aria-hidden={!projectTypeOpen}
                  className={`absolute right-0 top-[calc(100%+6px)] z-50 w-full origin-top border border-[#242617]/20 bg-[#f4efe4] p-1 shadow-[0_14px_30px_rgba(36,38,23,0.16)] transition-[opacity,transform] duration-200 ease-out ${
                    projectTypeOpen
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
                  }`}
                >
                  {availableProjectTypes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="option"
                      tabIndex={projectTypeOpen ? 0 : -1}
                      aria-selected={projectType === item}
                      onClick={() => {
                        setProjectType(item);
                        setProjectTypeOpen(false);
                      }}
                      className={`block w-full cursor-pointer px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                        projectType === item
                          ? "bg-[#596044] text-[#f4efe4]"
                          : "text-[#242617]/65 hover:bg-[#e8dfcf] hover:text-[#242617]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                name="message"
                required
                rows={7}
                placeholder="Your message"
                className="w-full resize-none border border-[#242617]/20 bg-transparent px-5 py-4 text-sm leading-7 outline-none placeholder:text-[#242617]/45 transition focus:border-[#596044]"
              />

              <label className="flex items-start gap-3 text-xs leading-6 text-[#242617]/60">
                <input
                  type="checkbox"
                  name="newsletterConsent"
                  disabled={!settings.newsletterEnabled}
                  className="mt-1 h-4 w-4 border border-[#242617]/30 bg-transparent"
                />
                <span>{settings.newsletterLabel}</span>
              </label>

              <button
                type="submit"
                disabled={isPending}
                className="mt-3 w-full cursor-pointer bg-[#414832] px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#596044] disabled:cursor-wait disabled:opacity-60"
              >
                {isPending ? "Sending..." : content?.ctaLabel || "Send message"}
              </button>

              {state.message ? (
                <p
                  className={`pt-5 text-center text-xs font-semibold ${
                    state.status === "success"
                      ? "text-[#596044]"
                      : "text-red-900/70"
                  }`}
                >
                  {state.message}
                </p>
              ) : (
                <p className="pt-5 text-center text-xs font-medium text-[#242617]/55">
                  {content?.description || settings.responseTimeMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        <aside className="relative bg-[#10190f] px-6 py-16 text-[#f4efe4] md:px-14 md:py-20 lg:pl-28">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[86px] lg:block"
            aria-hidden="true"
          >
            <div
              className="absolute inset-y-0 left-0 w-[76px] bg-[#c9c0b1]/45"
              style={{
                clipPath:
                  "polygon(0 0, 62% 0, 72% 4%, 58% 8%, 70% 13%, 61% 18%, 76% 24%, 59% 29%, 71% 35%, 63% 42%, 74% 49%, 58% 56%, 69% 63%, 60% 70%, 73% 77%, 57% 84%, 68% 91%, 61% 96%, 72% 100%, 0 100%)",
              }}
            />

            <div
              className="absolute inset-y-0 left-0 w-[68px] bg-[#f4efe4] drop-shadow-[2px_0_2px_rgba(10,14,9,0.18)]"
              style={{
                clipPath:
                  "polygon(0 0, 56% 0, 66% 5%, 51% 10%, 64% 15%, 54% 21%, 69% 27%, 50% 33%, 63% 39%, 55% 46%, 67% 53%, 49% 60%, 61% 67%, 53% 74%, 66% 81%, 48% 88%, 60% 94%, 54% 100%, 0 100%)",
              }}
            />
          </div>

          <div className="relative z-30 mx-auto max-w-[470px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">
              {panelEyebrow}
            </p>

            <div className="my-7 h-px w-12 bg-white/35" />

            <div className="space-y-8">
              {settings.contactInfo.filter((item) => item.visible).map((item) => (
                <div key={item.title} className="grid grid-cols-[46px_1fr] gap-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 text-lg text-white/65">
                    {item.title === "Email"
                      ? "✉"
                      : item.title === "Instagram"
                        ? "◎"
                        : "⌖"}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white/75">
                      {item.title}
                    </p>

                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                        className="mt-1 block text-sm leading-6 text-white/65 transition hover:text-white"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm leading-6 text-white/65">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-[46px_1fr] gap-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-lg text-white/65">
                  ◷
                </div>

                <p className="text-sm leading-7 text-white/65">
                  {settings.availabilityText}
                </p>
              </div>
            </div>

            <div className="my-10 h-px w-full bg-white/15" />

            <p className="-rotate-3 font-hand text-2xl leading-10 text-[#d8c8a2]/65">
              {renderLines(panelText).map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </p>

            {panelPhoto ? (
              <div className="relative mt-12 w-fit translate-x-20">
                <div className="absolute left-1/2 top-[-16px] h-8 w-28 -translate-x-1/2 rotate-[2deg] bg-[#d8cdb8]/50 backdrop-blur-[1px]" />

                <PhotoFrame
                  src={panelPhoto}
                  label="form_01.png"
                  className="h-[185px] w-[285px] rotate-[2deg] border-[6px] border-white/85 shadow-2xl"
                />
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
