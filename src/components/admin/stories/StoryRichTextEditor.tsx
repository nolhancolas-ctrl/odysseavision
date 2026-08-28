"use client";

import { useEffect, useRef, useState } from "react";
import { AdminImageDropzone } from "@/components/admin/uploads/AdminImageDropzone";
import styles from "@/components/stories/StoryContent.module.css";

const STORY_HTML_MARKER = "STORY_HTML_V1";
const STORY_HTML_PREFIX =
  STORY_HTML_MARKER + String.fromCharCode(10);

function extractStoryHtml(content: string) {
  const normalized = content.replace(/^\uFEFF/, "").trimStart();

  if (!normalized.startsWith(STORY_HTML_MARKER)) {
    return null;
  }

  return normalized
    .slice(STORY_HTML_MARKER.length)
    .replace(/^\\r\\n/, "")
    .replace(/^\\n/, "")
    .trimStart();
}

type ImageAlignment = "left" | "full" | "right";
type ImageSize = "small" | "medium" | "large";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function legacyInline(value: string) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function legacyToHtml(content: string) {
  if (!content.trim()) return "";

  const blocks: string[] = [];
  const paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${legacyInline(paragraph.join(" "))}</p>`);
    paragraph.length = 0;
  };

  for (const line of content.replace(/\r\n/g, "\n").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const heading = /^(#{2,3})\s+(.+)$/.exec(trimmed);

    if (heading) {
      flushParagraph();
      blocks.push(
        `<h${heading[1].length}>${legacyInline(heading[2])}</h${heading[1].length}>`,
      );
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  return blocks.join("");
}

function getInitialHtml(content: string) {
  const richHtml = extractStoryHtml(content);
  return richHtml ?? legacyToHtml(content);
}

const toolbarButton =
  "grid h-9 min-w-9 cursor-pointer place-items-center rounded-lg border border-[#242617]/10 bg-white/30 px-2.5 text-sm text-[#242617]/62 transition hover:border-[#b88a3b]/55 hover:bg-[#e8dfcf] hover:text-[#071321]";

function ToolbarDropdown({
  label,
  options,
  onBeforeOpen,
  onSelect,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  onBeforeOpen: () => void;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onMouseDown={onBeforeOpen}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-9 min-w-[108px] cursor-pointer items-center justify-between gap-4 rounded-lg border bg-white/30 px-3 text-xs text-[#242617]/62 transition ${
          open
            ? "border-[#b88a3b]/65 bg-[#f4efe4]"
            : "border-[#242617]/10 hover:border-[#b88a3b]/55"
        }`}
      >
        <span>{label}</span>
        <span
          className={`h-2 w-2 border-b border-r border-current transition-transform ${
            open ? "rotate-[225deg]" : "rotate-45"
          }`}
        />
      </button>

      <div
        className={`absolute left-0 top-[calc(100%+7px)] z-[80] min-w-[190px] overflow-hidden rounded-xl border border-[#242617]/12 bg-[#f4efe4] p-1.5 shadow-[0_18px_45px_rgba(20,20,10,0.18)] transition ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onSelect(option.value);
              setOpen(false);
            }}
            className="block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-xs text-[#242617]/65 transition hover:bg-[#071321] hover:text-white"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StoryRichTextEditor({
  initialContent,
  uploadSlug,
  existingPageImageUrls = [],
}: {
  initialContent: string;
  uploadSlug: string;
  existingPageImageUrls?: readonly string[];
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const selectedFigure = useRef<HTMLElement | null>(null);
  const initialHtml = useRef(getInitialHtml(initialContent));

  const [contentValue, setContentValue] = useState(() => {
    const html = initialHtml.current.trim();
    return html ? `${STORY_HTML_PREFIX}${html}` : "";
  });

  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoSrc, setPhotoSrc] = useState("");
  const [photoAlt, setPhotoAlt] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoAlignment, setPhotoAlignment] =
    useState<ImageAlignment>("full");
  const [photoSize, setPhotoSize] =
    useState<ImageSize>("medium");
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);

  function synchronize() {
    const editor = editorRef.current;
    if (!editor) return;

    const html = editor.innerHTML.trim();
    const hasContent =
      Boolean(editor.textContent?.trim()) ||
      Boolean(editor.querySelector("img"));

    setContentValue(
      hasContent ? `${STORY_HTML_PREFIX}${html}` : "",
    );
  }

  function rememberSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (
      !editor ||
      !selection ||
      !selection.rangeCount ||
      !editor.contains(selection.anchorNode)
    ) {
      return;
    }

    savedRange.current = selection.getRangeAt(0).cloneRange();
  }

  function restoreSelection() {
    const selection = window.getSelection();

    if (!selection || !savedRange.current) return;

    selection.removeAllRanges();
    selection.addRange(savedRange.current);
  }

  function command(name: string, value?: string) {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(name, false, value);
    rememberSelection();
    synchronize();
  }

  function collectExistingPhotoUrls(
    excludedFigure: HTMLElement | null = null,
  ) {
    const editor = editorRef.current;
    const urls = [...existingPageImageUrls];

    if (editor) {
      const images = editor.querySelectorAll<HTMLImageElement>(
        "figure[data-story-image='true'] img",
      );

      images.forEach((image) => {
        const figure = image.closest(
          "figure[data-story-image='true']",
        );

        if (figure !== excludedFigure) {
          const src = image.getAttribute("src");

          if (src) {
            urls.push(src);
          }
        }
      });
    }

    return [...new Set(urls)];
  }

  function openPhoto() {
    rememberSelection();
    selectedFigure.current = null;
    setExistingPhotoUrls(collectExistingPhotoUrls());
    setEditingPhoto(false);
    setPhotoSrc("");
    setPhotoAlt("");
    setPhotoCaption("");
    setPhotoAlignment("full");
    setPhotoSize("medium");
    setPhotoOpen(true);
  }

  function openPhotoEditor(figure: HTMLElement) {
    const image = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");

    const alignment: ImageAlignment = figure.classList.contains(
      "story-media-left",
    )
      ? "left"
      : figure.classList.contains("story-media-right")
        ? "right"
        : "full";

    const size: ImageSize = figure.classList.contains("story-media-small")
      ? "small"
      : figure.classList.contains("story-media-large")
        ? "large"
        : "medium";

    selectedFigure.current = figure;
    setExistingPhotoUrls(collectExistingPhotoUrls(figure));
    setEditingPhoto(true);
    setPhotoSrc(image?.getAttribute("src") ?? "");
    setPhotoAlt(image?.getAttribute("alt") ?? "");
    setPhotoCaption(caption?.textContent ?? "");
    setPhotoAlignment(alignment);
    setPhotoSize(size);
    setPhotoOpen(true);
  }

  function closePhoto() {
    setPhotoOpen(false);
    setEditingPhoto(false);
    selectedFigure.current = null;
    editorRef.current?.focus();
    restoreSelection();
  }

  function insertPhoto() {
    if (!photoSrc) return;

    const caption = photoCaption.trim()
      ? `<figcaption class="story-media-caption">${escapeHtml(photoCaption.trim())}</figcaption>`
      : "";

    const figureHtml =
      `<figure contenteditable="false" tabindex="0" data-story-image="true" ` +
      `class="story-media story-media-${photoAlignment} story-media-${photoSize}">` +
      `<img src="${escapeHtml(photoSrc)}" alt="${escapeHtml(photoAlt.trim())}" loading="lazy" decoding="async">` +
      caption +
      `</figure>`;

    if (editingPhoto && selectedFigure.current) {
      selectedFigure.current.outerHTML = figureHtml;
    } else {
      editorRef.current?.focus();
      restoreSelection();
      document.execCommand(
        "insertHTML",
        false,
        `${figureHtml}<p><br></p>`,
      );
    }

    selectedFigure.current = null;
    setEditingPhoto(false);
    setPhotoOpen(false);
    synchronize();
  }

  function removeSelectedPhoto() {
    selectedFigure.current?.remove();
    selectedFigure.current = null;
    setEditingPhoto(false);
    setPhotoOpen(false);
    synchronize();
  }

  function choiceClass(active: boolean) {
    return `cursor-pointer rounded-xl border px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition ${
      active
        ? "border-[#071321] bg-[#071321] text-white"
        : "border-[#242617]/12 bg-[#f4efe4]/75 text-[#242617]/55 hover:border-[#b88a3b]/65"
    }`;
  }

  return (
    <div>
      <input
        type="hidden"
        name="content"
        value={contentValue}
        readOnly
      />

      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-2 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/55 p-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Bold"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => command("bold")}
            className={toolbarButton}
          >
            <strong className="text-base">B</strong>
          </button>

          <button
            type="button"
            title="Italic"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => command("italic")}
            className={toolbarButton}
          >
            <em className="font-serif text-base">I</em>
          </button>

          <button
            type="button"
            title="Underline"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => command("underline")}
            className={toolbarButton}
          >
            <span className="text-base underline">U</span>
          </button>
        </div>

        <span className="hidden h-7 w-px bg-[#242617]/14 sm:block" />

        <div className="flex items-center gap-1.5">
          {[
            ["P", "p"],
            ["H2", "h2"],
            ["H3", "h3"],
            ["“ ”", "blockquote"],
          ].map(([label, block]) => (
            <button
              key={block}
              type="button"
              title={block}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => command("formatBlock", block)}
              className={toolbarButton}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="hidden h-7 w-px bg-[#242617]/14 sm:block" />

        <div className="flex items-center gap-1.5">
          <ToolbarDropdown
            label="Font"
            onBeforeOpen={rememberSelection}
            onSelect={(value) => command("fontName", value)}
            options={[
              { value: "Anyway", label: "Anyway" },
              { value: "Georgia", label: "Editorial serif" },
              { value: "Arial", label: "Sans serif" },
            ]}
          />

          <ToolbarDropdown
            label="Size"
            onBeforeOpen={rememberSelection}
            onSelect={(value) => command("fontSize", value)}
            options={[
              { value: "2", label: "Small" },
              { value: "3", label: "Normal" },
              { value: "5", label: "Large" },
            ]}
          />
        </div>

        <span className="hidden h-7 w-px bg-[#242617]/14 sm:block" />

        <div className="flex items-center gap-1.5">
          {[
            ["≡", "justifyLeft", "Align left"],
            ["≣", "justifyCenter", "Align center"],
            ["≡", "justifyRight", "Align right"],
            ["•", "insertUnorderedList", "Bulleted list"],
            ["1.", "insertOrderedList", "Numbered list"],
          ].map(([label, action, title]) => (
            <button
              key={action}
              type="button"
              title={title}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => command(action)}
              className={toolbarButton}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="hidden h-7 w-px bg-[#242617]/14 sm:block" />

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            rememberSelection();
          }}
          onClick={openPhoto}
          className="h-9 cursor-pointer rounded-lg border border-[#b88a3b]/35 bg-[#b88a3b] px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#d5ad68] sm:ml-auto"
        >
          <span className="mr-2 text-sm font-normal">+</span>
          Photo
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        aria-label="Story content editor"
        dangerouslySetInnerHTML={{ __html: initialHtml.current }}
        onInput={synchronize}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onClick={(event) => {
          const figure = (event.target as HTMLElement).closest(
            "figure[data-story-image='true']",
          ) as HTMLElement | null;

          if (figure) {
            event.preventDefault();
            openPhotoEditor(figure);
          }
        }}
        className={`${styles.content} ${styles.editor}`}
      />

      <p className="mt-2 text-xs leading-5 text-[#242617]/40">
        Select text to format it. Hover or click an inserted photo to edit its settings.
      </p>

      {photoOpen ? (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-[#071321]/55 p-5 backdrop-blur-[7px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePhoto();
          }}
        >
          <div className="my-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/35 bg-[#f4efe4] shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
            <div className="flex items-center justify-between border-b border-[#242617]/10 px-6 py-5 md:px-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
                  Story media
                </p>
                <h3 className="mt-2 font-serif text-3xl text-[#242617]">
                  {editingPhoto ? "Edit photo" : "Insert a photo"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closePhoto}
                className="grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-[#071321] text-xl text-white transition hover:bg-[#b88a3b]"
              >
                ×
              </button>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
              <AdminImageDropzone
                label="Inline story image"
                value={photoSrc}
                onChange={setPhotoSrc}
                existingImageUrls={existingPhotoUrls}
                context="story"
                entitySlug={uploadSlug}
                slotKey="inline-content"
                ratio="4 / 3"
                emptyText="DROP PHOTO OR CLICK TO UPLOAD"
              />

              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.17em] text-[#242617]/45">
                    Alternative text
                  </span>
                  <input
                    value={photoAlt}
                    onChange={(event) => setPhotoAlt(event.target.value)}
                    placeholder="Describe the image"
                    className="w-full rounded-2xl border border-[#242617]/10 bg-white/45 px-4 py-3 text-sm outline-none focus:border-[#b88a3b]/70"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.17em] text-[#242617]/45">
                    Legend
                  </span>
                  <textarea
                    rows={3}
                    value={photoCaption}
                    onChange={(event) => setPhotoCaption(event.target.value)}
                    placeholder="Credit, context or a short description"
                    className="w-full resize-none rounded-2xl border border-[#242617]/10 bg-white/45 px-4 py-3 text-sm leading-6 outline-none focus:border-[#b88a3b]/70"
                  />
                </label>

                <div>
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.17em] text-[#242617]/45">
                    Placement
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["left", "full", "right"] as ImageAlignment[]).map(
                      (alignment) => (
                        <button
                          key={alignment}
                          type="button"
                          onClick={() => setPhotoAlignment(alignment)}
                          className={choiceClass(photoAlignment === alignment)}
                        >
                          {alignment}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.17em] text-[#242617]/45">
                    Size
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["small", "medium", "large"] as ImageSize[]).map(
                      (size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPhotoSize(size)}
                          className={choiceClass(photoSize === size)}
                        >
                          {size}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[#242617]/10 px-6 py-5 md:px-8">
              {editingPhoto ? (
                <button
                  type="button"
                  onClick={removeSelectedPhoto}
                  className="mr-auto cursor-pointer rounded-full border border-red-900/20 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-red-900/65 transition hover:bg-red-900 hover:text-white"
                >
                  Remove photo
                </button>
              ) : null}

              <button
                type="button"
                onClick={closePhoto}
                className="cursor-pointer rounded-full border border-[#242617]/12 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#242617]/50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!photoSrc}
                onClick={insertPhoto}
                className="cursor-pointer rounded-full bg-[#20240f] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b88a3b] disabled:cursor-not-allowed disabled:opacity-35"
              >
                {editingPhoto ? "Save photo settings" : "Insert photo"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
