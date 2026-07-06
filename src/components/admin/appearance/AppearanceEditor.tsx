"use client";

import { useMemo, useState } from "react";
import { AdminImageDropzone } from "@/components/admin/uploads/AdminImageDropzone";
import type { AppearanceSettings } from "@/lib/content/appearance";

type AppearanceEditorProps = {
  settings: AppearanceSettings;
  updateAction: (formData: FormData) => Promise<void>;
  resetAction: (formData: FormData) => Promise<void>;
};

type FieldProps = {
  label: string;
  help?: string;
  children: React.ReactNode;
};

function Field({ label, help, children }: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40">
        {label}
      </label>
      {children}
      {help ? (
        <p className="mt-2 text-xs leading-5 text-[#242617]/40">{help}</p>
      ) : null}
    </div>
  );
}

function Category({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
      <div className="border-b border-[#242617]/10 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
          {eyebrow}
        </p>

        <h2 className="mt-2 font-serif text-3xl uppercase leading-none text-[#242617]">
          {title}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#242617]/55">
          {description}
        </p>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
    />
  );
}

function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
    />
  );
}

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const safeValue = /^#[0-9a-f]{6}$/i.test(value) ? value : "#f4efe4";

  return (
    <div className="flex gap-3">
      <input
        type="color"
        value={safeValue}
        onChange={(event) => onChange(event.target.value)}
        className="h-[48px] w-[62px] cursor-pointer rounded-2xl border border-[#242617]/10 bg-transparent p-1"
      />

      <TextInput value={value} onChange={onChange} placeholder="#f4efe4" />
    </div>
  );
}

function PreviewBox({
  background,
  logo,
  brandLineOne,
  brandLineTwo,
}: {
  background: string;
  text: string;
  gold: string;
  serif: string;
  hand: string;
  logo: string;
  brandLineOne: string;
  brandLineTwo: string;
}) {
  return (
    <div
      className="flex min-h-[210px] items-center justify-center rounded-[1.75rem] border border-[#242617]/10 p-8 shadow-[0_18px_50px_rgba(20,20,10,0.10)]"
      style={{ backgroundColor: background }}
    >
      <div className="flex items-center gap-5">
        {logo ? (
          <img
            src={logo}
            alt=""
            className="h-20 w-20 object-contain brightness-0 invert"
          />
        ) : null}

        <p className="text-[18px] font-semibold uppercase leading-[1.35] tracking-[0.42em] text-[#f4efe4]">
          {brandLineOne}
          <br />
          {brandLineTwo}
        </p>
      </div>
    </div>
  );
}

function TypographyPreview({
  bodyFont,
  serifFont,
  handFont,
  baseFontSize,
  textLetterSpacing,
  headingLetterSpacing,
  textColor,
  goldColor,
}: {
  bodyFont: string;
  serifFont: string;
  handFont: string;
  baseFontSize: number;
  textLetterSpacing: string;
  headingLetterSpacing: string;
  textColor: string;
  goldColor: string;
}) {
  return (
    <div className="mt-7 rounded-[1.75rem] border border-[#242617]/10 bg-[#f4efe4]/65 p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
        Typography overview
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#242617]/35">
            Sans / body
          </p>
          <p
            className="mt-3 text-sm leading-7"
            style={{
              color: textColor,
              fontFamily: bodyFont || undefined,
              fontSize: baseFontSize,
              letterSpacing: textLetterSpacing,
            }}
          >
            A clean paragraph for travel notes, client galleries and quiet
            documentary storytelling.
          </p>
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#242617]/35">
            Serif / headings
          </p>
          <p
            className="mt-3 font-serif text-4xl uppercase leading-[0.92]"
            style={{
              color: textColor,
              fontFamily: serifFont || undefined,
              letterSpacing: headingLetterSpacing,
            }}
          >
            Wild
            <br />
            horizons
          </p>
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#242617]/35">
            Handwritten
          </p>
          <p
            className="mt-5 -rotate-3 font-hand text-3xl leading-tight"
            style={{
              color: goldColor,
              fontFamily: handFont || undefined,
            }}
          >
            notes from the road
          </p>
        </div>
      </div>
    </div>
  );
}

function PalettePreview({
  cream,
  text,
  darkGreen,
  navy,
  olive,
  gold,
  mutedGold,
}: {
  cream: string;
  text: string;
  darkGreen: string;
  navy: string;
  olive: string;
  gold: string;
  mutedGold: string;
}) {
  const colors = [
    { label: "Cream", value: cream },
    { label: "Text", value: text },
    { label: "Dark green", value: darkGreen },
    { label: "Navy", value: navy },
    { label: "Olive", value: olive },
    { label: "Gold", value: gold },
    { label: "Muted gold", value: mutedGold },
  ];

  return (
    <div className="mt-7 overflow-hidden rounded-[1.75rem] border border-[#242617]/10 bg-[#f4efe4]/65">
      <div className="relative min-h-[310px] p-6" style={{ backgroundColor: cream }}>
        <div
          className="absolute -left-10 -top-12 h-52 w-52 rounded-full"
          style={{ backgroundColor: gold, opacity: 0.86 }}
        />
        <div
          className="absolute right-8 top-8 h-44 w-44 rounded-[3rem] rotate-6"
          style={{ backgroundColor: navy }}
        />
        <div
          className="absolute bottom-8 left-[38%] h-36 w-60 rounded-full"
          style={{ backgroundColor: olive, opacity: 0.82 }}
        />
        <div
          className="absolute bottom-[-36px] right-[-28px] h-52 w-52 rounded-full"
          style={{ backgroundColor: darkGreen }}
        />
        <div
          className="absolute left-[18%] top-[42%] h-28 w-28 rounded-[2rem] -rotate-12"
          style={{ backgroundColor: mutedGold, opacity: 0.78 }}
        />

        <div className="relative z-10 max-w-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: mutedGold }}>
            Palette harmony
          </p>
          <h3 className="mt-4 font-serif text-5xl uppercase leading-none" style={{ color: text }}>
            Natural
            <br />
            contrast.
          </h3>
          <p className="mt-5 text-sm leading-7" style={{ color: text, opacity: 0.62 }}>
            The palette should feel editorial, warm, readable and slightly wild.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-[#242617]/10 md:grid-cols-7">
        {colors.map((color) => (
          <div key={color.label} className="bg-[#f4efe4] p-3">
            <div
              className="h-16 rounded-2xl border border-[#242617]/10"
              style={{ backgroundColor: color.value }}
            />
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
              {color.label}
            </p>
            <p className="mt-1 text-[10px] text-[#242617]/35">{color.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LayoutPreview({
  cream,
  navy,
  text,
  gold,
  cardRadius,
  buttonRadius,
  shadowStrength,
  sectionPaddingY,
}: {
  cream: string;
  navy: string;
  text: string;
  gold: string;
  cardRadius: number;
  buttonRadius: number;
  shadowStrength: number;
  sectionPaddingY: number;
}) {
  return (
    <div
      className="mt-7 rounded-[1.75rem] border border-[#242617]/10 p-6"
      style={{
        backgroundColor: cream,
        color: text,
        paddingTop: Math.min(sectionPaddingY, 72),
        paddingBottom: Math.min(sectionPaddingY, 72),
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
        Layout overview
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="border border-[#242617]/10 bg-white/55 p-6"
          style={{
            borderRadius: cardRadius,
            boxShadow: `0 20px 60px rgba(20,20,10,${shadowStrength})`,
          }}
        >
          <p className="font-serif text-4xl uppercase leading-none">
            Surface card
          </p>
          <p className="mt-4 text-sm leading-7 opacity-60">
            This preview reflects the global radius, shadow strength and spacing
            used by soft editorial cards.
          </p>

          <button
            type="button"
            className="mt-6 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{
              borderRadius: buttonRadius,
              backgroundColor: navy,
              color: cream,
            }}
          >
            Button preview
          </button>
        </div>

        <div
          className="relative overflow-hidden border border-[#242617]/10 p-6"
          style={{
            borderRadius: cardRadius,
            backgroundColor: navy,
            color: cream,
          }}
        >
          <div
            className="absolute right-[-34px] top-[-34px] h-32 w-32 rounded-full"
            style={{ backgroundColor: gold, opacity: 0.55 }}
          />
          <div className="relative">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-45">
              Dark block
            </p>
            <p className="mt-5 font-serif text-4xl uppercase leading-none">
              Strong
              <br />
              contrast.
            </p>
            <div className="mt-6 h-px w-14" style={{ backgroundColor: gold }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppearanceEditor({
  settings,
  updateAction,
  resetAction,
}: AppearanceEditorProps) {
  const [brandLineOne, setBrandLineOne] = useState(settings.brandLineOne);
  const [brandLineTwo, setBrandLineTwo] = useState(settings.brandLineTwo);
  const [publicLogoSrc, setPublicLogoSrc] = useState(settings.publicLogoSrc);

  const [bodyFontFamily, setBodyFontFamily] = useState(settings.bodyFontFamily);
  const [serifFontFamily, setSerifFontFamily] = useState(settings.serifFontFamily);
  const [handFontFamily, setHandFontFamily] = useState(settings.handFontFamily);
  const [baseFontSize, setBaseFontSize] = useState(settings.baseFontSize);
  const [textLetterSpacing, setTextLetterSpacing] = useState(settings.textLetterSpacing);
  const [headingLetterSpacing, setHeadingLetterSpacing] = useState(settings.headingLetterSpacing);

  const [creamColor, setCreamColor] = useState(settings.creamColor);
  const [textColor, setTextColor] = useState(settings.textColor);
  const [darkGreenColor, setDarkGreenColor] = useState(settings.darkGreenColor);
  const [navyColor, setNavyColor] = useState(settings.navyColor);
  const [oliveColor, setOliveColor] = useState(settings.oliveColor);
  const [goldColor, setGoldColor] = useState(settings.goldColor);
  const [mutedGoldColor, setMutedGoldColor] = useState(settings.mutedGoldColor);

  const [headerOverlayColor, setHeaderOverlayColor] = useState(settings.headerOverlayColor);
  const [footerBackgroundColor, setFooterBackgroundColor] = useState(settings.footerBackgroundColor);

  const [sectionPaddingY, setSectionPaddingY] = useState(settings.sectionPaddingY);
  const [cardRadius, setCardRadius] = useState(settings.cardRadius);
  const [buttonRadius, setButtonRadius] = useState(settings.buttonRadius);
  const [shadowStrength, setShadowStrength] = useState(settings.shadowStrength);

  const [splashEnabled, setSplashEnabled] = useState(settings.splashEnabled);
  const [splashOuterLogoSrc, setSplashOuterLogoSrc] = useState(settings.splashOuterLogoSrc);
  const [splashInnerLogoSrc, setSplashInnerLogoSrc] = useState(settings.splashInnerLogoSrc);
  const [splashText, setSplashText] = useState(settings.splashText);
  const [splashBackgroundColor, setSplashBackgroundColor] = useState(settings.splashBackgroundColor);
  const [splashTextColor, setSplashTextColor] = useState(settings.splashTextColor);
  const [splashInitialDuration, setSplashInitialDuration] = useState(settings.splashInitialDuration);
  const [splashRouteDuration, setSplashRouteDuration] = useState(settings.splashRouteDuration);

  const payload = useMemo(
    () =>
      JSON.stringify({
        brandLineOne,
        brandLineTwo,
        publicLogoSrc,

        bodyFontFamily,
        serifFontFamily,
        handFontFamily,
        baseFontSize,
        textLetterSpacing,
        headingLetterSpacing,

        creamColor,
        textColor,
        darkGreenColor,
        navyColor,
        oliveColor,
        goldColor,
        mutedGoldColor,

        headerOverlayColor,
        footerBackgroundColor,

        sectionPaddingY,
        cardRadius,
        buttonRadius,
        shadowStrength,

        splashEnabled,
        splashOuterLogoSrc,
        splashInnerLogoSrc,
        splashText,
        splashBackgroundColor,
        splashTextColor,
        splashInitialDuration,
        splashRouteDuration,
      }),
    [
      brandLineOne,
      brandLineTwo,
      publicLogoSrc,
      bodyFontFamily,
      serifFontFamily,
      handFontFamily,
      baseFontSize,
      textLetterSpacing,
      headingLetterSpacing,
      creamColor,
      textColor,
      darkGreenColor,
      navyColor,
      oliveColor,
      goldColor,
      mutedGoldColor,
      headerOverlayColor,
      footerBackgroundColor,
      sectionPaddingY,
      cardRadius,
      buttonRadius,
      shadowStrength,
      splashEnabled,
      splashOuterLogoSrc,
      splashInnerLogoSrc,
      splashText,
      splashBackgroundColor,
      splashTextColor,
      splashInitialDuration,
      splashRouteDuration,
    ],
  );

  return (
    <form action={updateAction} className="space-y-8">
      <input type="hidden" name="appearanceSettings" value={payload} />

      <Category
        eyebrow="Identity"
        title="Brand identity"
        description="Logo and brand text used across the public website."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Brand line one">
                <TextInput value={brandLineOne} onChange={setBrandLineOne} />
              </Field>

              <Field label="Brand line two">
                <TextInput value={brandLineTwo} onChange={setBrandLineTwo} />
              </Field>
            </div>

            <Field label="Public logo">
              <AdminImageDropzone
                label="Public logo"
                value={publicLogoSrc}
                onChange={setPublicLogoSrc}
                context="appearance"
                entitySlug="brand"
                slotKey="public-logo"
                ratio="1 / 1"
              />
            </Field>
          </div>

          <PreviewBox
            background={navyColor}
            text={creamColor}
            gold={goldColor}
            serif={serifFontFamily}
            hand={handFontFamily}
            logo={publicLogoSrc}
            brandLineOne={brandLineOne}
            brandLineTwo={brandLineTwo}
          />
        </div>
      </Category>

      <Category
        eyebrow="Typography"
        title="Fonts & rhythm"
        description="Control the main font stacks and typographic rhythm. Leave font-family fields empty to use the loaded default fonts."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <Field label="Sans font family" help='Example: "Inter", Arial, sans-serif'>
            <TextInput
              value={bodyFontFamily}
              onChange={setBodyFontFamily}
              placeholder="Use loaded default"
            />
          </Field>

          <Field label="Serif font family" help='Example: Georgia, "Times New Roman", serif'>
            <TextInput
              value={serifFontFamily}
              onChange={setSerifFontFamily}
              placeholder="Use loaded default"
            />
          </Field>

          <Field label="Handwritten font family" help='Example: cursive'>
            <TextInput
              value={handFontFamily}
              onChange={setHandFontFamily}
              placeholder="Use loaded default"
            />
          </Field>

          <Field label="Base font size">
            <NumberInput value={baseFontSize} onChange={setBaseFontSize} min={12} max={22} />
          </Field>

          <Field label="Text letter spacing">
            <TextInput value={textLetterSpacing} onChange={setTextLetterSpacing} placeholder="0em" />
          </Field>

          <Field label="Heading letter spacing">
            <TextInput value={headingLetterSpacing} onChange={setHeadingLetterSpacing} placeholder="-0.04em" />
          </Field>
        </div>

        <TypographyPreview
          bodyFont={bodyFontFamily}
          serifFont={serifFontFamily}
          handFont={handFontFamily}
          baseFontSize={baseFontSize}
          textLetterSpacing={textLetterSpacing}
          headingLetterSpacing={headingLetterSpacing}
          textColor={textColor}
          goldColor={goldColor}
        />
      </Category>

      <Category
        eyebrow="Palette"
        title="Global colors"
        description="Core colors used as global CSS variables for the public identity."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Cream background">
            <ColorInput value={creamColor} onChange={setCreamColor} />
          </Field>

          <Field label="Main text">
            <ColorInput value={textColor} onChange={setTextColor} />
          </Field>

          <Field label="Dark green">
            <ColorInput value={darkGreenColor} onChange={setDarkGreenColor} />
          </Field>

          <Field label="Navy / sidebar">
            <ColorInput value={navyColor} onChange={setNavyColor} />
          </Field>

          <Field label="Olive">
            <ColorInput value={oliveColor} onChange={setOliveColor} />
          </Field>

          <Field label="Gold">
            <ColorInput value={goldColor} onChange={setGoldColor} />
          </Field>

          <Field label="Muted gold">
            <ColorInput value={mutedGoldColor} onChange={setMutedGoldColor} />
          </Field>
        </div>

        <PalettePreview
          cream={creamColor}
          text={textColor}
          darkGreen={darkGreenColor}
          navy={navyColor}
          olive={oliveColor}
          gold={goldColor}
          mutedGold={mutedGoldColor}
        />
      </Category>

      <Category
        eyebrow="Surfaces"
        title="Backgrounds & layout"
        description="Global layout tokens for public surfaces, header/footer backgrounds and general proportions."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Header overlay color">
            <ColorInput value={headerOverlayColor} onChange={setHeaderOverlayColor} />
          </Field>

          <Field label="Footer background">
            <ColorInput value={footerBackgroundColor} onChange={setFooterBackgroundColor} />
          </Field>

          <Field label="Section vertical padding">
            <NumberInput value={sectionPaddingY} onChange={setSectionPaddingY} min={24} max={180} />
          </Field>

          <Field label="Card radius">
            <NumberInput value={cardRadius} onChange={setCardRadius} min={0} max={80} />
          </Field>

          <Field label="Button radius">
            <NumberInput value={buttonRadius} onChange={setButtonRadius} min={0} max={999} />
          </Field>

          <Field label="Shadow strength">
            <NumberInput
              value={shadowStrength}
              onChange={setShadowStrength}
              min={0}
              max={0.35}
              step={0.01}
            />
          </Field>
        </div>

        <LayoutPreview
          cream={creamColor}
          navy={navyColor}
          text={textColor}
          gold={goldColor}
          cardRadius={cardRadius}
          buttonRadius={buttonRadius}
          shadowStrength={shadowStrength}
          sectionPaddingY={sectionPaddingY}
        />
      </Category>

      <Category
        eyebrow="Motion"
        title="Splashscreen"
        description="Control the animated public splashscreen shown on initial load and route transitions."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="grid gap-5">
            <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/65 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#242617]/55">
              <input
                type="checkbox"
                checked={splashEnabled}
                onChange={(event) => setSplashEnabled(event.target.checked)}
                className="h-4 w-4 accent-[#b88a3b]"
              />
              Enable splashscreen
            </label>

            <Field label="Outer logo">
              <AdminImageDropzone
                label="Splash outer logo"
                value={splashOuterLogoSrc}
                onChange={setSplashOuterLogoSrc}
                context="appearance"
                entitySlug="splashscreen"
                slotKey="outer-logo"
                ratio="1 / 1"
              />
            </Field>

            <Field label="Inner logo">
              <AdminImageDropzone
                label="Splash inner logo"
                value={splashInnerLogoSrc}
                onChange={setSplashInnerLogoSrc}
                context="appearance"
                entitySlug="splashscreen"
                slotKey="inner-logo"
                ratio="1 / 1"
              />
            </Field>

            <Field label="Splash text">
              <TextInput value={splashText} onChange={setSplashText} />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Background color">
                <ColorInput value={splashBackgroundColor} onChange={setSplashBackgroundColor} />
              </Field>

              <Field label="Text color">
                <ColorInput value={splashTextColor} onChange={setSplashTextColor} />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Initial duration ms">
                <NumberInput value={splashInitialDuration} onChange={setSplashInitialDuration} max={6000} />
              </Field>

              <Field label="Route duration ms">
                <NumberInput value={splashRouteDuration} onChange={setSplashRouteDuration} max={3000} />
              </Field>
            </div>
          </div>

          <div
            className="relative flex min-h-[430px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-[#242617]/10"
            style={{ backgroundColor: splashBackgroundColor }}
          >
            <div className="relative h-[230px] w-[230px]">
              {splashOuterLogoSrc ? (
                <img
                  src={splashOuterLogoSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain"
                />
              ) : null}

              {splashInnerLogoSrc ? (
                <img
                  src={splashInnerLogoSrc}
                  alt=""
                  className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 object-contain"
                />
              ) : null}
            </div>

            <p
              className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-2xl uppercase tracking-[0.36em] opacity-45"
              style={{ color: splashTextColor }}
            >
              {splashText}
            </p>
          </div>
        </div>
      </Category>

      <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-[2rem] border border-[#242617]/10 bg-[#f4efe4]/90 p-4 shadow-[0_20px_60px_rgba(20,20,10,0.16)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#242617]/55">
          Save to update the public design tokens, logo, typography and splashscreen.
        </p>

        <div className="flex gap-3">
          <button
            type="submit"
            formAction={resetAction}
            className="cursor-pointer rounded-full border border-red-900/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-red-900/60 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]"
          >
            Reset
          </button>

          <button
            type="submit"
            className="cursor-pointer rounded-full bg-[#071321] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#142844]"
          >
            Save appearance
          </button>
        </div>
      </div>
    </form>
  );
}
