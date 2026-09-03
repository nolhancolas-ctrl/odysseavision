"use client";

import { useEffect, useRef, useState, type DragEvent as ReactDragEvent } from "react";
import {
  StoryMediaDialog,
  createEmptyStoryMediaDraft,
  type StoryGalleryLayout,
  type StoryImageAlignment,
  type StoryImageSize,
  type StoryMediaDraft,
  type StoryMediaItem,
  type StoryWatermark,
} from "@/components/admin/stories/StoryMediaDialog";
import {
  StoryVideoDialog,
  createEmptyStoryVideoDraft,
  resolveStoryVideoUrl,
  type StoryVideoDraft,
} from "@/components/admin/stories/StoryVideoDialog";
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
  const selectedVideo = useRef<HTMLElement | null>(null);
  const draggedStoryMedia = useRef<HTMLElement | null>(null);
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
  const [mediaDraft, setMediaDraft] = useState<StoryMediaDraft>(
    createEmptyStoryMediaDraft(),
  );
  const [videoOpen, setVideoOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(false);
  const [videoDraft, setVideoDraft] = useState<StoryVideoDraft>(
    createEmptyStoryVideoDraft(),
  );

  useEffect(() => {
    const editor = editorRef.current;

    if (
      !editor ||
      editor.dataset.storyEditorInitialized === "true"
    ) {
      return;
    }

    editor.innerHTML = initialHtml.current;
    editor.dataset.storyEditorInitialized = "true";
  }, []);

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
          "figure[data-story-image='true'], figure[data-story-video='true']",
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


  function normalizeWatermark(value: string | null): StoryWatermark {
    if (value === "ANDREW" || value === "MORGANE") {
      return value;
    }

    return "NONE";
  }

  function readMediaDraft(container: HTMLElement): StoryMediaDraft {
    const gallery = container.matches(
      "section[data-story-gallery='true']",
    )
      ? container
      : null;

    const figures = gallery
      ? Array.from(
          gallery.querySelectorAll<HTMLElement>(
            "figure[data-story-image='true']",
          ),
        )
      : [container];

    const items: StoryMediaItem[] = figures
      .map((figure, index) => {
        const image = figure.querySelector("img");
        const caption = figure.querySelector("figcaption");
        const inlineWidth = Number.parseFloat(
          figure.style.width,
        );
        const attributeWidth = Number(
          figure.getAttribute("data-width"),
        );
        const storedWidth =
          Number.isFinite(inlineWidth) && inlineWidth > 0
            ? inlineWidth
            : Number.isFinite(attributeWidth) &&
                attributeWidth > 0
              ? attributeWidth
              : 100;

        if (!image?.src) return null;

        return {
          id: `${Date.now()}-${index}`,
          src: image.getAttribute("src") || image.src,
          alt: image.getAttribute("alt") || "",
          caption: caption?.textContent?.trim() || "",
          watermark: normalizeWatermark(
            figure.getAttribute("data-watermark"),
          ),
          width: Math.max(
            12,
            Math.min(100, storedWidth),
          ),
          x: figure.hasAttribute("data-x")
            ? Number(figure.getAttribute("data-x"))
            : undefined,
          y: figure.hasAttribute("data-y")
            ? Number(figure.getAttribute("data-y"))
            : undefined,
          height: figure.hasAttribute("data-height")
            ? Number(figure.getAttribute("data-height"))
            : undefined,
          cropX: figure.hasAttribute("data-crop-x")
            ? Number(figure.getAttribute("data-crop-x"))
            : undefined,
          cropY: figure.hasAttribute("data-crop-y")
            ? Number(figure.getAttribute("data-crop-y"))
            : undefined,
          cropZoom: figure.hasAttribute("data-crop-zoom")
            ? Number(figure.getAttribute("data-crop-zoom"))
            : undefined,
        };
      })
      .filter((item) => item !== null) as StoryMediaItem[];

    const className = container.className;

    const alignment: StoryImageAlignment = className.includes(
      "story-media-left",
    )
      ? "left"
      : className.includes("story-media-right")
        ? "right"
        : "full";

    const size: StoryImageSize =
      container.getAttribute("data-size") === "small" ||
      className.includes("story-media-small") ||
      className.includes("story-gallery-small")
        ? "small"
        : container.getAttribute("data-size") === "large" ||
            className.includes("story-media-large") ||
            className.includes("story-gallery-large")
          ? "large"
          : "medium";

    const rawLayout = container.getAttribute("data-layout");
    const layout: StoryGalleryLayout =
      rawLayout === "row" ||
      rawLayout === "mosaic" ||
      rawLayout === "stack"
        ? rawLayout
        : "grid";

    return {
      items,
      alignment,
      size,
      layout,
      compositionWidth: Math.max(
        40,
        Math.min(
          100,
          Number(
            container.getAttribute("data-composition-width") ?? "100",
          ),
        ),
      ),
      photoGap: Math.max(
        0,
        Math.min(
          32,
          Number(container.getAttribute("data-photo-gap") ?? "12"),
        ),
      ),
      cornerRadius: Math.max(
        0,
        Math.min(
          40,
          Number(
            container.getAttribute("data-corner-radius") ?? "16",
          ),
        ),
      ),
    };
  }

  function collectMediaUrlsExcluding(container: HTMLElement | null) {
    const editor = editorRef.current;

    if (!editor) return [];

    return Array.from(
      editor.querySelectorAll<HTMLElement>(
        "figure[data-story-image='true']",
      ),
    )
      .filter(
        (figure) =>
          !container ||
          (figure !== container && !container.contains(figure)),
      )
      .map(
        (figure) =>
          figure.querySelector("img")?.getAttribute("src") || "",
      )
      .filter(Boolean);
  }

  function openMedia() {
    selectedFigure.current = null;
    setEditingPhoto(false);
    setMediaDraft(createEmptyStoryMediaDraft());
    setExistingPhotoUrls(collectMediaUrlsExcluding(null));
    setPhotoOpen(true);
  }

  function openMediaEditor(container: HTMLElement) {
    selectedFigure.current = container;
    setEditingPhoto(true);
    setMediaDraft(readMediaDraft(container));
    setExistingPhotoUrls(collectMediaUrlsExcluding(container));
    setPhotoOpen(true);
  }

  function buildFigureHtml(
    item: StoryMediaItem,
    className: string,
    index?: number,
    frame?: Pick<
      StoryMediaDraft,
      "compositionWidth" | "photoGap" | "cornerRadius"
    >,
    standalone = false,
  ) {
    const caption = item.caption.trim()
      ? `<figcaption class="story-media-caption">${escapeHtml(
          item.caption.trim(),
        )}</figcaption>`
      : "";

    const indexAttribute =
      index === undefined
        ? ""
        : ` data-story-image-index="${index}"`;

    const safeCompositionWidth = Math.max(
      40,
      Math.min(100, frame?.compositionWidth ?? 100),
    );
    const safePhotoGap = Math.max(
      0,
      Math.min(32, frame?.photoGap ?? 12),
    );
    const safeCornerRadius = Math.max(
      0,
      Math.min(40, frame?.cornerRadius ?? 16),
    );
    const safeX = Math.max(
      0,
      Math.min(100, item.x ?? 0),
    );
    const safeY = Math.max(0, item.y ?? 0);
    const safeWidth = Math.max(
      12,
      Math.min(100, item.width || 100),
    );
    const serializedWidth =
      Math.round(safeWidth * 1000) / 1000;
    const legacyWidthClass = Math.max(
      20,
      Math.min(
        100,
        Math.round(safeWidth / 5) * 5,
      ),
    );
    const safeHeight = Math.max(120, item.height ?? 320);
    const safeCropX = Math.max(
      0,
      Math.min(100, item.cropX ?? 50),
    );
    const safeCropY = Math.max(
      0,
      Math.min(100, item.cropY ?? 50),
    );
    const safeCropZoom = Math.max(
      1,
      Math.min(2.5, item.cropZoom ?? 1),
    );

    const frameAttributes = frame
      ? `data-composition-width="${safeCompositionWidth}" ` +
        `data-photo-gap="${safePhotoGap}" ` +
        `data-corner-radius="${safeCornerRadius}" `
      : "";

    const spatialAttributes =
      `data-x="${safeX}" ` +
      `data-y="${safeY}" ` +
      `data-height="${safeHeight}" ` +
      `data-crop-x="${safeCropX}" ` +
      `data-crop-y="${safeCropY}" ` +
      `data-crop-zoom="${safeCropZoom}" `;

    const frameStyle = frame
      ? `style="${
          standalone
            ? `max-width:${safeCompositionWidth}%;`
            : (
                `position:absolute;` +
                `left:${safeX}%;` +
                `top:${safeY / 10}cqw;` +
                `width:${safeWidth}%;` +
                `height:${safeHeight / 10}cqw;` +
                `padding:${safePhotoGap / 2}px;` +
                `box-sizing:border-box;` +
                `background:transparent;`
              )
        }border-radius:${
          safeCornerRadius + safePhotoGap / 2
        }px;" `
      : "";

    const imageStyle =
      `object-position:${safeCropX}% ${safeCropY}%;` +
      `transform:scale(${safeCropZoom});` +
      `transform-origin:${safeCropX}% ${safeCropY}%;` +
      `border-radius:${safeCornerRadius}px;`;

    return (
      `<figure contenteditable="false" tabindex="0" ` +
      `data-story-image="true"${indexAttribute} ` +
      `data-watermark="${item.watermark}" ` +
      `data-width="${serializedWidth}" ` +
      frameAttributes +
      spatialAttributes +
      frameStyle +
      `draggable="true" ` +
      `class="${className} story-media-width-${legacyWidthClass}">` +
      `<img src="${escapeHtml(item.src)}" ` +
      `alt="${escapeHtml(item.alt.trim())}" ` +
      `style="${imageStyle}" ` +
      `loading="lazy" decoding="async">` +
      caption +
      `</figure>`
    );
  }

  function saveMediaDraft(draft: StoryMediaDraft) {
    const editor = editorRef.current;

    if (!editor || draft.items.length === 0) return;

    const canvasHeight = Math.max(
      120,
      Math.ceil(
        draft.items.reduce(
          (maximum, item) =>
            Math.max(
              maximum,
              (item.y ?? 0) + (item.height ?? 320),
            ),
          0,
        ),
      ),
    );

    const mediaHtml =
      draft.items.length === 1
        ? buildFigureHtml(
            draft.items[0],
            `story-media story-media-${draft.alignment} story-media-${draft.size}`,
            undefined,
            draft,
            true,
          )
        : (
            `<section contenteditable="false" tabindex="0" draggable="true" ` +
            `data-story-gallery="true" ` +
            `data-layout="${draft.layout}" ` +
            `data-size="${draft.size}" ` +
            `data-count="${draft.items.length}" ` +
            `data-composition-width="${draft.compositionWidth}" ` +
            `data-photo-gap="${draft.photoGap}" ` +
            `data-corner-radius="${draft.cornerRadius}" ` +
            `data-spatial-layout="true" ` +
            `data-canvas-height="${canvasHeight}" ` +
            `style="position:relative;display:block;width:${Math.max(40, Math.min(100, draft.compositionWidth))}%;aspect-ratio:1000 / ${canvasHeight};container-type:inline-size;gap:0;margin-inline:auto;" ` +
            `class="story-gallery story-gallery-${draft.layout} story-gallery-${draft.size}">` +
            draft.items
              .map((item, index) =>
                buildFigureHtml(
                  item,
                  "story-gallery-item",
                  index,
                  draft,
                ),
              )
              .join("") +
            `</section>`
          );

    if (editingPhoto && selectedFigure.current) {
      selectedFigure.current.outerHTML = mediaHtml;
    } else {
      const template = document.createElement("template");
      template.innerHTML = `${mediaHtml}<p><br></p>`;

      const fragment = template.content;
      const trailingParagraph = fragment.lastElementChild;
      const insertionRange = savedRange.current;

      if (
        insertionRange &&
        editor.contains(insertionRange.commonAncestorContainer)
      ) {
        insertionRange.deleteContents();
        insertionRange.insertNode(fragment);
      } else {
        editor.append(fragment);
      }

      editor.focus();

      if (trailingParagraph) {
        const nextRange = document.createRange();
        nextRange.selectNodeContents(trailingParagraph);
        nextRange.collapse(false);

        const selection = window.getSelection();

        if (selection) {
          selection.removeAllRanges();
          selection.addRange(nextRange);
          savedRange.current = nextRange.cloneRange();
        }
      }
    }

    selectedFigure.current = null;
    setEditingPhoto(false);
    setPhotoOpen(false);
    synchronize();
  }

  function insertPhoto() {
    if (!photoSrc) return;

    const editor = editorRef.current;
    if (!editor) return;

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
      const template = document.createElement("template");
      template.innerHTML = `${figureHtml}<p><br></p>`;

      const fragment = template.content;
      const trailingParagraph = fragment.lastElementChild;
      const insertionRange = savedRange.current;

      if (
        insertionRange &&
        editor.contains(insertionRange.commonAncestorContainer)
      ) {
        insertionRange.deleteContents();
        insertionRange.insertNode(fragment);
      } else {
        editor.append(fragment);
      }

      editor.focus();

      if (trailingParagraph) {
        const nextRange = document.createRange();
        nextRange.selectNodeContents(trailingParagraph);
        nextRange.collapse(false);

        const selection = window.getSelection();

        if (selection) {
          selection.removeAllRanges();
          selection.addRange(nextRange);
          savedRange.current = nextRange.cloneRange();
        }
      }
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



  function openVideo() {
    selectedVideo.current = null;
    setEditingVideo(false);
    setVideoDraft(createEmptyStoryVideoDraft());
    setVideoOpen(true);
  }

  function openVideoEditor(figure: HTMLElement) {
    const caption = figure.querySelector("figcaption");

    const alignment =
      figure.classList.contains("story-media-left")
        ? "left"
        : figure.classList.contains("story-media-right")
          ? "right"
          : figure.classList.contains("story-media-full")
            ? "full"
            : "center";

    const size =
      figure.classList.contains("story-media-small")
        ? "small"
        : figure.classList.contains("story-media-large")
          ? "large"
          : "medium";

    selectedVideo.current = figure;
    setEditingVideo(true);
    setVideoDraft({
      source: figure.dataset.videoSource || "",
      caption: caption?.textContent || "",
      alignment,
      size,
    });
    setVideoOpen(true);
  }

  function closeVideo() {
    selectedVideo.current = null;
    setEditingVideo(false);
    setVideoOpen(false);
    editorRef.current?.focus();
    restoreSelection();
  }

  function buildVideoHtml(draft: StoryVideoDraft) {
    const resolved = resolveStoryVideoUrl(draft.source);

    if (!resolved) {
      return "";
    }

    const source = escapeHtml(draft.source.trim());
    const embedUrl = escapeHtml(resolved.embedUrl);

    const caption = draft.caption.trim()
      ? `<figcaption class="story-video-caption">${escapeHtml(
          draft.caption.trim(),
        )}</figcaption>`
      : "";

    const player =
      resolved.kind === "direct"
        ? (
            `<video src="${embedUrl}" controls preload="metadata" ` +
            `playsinline></video>`
          )
        : (
            `<iframe src="${embedUrl}" ` +
            `title="Embedded story video" ` +
            `loading="lazy" frameborder="0" ` +
            `allow="accelerometer; autoplay; clipboard-write; ` +
            `encrypted-media; gyroscope; picture-in-picture; web-share" ` +
            `allowfullscreen ` +
            `referrerpolicy="strict-origin-when-cross-origin"></iframe>`
          );

    return (
      `<figure contenteditable="false" tabindex="0" ` +
      `data-story-video="true" ` +
      `data-video-kind="${resolved.kind}" ` +
      `data-video-source="${source}" ` +
      `draggable="true" ` +
      `class="story-video story-media-${draft.alignment} ` +
      `story-media-${draft.size}">` +
      `<div class="story-video-frame">${player}</div>` +
      caption +
      `</figure>`
    );
  }

  function saveVideoDraft(draft: StoryVideoDraft) {
    const editor = editorRef.current;
    if (!editor) return;

    const videoHtml = buildVideoHtml(draft);
    if (!videoHtml) return;

    if (editingVideo && selectedVideo.current) {
      selectedVideo.current.outerHTML = videoHtml;
    } else {
      const template = document.createElement("template");
      template.innerHTML = `${videoHtml}<p><br></p>`;

      const fragment = template.content;
      const trailingParagraph = fragment.lastElementChild;
      const insertionRange = savedRange.current;

      if (
        insertionRange &&
        editor.contains(insertionRange.commonAncestorContainer)
      ) {
        insertionRange.deleteContents();
        insertionRange.insertNode(fragment);
      } else {
        editor.append(fragment);
      }

      editor.focus();

      if (trailingParagraph) {
        const nextRange = document.createRange();
        nextRange.selectNodeContents(trailingParagraph);
        nextRange.collapse(false);

        const selection = window.getSelection();

        if (selection) {
          selection.removeAllRanges();
          selection.addRange(nextRange);
          savedRange.current = nextRange.cloneRange();
        }
      }
    }

    selectedVideo.current = null;
    setEditingVideo(false);
    setVideoOpen(false);
    synchronize();
  }

  function removeSelectedVideo() {
    selectedVideo.current?.remove();
    selectedVideo.current = null;
    setEditingVideo(false);
    setVideoOpen(false);
    synchronize();
  }

  function getStoryMediaContainer(
    target: EventTarget | null,
  ): HTMLElement | null {
    const element = target as HTMLElement | null;

    if (!element?.closest) return null;

    const figure = element.closest(
      "figure[data-story-image='true']",
    ) as HTMLElement | null;

    if (figure) {
      return (
        (figure.closest(
          "section[data-story-gallery='true']",
        ) as HTMLElement | null) || figure
      );
    }

    return element.closest(
      "section[data-story-gallery='true']",
    ) as HTMLElement | null;
  }

  function handleMediaDragStart(
    event: ReactDragEvent<HTMLDivElement>,
  ) {
    const media = getStoryMediaContainer(event.target);

    if (!media) return;

    draggedStoryMedia.current = media;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/story-media", "move");

    window.setTimeout(() => {
      media.style.opacity = "0.45";
    }, 0);
  }

  function handleMediaDragOver(
    event: ReactDragEvent<HTMLDivElement>,
  ) {
    if (!draggedStoryMedia.current) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleMediaDrop(event: ReactDragEvent<HTMLDivElement>) {
    const dragged = draggedStoryMedia.current;
    const editor = editorRef.current;

    if (!dragged || !editor) return;

    event.preventDefault();

    const rawTarget = (event.target as HTMLElement).closest(
      "p,h2,h3,blockquote,ul,ol,figure[data-story-image='true'],section[data-story-gallery='true']",
    ) as HTMLElement | null;

    const target = rawTarget
      ? getStoryMediaContainer(rawTarget) || rawTarget
      : null;

    if (!target || target === dragged || dragged.contains(target)) {
      editor.append(dragged);
    } else {
      const rect = target.getBoundingClientRect();
      const insertAfter = event.clientY > rect.top + rect.height / 2;

      target.parentNode?.insertBefore(
        dragged,
        insertAfter ? target.nextSibling : target,
      );
    }

    dragged.style.opacity = "";
    draggedStoryMedia.current = null;
    synchronize();
  }

  function handleMediaDragEnd() {
    if (draggedStoryMedia.current) {
      draggedStoryMedia.current.style.opacity = "";
    }

    draggedStoryMedia.current = null;
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
          onPointerDown={(event) => {
            event.preventDefault();
            rememberSelection();
          }}
          onClick={openVideo}
          className="h-9 cursor-pointer rounded-lg border border-[#414832]/35 bg-[#414832] px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#596044] sm:ml-auto"
        >
          <span className="mr-2 text-sm font-normal">+</span>
          Video
        </button>

        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            rememberSelection();
          }}
          onClick={openMedia}
          className="h-9 cursor-pointer rounded-lg border border-[#b88a3b]/35 bg-[#b88a3b] px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#d5ad68]"
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
        onInput={synchronize}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onDragStart={handleMediaDragStart}
        onDragOver={handleMediaDragOver}
        onDrop={handleMediaDrop}
        onDragEnd={handleMediaDragEnd}
        onClick={(event) => {
          const target = event.target as HTMLElement;

          const video = target.closest(
            "figure[data-story-video='true']",
          ) as HTMLElement | null;

          if (video) {
            event.preventDefault();
            openVideoEditor(video);
            return;
          }

          const figure = target.closest(
            "figure[data-story-image='true']",
          ) as HTMLElement | null;

          if (figure) {
            event.preventDefault();

            const gallery = figure.closest(
              "section[data-story-gallery='true']",
            ) as HTMLElement | null;

            openMediaEditor(gallery || figure);
          }
        }}
        className={`${styles.content} ${styles.editor}`}
      />

      {videoOpen ? (
        <StoryVideoDialog
          initialDraft={videoDraft}
          editing={editingVideo}
          onCancel={closeVideo}
          onRemove={
            editingVideo
              ? removeSelectedVideo
              : undefined
          }
          onSave={saveVideoDraft}
        />
      ) : null}

      {photoOpen ? (
        <StoryMediaDialog
          initialDraft={mediaDraft}
          editing={editingPhoto}
          uploadSlug={uploadSlug}
          existingImageUrls={existingPhotoUrls}
          onCancel={() => {
            selectedFigure.current = null;
            setEditingPhoto(false);
            setPhotoOpen(false);
          }}
          onRemove={editingPhoto ? removeSelectedPhoto : undefined}
          onSave={saveMediaDraft}
        />
      ) : null}
    </div>
  );
}
