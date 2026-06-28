"use client";

import { FormEvent, useState } from "react";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { contactImages, contactInfo, projectTypes } from "@/data/contact";

export function ContactFormSection() {
  const [projectType, setProjectType] = useState(projectTypes[0]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") || "");
    const lastName = String(form.get("lastName") || "");
    const email = String(form.get("email") || "");
    const message = String(form.get("message") || "");

    const fullName = `${firstName} ${lastName}`.trim();
    const subject = encodeURIComponent(
      `New enquiry from ${fullName || "Odyssea Vision website"}`,
    );
    const body = encodeURIComponent(
      `Name: ${fullName}\nEmail: ${email}\nProject type: ${projectType}\n\nMessage:\n${message}`,
    );

    window.location.href = `mailto:odysseavision@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section className="relative overflow-hidden bg-[#f4efe4]">
      <div className="grid min-h-[860px] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left cream form */}
        <div className="relative px-6 py-16 md:px-14 md:py-20 lg:pr-24">
          <img
            src="/images/about/hero_drawing_01.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-30 left-140 hidden w-82 opacity-20 md:block"
          />

          <div className="mx-auto max-w-[680px]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#242617]/55">
              Send us a message
            </p>

            <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-[-0.04em] md:text-5xl">
              Tell us about your project
            </h2>

            <div className="my-7 h-px w-14 bg-[#242617]/35" />

            <form onSubmit={handleSubmit} className="grid gap-5">
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

              <select
                value={projectType}
                onChange={(event) => setProjectType(event.target.value)}
                className="w-full border border-[#242617]/20 bg-transparent px-5 py-4 text-sm text-[#242617]/65 outline-none transition focus:border-[#596044]"
              >
                {projectTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

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
                  className="mt-1 h-4 w-4 border border-[#242617]/30 bg-transparent"
                />
                <span>
                  I’d love to receive news, stories and updates from Odyssea
                  Vision.
                </span>
              </label>

              <button
                type="submit"
                className="mt-3 w-full bg-[#414832] px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#596044]"
              >
                Send message
              </button>

              <p className="pt-5 text-center text-xs font-medium text-[#242617]/55">
                We’ll do our best to get back to you within 48 hours.
              </p>
            </form>
          </div>
        </div>

        {/* Right dark contact panel */}
        <aside className="relative bg-[#10190f] px-6 py-16 text-[#f4efe4] md:px-14 md:py-20 lg:pl-28">
          {/* Vertical torn paper separator */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[86px] lg:block"
            aria-hidden="true"
          >
            {/* Soft fibre/shadow layer */}
            <div
              className="absolute inset-y-0 left-0 w-[76px] bg-[#c9c0b1]/45"
              style={{
                clipPath:
                  "polygon(0 0, 62% 0, 72% 4%, 58% 8%, 70% 13%, 61% 18%, 76% 24%, 59% 29%, 71% 35%, 63% 42%, 74% 49%, 58% 56%, 69% 63%, 60% 70%, 73% 77%, 57% 84%, 68% 91%, 61% 96%, 72% 100%, 0 100%)",
              }}
            />

            {/* Main cream torn paper edge */}
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
              Get in touch
            </p>

            <div className="my-7 h-px w-12 bg-white/35" />

            <div className="space-y-8">
              {contactInfo.map((item) => (
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
                  Available for travel worldwide.
                </p>
              </div>
            </div>

            <div className="my-10 h-px w-full bg-white/15" />

            <p className="-rotate-3 font-hand text-2xl leading-10 text-[#d8c8a2]/65">
              We believe in real connections,
              <br />
              wild places and telling
              <br />
              stories that matter.
            </p>

            <div className="relative translate-x-20 mt-12 w-fit">
              <div className="absolute left-1/2 top-[-16px] h-8 w-28 -translate-x-1/2 rotate-[2deg] bg-[#d8cdb8]/50 backdrop-blur-[1px]" />

              <PhotoFrame
                src={contactImages.form01.src}
                label={contactImages.form01.label}
                className="h-[185px] w-[285px] rotate-[2deg] border-[6px] border-white/85 shadow-2xl"
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
