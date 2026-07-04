cd /workspaces/odysseavision

mkdir -p src/server/actions

cat > src/server/actions/uploads.ts <<'EOF'
"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 12 * 1024 * 1024;

const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanFolder(value: string) {
  return value
    .split("/")
    .map((part) => slugify(part))
    .filter(Boolean)
    .join("/");
}

function getUploadFolder(formData: FormData) {
  const context = String(formData.get("context") ?? "misc");
  const pageKey = String(formData.get("pageKey") ?? "");
  const sectionKey = String(formData.get("sectionKey") ?? "");
  const slotKey = String(formData.get("slotKey") ?? "");
  const entitySlug = String(formData.get("entitySlug") ?? "");

  if (context === "website-page") {
    return cleanFolder(`${pageKey}/${sectionKey}`);
  }

  if (context === "story") {
    return cleanFolder(`stories/${entitySlug || "draft"}`);
  }

  if (context === "portfolio") {
    return cleanFolder(`portfolio/items/${entitySlug || "draft"}`);
  }

  if (context === "client-album") {
    return cleanFolder(`client-albums/${entitySlug || "draft"}`);
  }

  if (context === "newsletter") {
    return cleanFolder(`newsletters/${entitySlug || "draft"}`);
  }

  if (context === "seo") {
    return cleanFolder("seo");
  }

  if (context === "appearance") {
    return cleanFolder("admin");
  }

  return cleanFolder(`uploads/${context}/${slotKey || "image"}`);
}

function getBaseName(formData: FormData, originalName: string) {
  const slotKey = String(formData.get("slotKey") ?? "");
  const label = String(formData.get("label") ?? "");
  const fallback = originalName.replace(/\.[^.]+$/, "");

  return slugify(slotKey || label || fallback || "image");
}

async function uniqueFilePath(folder: string, baseName: string, extension: string) {
  const absoluteFolder = path.join(process.cwd(), "public", "images", folder);
  await mkdir(absoluteFolder, { recursive: true });

  let index = 1;

  while (true) {
    const suffix = index === 1 ? "" : `-${index}`;
    const filename = `${baseName}${suffix}.${extension}`;
    const absolutePath = path.join(absoluteFolder, filename);

    try {
      await writeFile(absolutePath, Buffer.alloc(0), { flag: "wx" });
      return {
        absolutePath,
        publicPath: `/images/${folder}/${filename}`,
      };
    } catch {
      index += 1;
    }
  }
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      ok: false,
      error: "No file received.",
      path: "",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      error: "File is too large. Maximum size is 12 MB.",
      path: "",
    };
  }

  const extension = allowedMimeTypes.get(file.type);

  if (!extension) {
    return {
      ok: false,
      error: "Unsupported file type. Use JPG, PNG, WEBP, GIF or SVG.",
      path: "",
    };
  }

  const folder = getUploadFolder(formData);
  const baseName = getBaseName(formData, file.name);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { absolutePath, publicPath } = await uniqueFilePath(
    folder,
    baseName,
    extension,
  );

  await writeFile(absolutePath, buffer);

  return {
    ok: true,
    error: "",
    path: publicPath,
  };
}
EOF"use client";

import { useMemo, useState } from "react";
import { ImageUploadField } from "@/components/admin/uploads/ImageUploadField";
import { buildNewsletterHtml } from "@/lib/newsletters/render";

type NewsletterFormCampaign = {
  id?: string;
  title: string;
  subject: string;
  previewText: string | null;
  heroImage: string | null;
  body: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  status: string;
  sentAt?: Date | null;
};

type NewsletterFormProps = {
  campaign: NewsletterFormCampaign;
  activeSubscribers: number;
  saveAction: (formData: FormData) => Promise<void>;
  sendAction?: (formData: FormData) => Promise<void>;
  deleteAction?: (formData: FormData) => Promise<void>;
  duplicateAction?: (formData: FormData) => Promise<void>;
};

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40">
        {label}
      </label>
      {children}
      {help ? <p className="mt-2 text-xs leading-5 text-[#242617]/40">{help}</p> : null}
    </div>
  );
}

function inputClass() {
  return "w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70";
}

function textareaClass() {
  return "w-full resize-none rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm leading-7 text-[#242617] outline-none transition focus:border-[#b88a3b]/70";
}

function StatusPill({
  value,
  active,
  onClick,
}: {
  value: "DRAFT" | "READY" | "SENT";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={value === "SENT"}
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-[#071321] bg-[#071321] text-[#f4efe4]"
          : "border-[#242617]/15 text-[#242617]/45 hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
      }`}
    >
      {value}
    </button>
  );
}

export function NewsletterForm({
  campaign,
  activeSubscribers,
  saveAction,
  sendAction,
  deleteAction,
  duplicateAction,
}: NewsletterFormProps) {
  const [title, setTitle] = useState(campaign.title);
  const [subject, setSubject] = useState(campaign.subject);
  const [previewText, setPreviewText] = useState(campaign.previewText ?? "");
  const [heroImage, setHeroImage] = useState(campaign.heroImage ?? "");
  const [body, setBody] = useState(campaign.body);
  const [ctaLabel, setCtaLabel] = useState(campaign.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(campaign.ctaHref ?? "");
  const [status, setStatus] = useState<"DRAFT" | "READY" | "SENT">(
    campaign.status === "READY" || campaign.status === "SENT"
      ? campaign.status
      : "DRAFT",
  );

  const previewHtml = useMemo(
    () =>
      buildNewsletterHtml({
        title,
        subject,
        previewText,
        heroImage,
        body,
        ctaLabel,
        ctaHref,
      }),
    [title, subject, previewText, heroImage, body, ctaLabel, ctaHref],
  );

  const canSend = Boolean(campaign.id && sendAction && activeSubscribers > 0 && status !== "SENT");

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.85fr)]">
      <form action={saveAction} className="space-y-8">
        <input type="hidden" name="status" value={status} />

        <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <div className="border-b border-[#242617]/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
              Create & manage
            </p>

            <h2 className="mt-2 font-serif text-3xl uppercase leading-none text-[#242617]">
              Newsletter content
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#242617]/55">
              Write the email subject, preview text, body and optional call to
              action.
            </p>
          </div>

          <div className="grid gap-5 p-6">
            <Field label="Internal title">
              <input
                name="title"
                value={title}
                required
                onChange={(event) => setTitle(event.target.value)}
                className={inputClass()}
                placeholder="July ocean stories"
              />
            </Field>

            <Field label="Email subject">
              <input
                name="subject"
                value={subject}
                required
                onChange={(event) => setSubject(event.target.value)}
                className={inputClass()}
                placeholder="New stories from Odyssea Vision"
              />
            </Field>

            <Field label="Preview text" help="Short hidden preview shown in email inboxes.">
              <input
                name="previewText"
                value={previewText}
                onChange={(event) => setPreviewText(event.target.value)}
                className={inputClass()}
                placeholder="A short line before the email is opened."
              />
            </Field>

            <Field label="Hero image URL" help="Use a public absolute URL for production emails, or upload a local site image for previews.">
              <input
                name="heroImage"
                value={heroImage}
                onChange={(event) => setHeroImage(event.target.value)}
                className={inputClass()}
                placeholder="https://..."
              />

              <div className="mt-4">
                <ImageUploadField
                  label="Newsletter hero image"
                  value={heroImage}
                  onChange={setHeroImage}
                  context="newsletter"
                  entitySlug={campaign.id || "draft"}
                  slotKey="hero"
                  help="The file will be saved in public/images/newsletters/..."
                />
              </div>
            </Field>

            <Field label="Body" help="Use blank lines to create paragraphs. Rich editor and Word import will come after this first version.">
              <textarea
                name="body"
                value={body}
                rows={14}
                onChange={(event) => setBody(event.target.value)}
                className={textareaClass()}
                placeholder="Write your newsletter here..."
              />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="CTA label">
                <input
                  name="ctaLabel"
                  value={ctaLabel}
                  onChange={(event) => setCtaLabel(event.target.value)}
                  className={inputClass()}
                  placeholder="Read the story"
                />
              </Field>

              <Field label="CTA URL">
                <input
                  name="ctaHref"
                  value={ctaHref}
                  onChange={(event) => setCtaHref(event.target.value)}
                  className={inputClass()}
                  placeholder="https://..."
                />
              </Field>
            </div>

            <Field label="Status">
              <div className="flex flex-wrap gap-2">
                <StatusPill
                  value="DRAFT"
                  active={status === "DRAFT"}
                  onClick={() => setStatus("DRAFT")}
                />
                <StatusPill
                  value="READY"
                  active={status === "READY"}
                  onClick={() => setStatus("READY")}
                />
                <StatusPill
                  value="SENT"
                  active={status === "SENT"}
                  onClick={() => setStatus("SENT")}
                />
              </div>
            </Field>
          </div>
        </section>

        <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-[2rem] border border-[#242617]/10 bg-[#f4efe4]/90 p-4 shadow-[0_20px_60px_rgba(20,20,10,0.16)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[#242617]/55">
            Active subscribers: {activeSubscribers}. Save before sending.
          </p>

          <div className="flex flex-wrap gap-3">
            {duplicateAction ? (
              <button
                type="submit"
                formAction={duplicateAction}
                className="cursor-pointer rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
              >
                Duplicate
              </button>
            ) : null}

            {deleteAction ? (
              <button
                type="submit"
                formAction={deleteAction}
                className="cursor-pointer rounded-full border border-red-900/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-red-900/60 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]"
              >
                Delete
              </button>
            ) : null}

            {sendAction ? (
              <button
                type="submit"
                disabled={!canSend}
                formAction={sendAction}
                className="cursor-pointer rounded-full border border-[#071321]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#071321]/70 transition hover:bg-[#071321] hover:text-[#f4efe4] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send now
              </button>
            ) : null}

            <button
              type="submit"
              className="cursor-pointer rounded-full bg-[#071321] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#142844]"
            >
              Save newsletter
            </button>
          </div>
        </div>
      </form>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <div className="border-b border-[#242617]/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
              Preview
            </p>

            <h2 className="mt-2 font-serif text-3xl uppercase leading-none text-[#242617]">
              Email rendering
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#242617]/55">
              Approximate email preview. Real email clients may vary slightly.
            </p>
          </div>

          <div className="max-h-[820px] overflow-auto bg-[#e8dfcf] p-4">
            <div
              className="origin-top overflow-hidden rounded-[1.5rem] bg-[#f4efe4] shadow-[0_18px_55px_rgba(20,20,10,0.12)]"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </section>
      </aside>
    </div>
  );
}
