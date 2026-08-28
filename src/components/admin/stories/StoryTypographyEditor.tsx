"use client";

import type { CSSProperties } from "react";
import { useState, useTransition } from "react";
import {
  defaultStoryTypographySettings,
  storyFontChoices,
  type StoryFontChoice,
  type StoryTypographySettings,
} from "@/lib/content/storyTypography";
import {
  resetStoryTypographySettings,
  updateStoryTypographySettings,
} from "@/server/actions/storyTypography";

type NumericSettingKey = {
  [Key in keyof StoryTypographySettings]:
    StoryTypographySettings[Key] extends number ? Key : never;
}[keyof StoryTypographySettings];

const fontLabels: Record<StoryFontChoice, string> = {
  sans: "Sans / Inter",
  serif: "Serif / Cormorant",
  hand: "Handwritten",
  anyway: "Anyway",
  custom: "Custom font",
};

function getFontStack(
  choice: StoryFontChoice,
  customFontName: string,
) {
  if (choice === "sans") {
    return "var(--ov-font-sans, var(--font-sans)), Arial, sans-serif";
  }

  if (choice === "hand") {
    return "var(--ov-font-hand, var(--font-hand)), cursive";
  }

  if (choice === "anyway") {
    return "Anyway, var(--ov-font-serif, var(--font-serif)), Georgia, serif";
  }

  if (choice === "custom" && customFontName.trim()) {
    return `"${customFontName.trim()}", var(--ov-font-serif, var(--font-serif)), Georgia, serif`;
  }

  return "var(--ov-font-serif, var(--font-serif)), Georgia, serif";
}

function FontSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: StoryFontChoice;
  onChange: (value: StoryFontChoice) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#242617]/45">
        {label}
      </p>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border border-[#242617]/12 bg-[#f4efe4]/70 px-4 text-left text-sm text-[#242617] transition hover:border-[#b88a3b]/55"
      >
        <span>{fontLabels[value]}</span>
        <span
          className={`h-2 w-2 border-b border-r border-current transition-transform ${
            open ? "rotate-[225deg]" : "rotate-45"
          }`}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-xl border border-[#242617]/12 bg-[#f4efe4] p-1.5 shadow-[0_18px_45px_rgba(20,20,10,0.16)]"
        >
          {storyFontChoices.map((choice) => (
            <button
              key={choice}
              type="button"
              role="option"
              aria-selected={choice === value}
              onClick={() => {
                onChange(choice);
                setOpen(false);
              }}
              className={`block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-xs transition ${
                choice === value
                  ? "bg-[#071321] text-[#f4efe4]"
                  : "text-[#242617]/65 hover:bg-[#e8dfcf]"
              }`}
            >
              {fontLabels[choice]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NumberField({
  label,
  value,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.17em] text-[#242617]/45">
        {label}
      </span>

      <span className="flex h-12 items-center overflow-hidden rounded-xl border border-[#242617]/12 bg-[#f4efe4]/70 transition focus-within:border-[#b88a3b]/60">
        <input
          type="number"
          value={value}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm text-[#242617] outline-none"
        />
        <span className="pr-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#242617]/30">
          {suffix}
        </span>
      </span>
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.17em] text-[#242617]/45">
        {label}
      </span>

      <span className="flex h-12 items-center gap-3 rounded-xl border border-[#242617]/12 bg-[#f4efe4]/70 px-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-9 cursor-pointer border-0 bg-transparent p-0"
        />
        <span className="font-mono text-xs uppercase text-[#242617]/55">
          {value}
        </span>
      </span>
    </label>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-serif text-3xl text-[#242617]">
        {title}
      </h3>
      <p className="mt-2 max-w-2xl text-xs leading-6 text-[#242617]/45">
        {description}
      </p>
    </div>
  );
}

export function StoryTypographyEditor({
  initialSettings,
}: {
  initialSettings: StoryTypographySettings;
}) {
  const [settings, setSettings] =
    useState<StoryTypographySettings>(initialSettings);
  const [status, setStatus] = useState<
    "idle" | "saved" | "error"
  >("idle");
  const [pending, startTransition] = useTransition();

  function updateSetting<Key extends keyof StoryTypographySettings>(
    key: Key,
    value: StoryTypographySettings[Key],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setStatus("idle");
  }

  function updateNumber(key: NumericSettingKey, value: number) {
    if (!Number.isFinite(value)) return;

    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setStatus("idle");
  }

  function saveSettings() {
    const formData = new FormData();
    formData.set(
      "storyTypographySettings",
      JSON.stringify(settings),
    );

    setStatus("idle");

    startTransition(async () => {
      try {
        const saved = await updateStoryTypographySettings(formData);
        setSettings(saved);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });
  }

  function resetSettings() {
    if (
      !window.confirm(
        "Reset all Story typography settings to their defaults?",
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const defaults = await resetStoryTypographySettings();
        setSettings(defaults);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });
  }

  const previewTitleStyle: CSSProperties = {
    color: settings.headingColor,
    fontFamily: getFontStack(
      settings.titleFont,
      settings.customFontName,
    ),
    fontSize: `${Math.min(settings.titleSize, 64)}px`,
    lineHeight: settings.headingLineHeight,
    letterSpacing: `${settings.headingLetterSpacing}em`,
  };

  const previewHeadingStyle: CSSProperties = {
    color: settings.headingColor,
    fontFamily: getFontStack(
      settings.headingFont,
      settings.customFontName,
    ),
    fontSize: `${Math.min(settings.headingTwoSize, 42)}px`,
    lineHeight: settings.headingLineHeight,
    letterSpacing: `${settings.headingLetterSpacing}em`,
  };

  const previewHeadingThreeStyle: CSSProperties = {
    color: settings.headingColor,
    fontFamily: getFontStack(
      settings.headingFont,
      settings.customFontName,
    ),
    fontSize: `${Math.min(settings.headingThreeSize, 32)}px`,
    lineHeight: settings.headingLineHeight,
    letterSpacing: `${settings.headingLetterSpacing}em`,
  };

  const previewBodyStyle: CSSProperties = {
    color: settings.textColor,
    fontFamily: getFontStack(
      settings.bodyFont,
      settings.customFontName,
    ),
    fontSize: `${settings.bodySize}px`,
    lineHeight: settings.bodyLineHeight,
    letterSpacing: `${settings.bodyLetterSpacing}em`,
  };

  const previewQuoteStyle: CSSProperties = {
    borderColor: settings.accentColor,
    color: settings.textColor,
    fontFamily: getFontStack(
      settings.quoteFont,
      settings.customFontName,
    ),
    fontSize: `${settings.quoteSize}px`,
    lineHeight: settings.quoteLineHeight,
  };

  const previewCaptionStyle: CSSProperties = {
    color: settings.textColor,
    fontFamily: getFontStack(
      settings.captionFont,
      settings.customFontName,
    ),
    fontSize: `${settings.captionSize}px`,
  };

  return (
    <div>
      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="flex h-full flex-col gap-5">
          <section className="rounded-[1.5rem] border border-[#242617]/10 bg-white/40 p-5 md:p-6">
            <SectionHeading
              eyebrow="Typefaces"
              title="Font assignment"
              description="Assign the visual voice used for each part of a public Story."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FontSelector
                label="Story title / H1"
                value={settings.titleFont}
                onChange={(value) =>
                  updateSetting("titleFont", value)
                }
              />
              <FontSelector
                label="H2 and H3"
                value={settings.headingFont}
                onChange={(value) =>
                  updateSetting("headingFont", value)
                }
              />
              <FontSelector
                label="Paragraphs"
                value={settings.bodyFont}
                onChange={(value) =>
                  updateSetting("bodyFont", value)
                }
              />
              <FontSelector
                label="Quotes"
                value={settings.quoteFont}
                onChange={(value) =>
                  updateSetting("quoteFont", value)
                }
              />
              <FontSelector
                label="Photo legends"
                value={settings.captionFont}
                onChange={(value) =>
                  updateSetting("captionFont", value)
                }
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.17em] text-[#242617]/45">
                  Custom font name
                </span>
                <input
                  type="text"
                  value={settings.customFontName}
                  onChange={(event) =>
                    updateSetting(
                      "customFontName",
                      event.target.value,
                    )
                  }
                  placeholder="Example: Anyway"
                  className="h-12 w-full rounded-xl border border-[#242617]/12 bg-[#f4efe4]/70 px-4 text-sm outline-none transition focus:border-[#b88a3b]/60"
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.17em] text-[#242617]/45">
                  WOFF / WOFF2 URL
                </span>
                <input
                  type="url"
                  value={settings.customFontUrl}
                  onChange={(event) =>
                    updateSetting(
                      "customFontUrl",
                      event.target.value,
                    )
                  }
                  placeholder="https://..."
                  className="h-12 w-full rounded-xl border border-[#242617]/12 bg-[#f4efe4]/70 px-4 text-sm outline-none transition focus:border-[#b88a3b]/60"
                />
              </label>
            </div>

            <p className="mt-3 text-[10px] leading-5 text-[#242617]/35">
              Direct font-file URLs are supported now. The dedicated
              WOFF2 upload button will be connected after Blob access is
              restored.
            </p>
          </section>

          <section className="rounded-[1.5rem] border border-[#242617]/10 bg-white/40 p-5 md:p-6">
            <SectionHeading
              eyebrow="Scale"
              title="Text hierarchy"
              description="Define the size of each editorial level without changing existing article content."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NumberField
                label="H1 / Story title"
                value={settings.titleSize}
                suffix="px"
                onChange={(value) =>
                  updateNumber("titleSize", value)
                }
              />
              <NumberField
                label="H2"
                value={settings.headingTwoSize}
                suffix="px"
                onChange={(value) =>
                  updateNumber("headingTwoSize", value)
                }
              />
              <NumberField
                label="H3"
                value={settings.headingThreeSize}
                suffix="px"
                onChange={(value) =>
                  updateNumber("headingThreeSize", value)
                }
              />
              <NumberField
                label="Paragraph"
                value={settings.bodySize}
                suffix="px"
                onChange={(value) =>
                  updateNumber("bodySize", value)
                }
              />
              <NumberField
                label="Quote"
                value={settings.quoteSize}
                suffix="px"
                onChange={(value) =>
                  updateNumber("quoteSize", value)
                }
              />
              <NumberField
                label="Photo legend"
                value={settings.captionSize}
                suffix="px"
                onChange={(value) =>
                  updateNumber("captionSize", value)
                }
              />
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[#242617]/10 bg-white/40 p-5 md:p-6">
            <SectionHeading
              eyebrow="Rhythm"
              title="Spacing and readability"
              description="Control line height, letter spacing and the vertical rhythm between sections."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NumberField
                label="Heading line height"
                value={settings.headingLineHeight}
                step={0.05}
                suffix="×"
                onChange={(value) =>
                  updateNumber("headingLineHeight", value)
                }
              />
              <NumberField
                label="Body line height"
                value={settings.bodyLineHeight}
                step={0.05}
                suffix="×"
                onChange={(value) =>
                  updateNumber("bodyLineHeight", value)
                }
              />
              <NumberField
                label="Quote line height"
                value={settings.quoteLineHeight}
                step={0.05}
                suffix="×"
                onChange={(value) =>
                  updateNumber("quoteLineHeight", value)
                }
              />
              <NumberField
                label="Heading tracking"
                value={settings.headingLetterSpacing}
                step={0.01}
                suffix="em"
                onChange={(value) =>
                  updateNumber("headingLetterSpacing", value)
                }
              />
              <NumberField
                label="Body tracking"
                value={settings.bodyLetterSpacing}
                step={0.01}
                suffix="em"
                onChange={(value) =>
                  updateNumber("bodyLetterSpacing", value)
                }
              />
              <NumberField
                label="Paragraph spacing"
                value={settings.paragraphSpacing}
                suffix="px"
                onChange={(value) =>
                  updateNumber("paragraphSpacing", value)
                }
              />
              <NumberField
                label="Section spacing"
                value={settings.sectionSpacing}
                suffix="px"
                onChange={(value) =>
                  updateNumber("sectionSpacing", value)
                }
              />
            </div>
          </section>

          <section className="flex flex-1 flex-col justify-center rounded-[1.5rem] border border-[#242617]/10 bg-white/40 p-5 md:p-6">
            <SectionHeading
              eyebrow="Palette"
              title="Editorial colors"
              description="Set dedicated Story colors while preserving the rest of the website appearance."
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <ColorField
                label="Headings"
                value={settings.headingColor}
                onChange={(value) =>
                  updateSetting("headingColor", value)
                }
              />
              <ColorField
                label="Body"
                value={settings.textColor}
                onChange={(value) =>
                  updateSetting("textColor", value)
                }
              />
              <ColorField
                label="Accent"
                value={settings.accentColor}
                onChange={(value) =>
                  updateSetting("accentColor", value)
                }
              />
            </div>
          </section>
        </div>

        <aside className="xl:self-stretch">
          <div className="flex h-full min-h-full flex-col overflow-hidden rounded-[1.6rem] border border-[#242617]/10 bg-[#f4efe4] shadow-[0_24px_70px_rgba(20,20,10,0.1)]">
            <div className="border-b border-[#242617]/10 px-6 py-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
                Live preview
              </p>
              <p className="mt-1 text-xs text-[#242617]/40">
                Every editorial setting is reflected below.
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-between px-6 md:px-8">
              <section className="flex flex-1 flex-col justify-center border-b border-[#242617]/10 py-9">
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: settings.accentColor }}
                >
                  Typeface assignment
                </p>

                <h2 className="mt-5" style={previewTitleStyle}>
                  A story worth remembering
                </h2>

                <p
                  className="mt-5"
                  style={previewBodyStyle}
                >
                  A title, a paragraph and a distinct editorial voice
                  working together.
                </p>

                <p
                  className="mt-5 italic"
                  style={previewCaptionStyle}
                >
                  Photo legend · Odyssea Vision
                </p>
              </section>

              <section className="flex flex-1 flex-col justify-center border-b border-[#242617]/10 py-9">
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: settings.accentColor }}
                >
                  Text hierarchy
                </p>

                <h2 className="mt-5" style={previewHeadingStyle}>
                  H2 · A quieter way to tell the story
                </h2>

                <h3
                  className="mt-7"
                  style={previewHeadingThreeStyle}
                >
                  H3 · Every detail has meaning
                </h3>

                <p className="mt-5" style={previewBodyStyle}>
                  Paragraph · Supporting text remains clear beneath every
                  heading level.
                </p>
              </section>

              <section className="flex flex-1 flex-col justify-center border-b border-[#242617]/10 py-9">
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: settings.accentColor }}
                >
                  Spacing and readability
                </p>

                <div
                  className="mt-5 h-px w-12"
                  style={{ backgroundColor: settings.accentColor }}
                />

                <p
                  className="mt-6"
                  style={{
                    ...previewBodyStyle,
                    marginBottom: `${settings.paragraphSpacing}px`,
                  }}
                >
                  The first paragraph demonstrates the selected body line
                  height, tracking and paragraph spacing.
                </p>

                <p style={previewBodyStyle}>
                  A second paragraph makes changes to the vertical rhythm
                  immediately visible.
                </p>

                <blockquote
                  className="mt-8 border-l-[3px] pl-5 italic"
                  style={previewQuoteStyle}
                >
                  The best stories make us feel like we were there.
                </blockquote>
              </section>

              <section className="flex flex-1 flex-col justify-center py-9">
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: settings.accentColor }}
                >
                  Editorial palette
                </p>

                <div
                  className="mt-6 overflow-hidden rounded-[1.2rem] border"
                  style={{ borderColor: `${settings.accentColor}55` }}
                >
                  <div
                    className="h-36"
                    style={{
                      background: `linear-gradient(135deg, ${settings.headingColor}, ${settings.accentColor})`,
                    }}
                  />

                  <div className="bg-[#f4efe4] p-5">
                    <h3 style={previewHeadingThreeStyle}>
                      Color in context
                    </h3>

                    <p className="mt-3" style={previewBodyStyle}>
                      Heading, body and accent colors are shown together.
                    </p>

                    <p
                      className="mt-4 italic opacity-60"
                      style={previewCaptionStyle}
                    >
                      A live example of a photo legend.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    ["Heading", settings.headingColor],
                    ["Body", settings.textColor],
                    ["Accent", settings.accentColor],
                  ].map(([label, color]) => (
                    <div
                      key={label}
                      className="overflow-hidden rounded-xl border border-[#242617]/10 bg-white/35"
                    >
                      <div
                        className="h-12"
                        style={{ backgroundColor: color }}
                      />
                      <p className="px-2 py-2 text-center text-[8px] font-bold uppercase tracking-[0.12em] text-[#242617]/45">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-[#242617]/10 pt-6 sm:flex-row sm:items-center">
        <p
          className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
            status === "error"
              ? "text-red-800/65"
              : status === "saved"
                ? "text-emerald-800/65"
                : "text-[#242617]/35"
          }`}
        >
          {pending
            ? "Saving typography..."
            : status === "saved"
              ? "Typography saved"
              : status === "error"
                ? "Typography could not be saved"
                : "Changes require confirmation"}
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={resetSettings}
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-[#242617]/15 px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#242617]/45 transition hover:border-red-900/30 hover:text-red-900/60 disabled:cursor-wait disabled:opacity-45"
          >
            Reset defaults
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={saveSettings}
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-[#071321] px-7 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b88a3b] disabled:cursor-wait disabled:opacity-45"
          >
            Save typography
          </button>
        </div>
      </div>
    </div>
  );
}
