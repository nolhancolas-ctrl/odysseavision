"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type {
  EditableFieldKey,
  EditableImageCategory,
  EditableImageSlot,
  EditablePageSection,
} from "@/data/sitePages";

type SectionContent = {
  ctaLabel?: string;
  ctaHref?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  body?: string;
  andrewDescription?: string;
  morganeDescription?: string;
  featuredVideoMode?: string;
  featuredVideoId?: string;
  imageSrc?: string;
  images?: Record<string, string>;
  drawings?: Record<string, string>;
};

type PageSectionFormProps = {
  section: EditablePageSection;
  content: SectionContent;
  updateAction: (formData: FormData) => Promise<void>;
  resetAction: (formData: FormData) => Promise<void>;
  hasSavedContent: boolean;
};

const fieldLabels: Record<EditableFieldKey, string> = {
  ctaLabel: "CTA label",
  eyebrow: "Eyebrow",
  title: "Title",
  description: "Description",
  body: "Body",
  andrewDescription: "Andrew description",
  morganeDescription: "Morgane description",
  featuredVideoMode: "Featured video mode",
  featuredVideoId: "Featured video ID",
};

const imageCategoryLabels: Record<EditableImageCategory, string> = {
  background: "Background",
  photoframe: "Photoframe",
  photo: "Photo",
  drawing: "Drawing",
  ornamental: "Ornamental",
  icons: "Icons",
};

const imageCategoryOrder: EditableImageCategory[] = [
  "background",
  "photoframe",
  "photo",
  "drawing",
  "ornamental",
  "icons",
];

function AutoTextarea({
  name,
  defaultValue,
  rows = 1,
}: {
  name: string;
  defaultValue: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const resize = () => {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    };

    resize();
    element.addEventListener("input", resize);

    return () => {
      element.removeEventListener("input", resize);
    };
  }, []);

  return (
    <textarea
      ref={ref}
      name={name}
      rows={rows}
      defaultValue={defaultValue}
      className="min-h-[52px] w-full resize-none overflow-hidden rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm leading-6 text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
    />
  );
}

function fieldValue(
  section: EditablePageSection,
  content: SectionContent,
  field: EditableFieldKey,
) {
  return content[field] ?? section.defaults[field] ?? "";
}

function isImagePath(value: string) {
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(value);
}

function getInitialImageValue(slot: EditableImageSlot, content: SectionContent) {
  if (content.images && typeof content.images[slot.key] === "string") {
    return content.images[slot.key];
  }

  if (slot.key === "background" && content.imageSrc) {
    return content.imageSrc;
  }

  return slot.defaultSrc ?? "";
}

function ImageSlotEditor({
  slot,
  value,
  onChange,
}: {
  slot: EditableImageSlot;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(!value);
  const hasImage = Boolean(value);

  return (
    <div
      className={`rounded-[1.5rem] border p-4 transition ${
        hasImage
          ? "border-[#242617]/10 bg-[#f4efe4]/65"
          : "border-dashed border-[#242617]/12 bg-transparent"
      }`}
    >
      <input readOnly type="hidden" name={`image:${slot.key}`} value={value} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40">
            {slot.label}
          </p>

          <p className="mt-1 break-all text-xs text-[#242617]/45">
            {hasImage ? value : "No image selected"}
          </p>
        </div>

        {hasImage ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsEditing(false);
            }}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-red-900/20 text-sm font-bold text-red-900/55 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]"
            aria-label={`Remove ${slot.label}`}
          >
            ×
          </button>
        ) : null}
      </div>

      {hasImage && isImagePath(value) ? (
        <div
          className="mt-4 aspect-[16/9] rounded-2xl border border-[#242617]/8 bg-[#e8dfcf] bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${value})` }}
        />
      ) : hasImage ? (
        <div className="mt-4 rounded-2xl border border-[#242617]/8 bg-[#e8dfcf]/60 p-4 text-xs text-[#242617]/45">
          Preview unavailable for this file type.
        </div>
      ) : null}

      {isEditing ? (
        <div className="mt-4">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40">
            Image path
          </label>

          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-2xl border border-[#242617]/10 bg-white/60 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
            placeholder="/images/..."
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setIsEditing((current) => !current)}
          className="cursor-pointer rounded-full border border-[#242617]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
        >
          {hasImage ? "Replace" : "Add"}
        </button>
      </div>
    </div>
  );
}

function ResetConfirmation({
  resetAction,
  sectionLabel,
}: {
  resetAction: (formData: FormData) => Promise<void>;
  sectionLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modal =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#071008]/45 px-5 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] border border-[#242617]/10 bg-[#f4efe4] p-6 shadow-[0_30px_90px_rgba(7,16,8,0.28)]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
                Confirm reset
              </p>

              <h3 className="mt-3 font-serif text-3xl leading-none text-[#242617]">
                Reset {sectionLabel}?
              </h3>

              <p className="mt-4 text-sm leading-6 text-[#242617]/60">
                This will restore the default content for this section. You will
                lose the custom text and image paths currently saved here.
              </p>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
                >
                  Cancel
                </button>

                <form action={resetAction}>
                  <button
                    type="submit"
                    className="cursor-pointer rounded-full border border-red-900/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-red-900/70 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]"
                  >
                    Yes, reset
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-full border border-red-900/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]"
      >
        Reset
      </button>

      {modal}
    </>
  );
}

export function PageSectionForm({
  section,
  content,
  updateAction,
  resetAction,
  hasSavedContent,
}: PageSectionFormProps) {
  const [imageValues, setImageValues] = useState<Record<string, string>>(() => {
    const values: Record<string, string> = {};

    for (const slot of section.images ?? []) {
      values[slot.key] = getInitialImageValue(slot, content);
    }

    return values;
  });

  const groupedImages = useMemo(() => {
    const groups = new Map<EditableImageCategory, EditableImageSlot[]>();

    for (const category of imageCategoryOrder) {
      const slots = (section.images ?? []).filter(
        (slot) => slot.category === category,
      );

      if (slots.length > 0) {
        groups.set(category, slots);
      }
    }

    return groups;
  }, [section.images]);

  const hasVisualControls =
    groupedImages.size > 0 || Boolean(section.drawings?.length);

  const firstLineFields = section.fields.filter((field) =>
    ["ctaLabel", "eyebrow", "title"].includes(field),
  );

  const hasDescription = section.fields.includes("description");
  const hasBody = section.fields.includes("body");
  const extraTextFields = section.fields.filter(
    (field) =>
      !firstLineFields.includes(field) &&
      field !== "description" &&
      field !== "body",
  );

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
      <div className="flex flex-col justify-between gap-4 border-b border-[#242617]/10 p-6 md:flex-row md:items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40">
            {section.key}
          </p>

          <h2 className="mt-2 font-serif text-3xl text-[#242617]">
            {section.label}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#242617]/55">
            {section.description}
          </p>
        </div>

        {hasSavedContent ? (
          <ResetConfirmation
            resetAction={resetAction}
            sectionLabel={section.label}
          />
        ) : null}
      </div>

      <form action={updateAction} className="space-y-6 p-6">
        {firstLineFields.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {firstLineFields.map((field) => (
              <div key={field}>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                  {fieldLabels[field]}
                </label>

                <input
                  name={field}
                  defaultValue={fieldValue(section, content, field)}
                  className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                />
              </div>
            ))}
          </div>
        ) : null}

        {hasDescription ? (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              Description
            </label>

            <AutoTextarea
              name="description"
              defaultValue={fieldValue(section, content, "description")}
              rows={1}
            />
          </div>
        ) : null}

        {hasBody ? (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              Body
            </label>

            <AutoTextarea
              name="body"
              defaultValue={fieldValue(section, content, "body")}
              rows={3}
            />
          </div>
        ) : null}

        {extraTextFields.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {extraTextFields.map((field) => (
              <div key={field}>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                  {fieldLabels[field]}
                </label>

                <AutoTextarea
                  name={field}
                  defaultValue={fieldValue(section, content, field)}
                  rows={3}
                />
              </div>
            ))}
          </div>
        ) : null}

        {hasVisualControls ? (
          <div className="rounded-[1.7rem] border border-[#242617]/10 bg-[#f4efe4]/45 p-5">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#242617]/45">
                Images
              </p>
              <p className="mt-2 text-sm leading-6 text-[#242617]/50">
                Manage visual slots for this section. Empty slots stay visually
                transparent until an image is added.
              </p>
            </div>

            <div className="space-y-7">
              {Array.from(groupedImages.entries()).map(([category, slots]) => (
                <div key={category}>
                  <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
                    {imageCategoryLabels[category]}
                  </h3>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {slots.map((slot) => (
                      <ImageSlotEditor
                        key={slot.key}
                        slot={slot}
                        value={imageValues[slot.key] ?? ""}
                        onChange={(value) =>
                          setImageValues((current) => ({
                            ...current,
                            [slot.key]: value,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}

              {section.drawings?.length ? (
                <div>
                  <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
                    Drawing
                  </h3>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {section.drawings.map((drawing) => (
                      <div
                        key={drawing.key}
                        className="rounded-[1.5rem] border border-[#242617]/10 bg-[#f4efe4]/65 p-4"
                      >
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40">
                          {drawing.label}
                        </label>

                        <input
                          name={`drawing:${drawing.key}`}
                          defaultValue={
                            content.drawings?.[drawing.key] ??
                            drawing.defaultText
                          }
                          className="w-full rounded-2xl border border-[#242617]/10 bg-white/60 px-4 py-3 font-serif text-xl italic text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
                          placeholder="Handwritten text"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            className="cursor-pointer rounded-full bg-[#071008] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008]"
          >
            Save section
          </button>
        </div>
      </form>
    </section>
  );
}
