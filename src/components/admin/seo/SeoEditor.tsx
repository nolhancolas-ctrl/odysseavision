"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminImageDropzone } from "@/components/admin/uploads/AdminImageDropzone";
import type { PageSeoSettings, SeoSettings } from "@/lib/content/seo";

type SeoEditorProps = {
  settings: SeoSettings;
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

function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full resize-none rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm leading-6 text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
    />
  );
}

function CheckboxField({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/65 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#242617]/55">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#b88a3b]"
      />
      {label}
    </label>
  );
}

function CardTypeSelect({
  value,
  onChange,
}: {
  value: "summary" | "summary_large_image";
  onChange: (value: "summary" | "summary_large_image") => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const options: Array<{
    value: "summary" | "summary_large_image";
    label: string;
    description: string;
  }> = [
    {
      value: "summary_large_image",
      label: "Summary large image",
      description: "Large visual card for image-first sharing.",
    },
    {
      value: "summary",
      label: "Summary",
      description: "Compact card with smaller preview.",
    },
  ];

  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-5 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-left transition hover:border-[#b88a3b]/55"
      >
        <span>
          <span className="block text-sm font-semibold text-[#242617]">
            {selected.label}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#242617]/42">
            {selected.description}
          </span>
        </span>

        <span
          className={`h-2.5 w-2.5 shrink-0 border-r border-t border-[#242617]/55 transition-transform duration-200 ${
            open ? "-translate-y-0.5 rotate-[135deg]" : "rotate-[45deg]"
          }`}
        />
      </button>

      <div
        role="listbox"
        aria-hidden={!open}
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#242617]/12 bg-[#f4efe4] p-1 shadow-[0_18px_45px_rgba(36,38,23,0.16)] transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full cursor-pointer rounded-xl px-4 py-3 text-left transition ${
                isSelected
                  ? "bg-[#071321] text-[#f4efe4]"
                  : "text-[#242617]/60 hover:bg-[#e8dfcf] hover:text-[#242617]"
              }`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em]">
                {option.label}
              </span>
              <span
                className={`mt-1 block text-xs leading-5 ${
                  isSelected ? "text-[#f4efe4]/62" : "text-[#242617]/42"
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PageSeoRow({
  page,
  onChange,
}: {
  page: PageSeoSettings;
  onChange: (page: PageSeoSettings) => void;
}) {
  const titleLength = page.title.length;
  const descriptionLength = page.description.length;

  return (
    <article className="rounded-[1.5rem] border border-[#242617]/10 bg-[#f4efe4]/55 p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b88a3b]">
            {page.label}
          </p>

          <p className="mt-1 text-xs text-[#242617]/45">{page.path}</p>
        </div>

        <CheckboxField
          checked={page.noIndex}
          onChange={(value) => onChange({ ...page, noIndex: value })}
          label="No index"
        />
      </div>

      <div className="mt-5 grid gap-5">
        <Field
          label={`SEO title · ${titleLength} characters`}
          help="Recommended: around 50–60 characters."
        >
          <TextInput
            value={page.title}
            onChange={(value) => onChange({ ...page, title: value })}
          />
        </Field>

        <Field
          label={`Meta description · ${descriptionLength} characters`}
          help="Recommended: around 140–160 characters."
        >
          <TextArea
            value={page.description}
            onChange={(value) => onChange({ ...page, description: value })}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Keywords">
            <TextInput
              value={page.keywords}
              onChange={(value) => onChange({ ...page, keywords: value })}
              placeholder="wildlife, ocean, film..."
            />
          </Field>

          <Field label="Page Open Graph image">
            <AdminImageDropzone
              label={`${page.label} Open Graph image`}
              value={page.ogImage}
              onChange={(value) => onChange({ ...page, ogImage: value })}
              context="seo"
              entitySlug={page.pageKey}
              slotKey="open-graph"
              ratio="1.91 / 1"
            />
          </Field>
        </div>
      </div>
    </article>
  );
}

export function SeoEditor({
  settings,
  updateAction,
  resetAction,
}: SeoEditorProps) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteUrl, setSiteUrl] = useState(settings.siteUrl);
  const [defaultTitle, setDefaultTitle] = useState(settings.defaultTitle);
  const [titleTemplate, setTitleTemplate] = useState(settings.titleTemplate);
  const [defaultDescription, setDefaultDescription] = useState(
    settings.defaultDescription,
  );
  const [defaultKeywords, setDefaultKeywords] = useState(
    settings.defaultKeywords,
  );
  const [author, setAuthor] = useState(settings.author);
  const [language, setLanguage] = useState(settings.language);
  const [faviconSrc, setFaviconSrc] = useState(settings.faviconSrc);

  const [robotsIndex, setRobotsIndex] = useState(settings.robotsIndex);
  const [robotsFollow, setRobotsFollow] = useState(settings.robotsFollow);
  const [sitemapEnabled, setSitemapEnabled] = useState(settings.sitemapEnabled);

  const [openGraphType, setOpenGraphType] = useState(settings.openGraphType);
  const [openGraphLocale, setOpenGraphLocale] = useState(
    settings.openGraphLocale,
  );
  const [openGraphImage, setOpenGraphImage] = useState(settings.openGraphImage);

  const [twitterCard, setTwitterCard] = useState(settings.twitterCard);
  const [twitterCreator, setTwitterCreator] = useState(settings.twitterCreator);
  const [twitterImage, setTwitterImage] = useState(settings.twitterImage);

  const [pages, setPages] = useState(settings.pages);

  const payload = useMemo(
    () =>
      JSON.stringify({
        siteName,
        siteUrl,
        defaultTitle,
        titleTemplate,
        defaultDescription,
        defaultKeywords,
        author,
        language,
        faviconSrc,
        robotsIndex,
        robotsFollow,
        sitemapEnabled,
        openGraphType,
        openGraphLocale,
        openGraphImage,
        twitterCard,
        twitterCreator,
        twitterImage,
        pages,
      }),
    [
      siteName,
      siteUrl,
      defaultTitle,
      titleTemplate,
      defaultDescription,
      defaultKeywords,
      author,
      language,
      faviconSrc,
      robotsIndex,
      robotsFollow,
      sitemapEnabled,
      openGraphType,
      openGraphLocale,
      openGraphImage,
      twitterCard,
      twitterCreator,
      twitterImage,
      pages,
    ],
  );

  const updatePage = (index: number, page: PageSeoSettings) => {
    setPages((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? page : item,
      ),
    );
  };

  return (
    <form action={updateAction} className="space-y-8">
      <input type="hidden" name="seoSettings" value={payload} />

      <div className="grid gap-8 xl:grid-cols-2">
        <Category
        eyebrow="Global"
        title="Global SEO"
        description="Default metadata used across the whole website."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Site name">
            <TextInput value={siteName} onChange={setSiteName} />
          </Field>

          <Field label="Site URL" help="No trailing slash recommended.">
            <TextInput
              value={siteUrl}
              onChange={setSiteUrl}
              placeholder="https://odysseavision.com"
            />
          </Field>

          <Field label="Default title">
            <TextInput value={defaultTitle} onChange={setDefaultTitle} />
          </Field>

          <Field label="Title template" help="Use %s where the page title should appear.">
            <TextInput value={titleTemplate} onChange={setTitleTemplate} />
          </Field>

          <div className="md:col-span-2">
            <Field label="Default description">
              <TextArea
                value={defaultDescription}
                onChange={setDefaultDescription}
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Default keywords">
              <TextInput
                value={defaultKeywords}
                onChange={setDefaultKeywords}
              />
            </Field>
          </div>
        </div>
      </Category>

      <Category
        eyebrow="Technical"
        title="Technical settings"
        description="Language, author, favicon and search engine crawling rules."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Author">
            <TextInput value={author} onChange={setAuthor} />
          </Field>

          <Field label="Language">
            <TextInput value={language} onChange={setLanguage} placeholder="en" />
          </Field>

          <div className="md:col-span-2">
            <Field
              label="Favicon"
              help="Upload a square PNG, SVG or WEBP. Existing /favicon.ico paths can still be kept manually in settings if needed."
            >
              <AdminImageDropzone
                label="Favicon"
                value={faviconSrc}
                onChange={setFaviconSrc}
                context="seo"
                entitySlug="global"
                slotKey="favicon"
                ratio="1 / 1"
              />
            </Field>
          </div>

          <CheckboxField
            checked={robotsIndex}
            onChange={setRobotsIndex}
            label="Allow indexing"
          />

          <CheckboxField
            checked={robotsFollow}
            onChange={setRobotsFollow}
            label="Allow following links"
          />

          <CheckboxField
            checked={sitemapEnabled}
            onChange={setSitemapEnabled}
            label="Enable sitemap"
          />
        </div>
      </Category>
      </div>

      <Category
        eyebrow="Sharing"
        title="Sharing"
        description="Preview images and metadata used by social networks and messaging apps."
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[1.5rem] border border-[#242617]/10 bg-[#f4efe4]/55 p-5">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b88a3b]">
                Open Graph
              </p>
              <p className="mt-2 text-xs leading-5 text-[#242617]/45">
                Default sharing preview used by social platforms and messaging apps.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Open Graph type">
                  <TextInput value={openGraphType} onChange={setOpenGraphType} />
                </Field>

                <Field label="Locale">
                  <TextInput value={openGraphLocale} onChange={setOpenGraphLocale} />
                </Field>
              </div>

              <Field label="Default Open Graph image">
                <AdminImageDropzone
                  label="Default Open Graph image"
                  value={openGraphImage}
                  onChange={setOpenGraphImage}
                  context="seo"
                  entitySlug="global"
                  slotKey="open-graph"
                  ratio="1.91 / 1"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[#242617]/10 bg-[#f4efe4]/55 p-5">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b88a3b]">
                Twitter / X cards
              </p>
              <p className="mt-2 text-xs leading-5 text-[#242617]/45">
                Specific preview card used when pages are shared on Twitter / X.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Card type">
                  <CardTypeSelect
                    value={twitterCard}
                    onChange={setTwitterCard}
                  />
                </Field>

                <Field label="Creator">
                  <TextInput value={twitterCreator} onChange={setTwitterCreator} />
                </Field>
              </div>

              <Field label="Twitter image">
                <AdminImageDropzone
                  label="Twitter image"
                  value={twitterImage}
                  onChange={setTwitterImage}
                  context="seo"
                  entitySlug="global"
                  slotKey="twitter-image"
                  ratio="1.91 / 1"
                />
              </Field>
            </div>
          </section>
        </div>
      </Category>

      <Category
        eyebrow="Pages"
        title="Per-page SEO"
        description="Edit title, description, keywords and preview image for every main page."
      >
        <div className="grid gap-5 xl:grid-cols-2">
          {pages.map((page, index) => (
            <PageSeoRow
              key={page.pageKey}
              page={page}
              onChange={(nextPage) => updatePage(index, nextPage)}
            />
          ))}
        </div>
      </Category>

      <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-[2rem] border border-[#242617]/10 bg-[#f4efe4]/90 p-4 shadow-[0_20px_60px_rgba(20,20,10,0.16)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#242617]/55">
          Save to update metadata, robots.txt and sitemap.xml.
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
            Save SEO
          </button>
        </div>
      </div>
    </form>
  );
}
