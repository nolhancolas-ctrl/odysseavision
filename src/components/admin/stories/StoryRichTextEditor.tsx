"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
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
import {
  STORY_MEDIA_EDIT_EVENT,
  StoryListEnter,
  StoryListItem,
  StoryMediaNode,
  normalizeLegacyStoryHtml,
  serializeStoryHtml,
  type StoryMediaEditDetail,
} from "@/components/admin/stories/storyTiptap";
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
  "grid h-8 min-w-8 cursor-pointer place-items-center rounded-lg border border-[#242617]/10 bg-white/30 px-2 text-xs text-[#242617]/62 transition hover:border-[#b88a3b]/55 hover:bg-[#e8dfcf] hover:text-[#071321] sm:h-9 sm:min-w-9 sm:px-2.5 sm:text-sm";

type TextAlignment =
  | "left"
  | "center"
  | "right"
  | "justify";

function TextAlignmentIcon({
  alignment,
}: {
  alignment: TextAlignment;
}) {
  const widths =
    alignment === "justify"
      ? ["100%", "100%", "100%", "100%"]
      : ["100%", "68%", "86%", "58%"];

  const lineAlignment =
    alignment === "left"
      ? "mr-auto"
      : alignment === "right"
        ? "ml-auto"
        : alignment === "center"
          ? "mx-auto"
          : "";

  return (
    <span
      aria-hidden="true"
      className="flex h-4 w-[18px] flex-col justify-center gap-[2px]"
    >
      {widths.map((width, index) => (
        <span
          key={`${width}-${index}`}
          className={`block h-[1.5px] rounded-full bg-current ${lineAlignment}`}
          style={{ width }}
        />
      ))}
    </span>
  );
}

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
    <div
      ref={containerRef}
      className="relative min-w-0 flex-1 lg:flex-none"
    >
      <button
        type="button"
        aria-expanded={open}
        onMouseDown={onBeforeOpen}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-9 w-full min-w-0 cursor-pointer lg:min-w-[108px] items-center justify-between gap-4 rounded-lg border bg-white/30 px-3 text-xs text-[#242617]/62 transition ${
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
  typographyStyle,
  existingPageImageUrls = [],
  onContentChange,
  onNavigateBack,
}: {
  initialContent: string;
  uploadSlug: string;
  typographyStyle?: CSSProperties;
  existingPageImageUrls?: readonly string[];
  onContentChange?: (content: string) => void;
  onNavigateBack?: () => void;
}) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const toolbarAnchorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const tiptapEditorRef = useRef<Editor | null>(null);
  const onContentChangeRef = useRef(onContentChange);
  const selectedMediaPosition = useRef<number | null>(null);

  onContentChangeRef.current = onContentChange;

  const [toolbarPosition, setToolbarPosition] =
    useState<{
      left: number;
      width: number;
      height: number;
    } | null>(null);
  const [showScrollTop, setShowScrollTop] =
    useState(false);
  const [compactToolbar, setCompactToolbar] =
    useState(false);
  const [toolbarOpen, setToolbarOpen] =
    useState(false);
  const selectedFigure = useRef<HTMLElement | null>(null);
  const selectedVideo = useRef<HTMLElement | null>(null);
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
    const element = editorRef.current;

    if (!element || tiptapEditorRef.current) {
      return;
    }

    const tiptap = new Editor({
      element,
      content: normalizeLegacyStoryHtml(
        initialHtml.current,
      ),
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [2, 3],
          },
          listItem: false,
          link: {
            openOnClick: false,
            autolink: false,
          },
        }),
        StoryListItem,
        StoryListEnter,
        StoryMediaNode,
        TextAlign.configure({
          types: [
            "paragraph",
            "heading",
            "blockquote",
          ],
        }),
        TextStyleKit,
      ],
      editorProps: {
        attributes: {
          class: "story-tiptap-document",
          spellcheck: "true",
        },
      },
      onUpdate: () => {
        synchronize();
      },
    });

    tiptapEditorRef.current = tiptap;

    const handleMediaEdit = (event: Event) => {
      const detail = (
        event as CustomEvent<StoryMediaEditDetail>
      ).detail;

      if (!detail) return;

      selectedMediaPosition.current =
        detail.position;

      if (
        detail.element.matches(
          "figure[data-story-video='true']",
        )
      ) {
        openVideoEditor(detail.element);
      } else {
        openMediaEditor(detail.element);
      }
    };

    tiptap.view.dom.addEventListener(
      STORY_MEDIA_EDIT_EVENT,
      handleMediaEdit,
    );

    window.requestAnimationFrame(() => {
      synchronize(false);
    });

    return () => {
      tiptap.view.dom.removeEventListener(
        STORY_MEDIA_EDIT_EVENT,
        handleMediaEdit,
      );
      tiptap.destroy();
      tiptapEditorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia(
      "(max-width: 1023px)",
    );

    const update = () => {
      const compact = query.matches;
      setCompactToolbar(compact);
      setToolbarOpen(!compact);
    };

    update();
    query.addEventListener("change", update);

    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    function updateToolbarPosition() {
      const container = editorContainerRef.current;
      const anchor = toolbarAnchorRef.current;
      const toolbar = toolbarRef.current;

      if (!container || !anchor || !toolbar) {
        return;
      }

      const top = 12;
      const anchorRect = anchor.getBoundingClientRect();
      const containerRect =
        container.getBoundingClientRect();
      const height = toolbar.offsetHeight;

      const shouldPin =
        anchorRect.top <= top &&
        containerRect.bottom > top + height;

      if (!shouldPin) {
        setToolbarPosition(null);
        return;
      }

      setToolbarPosition((current) => {
        const next = {
          left: anchorRect.left,
          width: anchorRect.width,
          height,
        };

        if (
          current &&
          Math.abs(current.left - next.left) < 1 &&
          Math.abs(current.width - next.width) < 1 &&
          Math.abs(current.height - next.height) < 1
        ) {
          return current;
        }

        return next;
      });
    }

    updateToolbarPosition();

    window.addEventListener(
      "scroll",
      updateToolbarPosition,
      true,
    );
    window.addEventListener(
      "resize",
      updateToolbarPosition,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateToolbarPosition,
        true,
      );
      window.removeEventListener(
        "resize",
        updateToolbarPosition,
      );
    };
  }, [toolbarOpen]);

  useEffect(() => {
    const updateScrollTop = () => {
      setShowScrollTop(window.scrollY > 420);
    };

    updateScrollTop();

    window.addEventListener(
      "scroll",
      updateScrollTop,
      { passive: true },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateScrollTop,
      );
    };
  }, []);

  function synchronize(notify = true) {
    const tiptap = tiptapEditorRef.current;
    if (!tiptap) return;

    const html = serializeStoryHtml(tiptap).trim();
    const container = document.createElement("div");
    container.innerHTML = html;

    const hasContent =
      Boolean(container.textContent?.trim()) ||
      Boolean(
        container.querySelector(
          "img, iframe, video, figure, section",
        ),
      );

    const nextContent = hasContent
      ? `${STORY_HTML_PREFIX}${html}`
      : "";

    setContentValue(nextContent);

    if (notify) {
      onContentChangeRef.current?.(nextContent);
    }
  }

  function rememberSelection() {
    // ProseMirror stores its own selection.
  }

  function restoreSelection() {
    const tiptap = tiptapEditorRef.current;

    if (!tiptap) {
      return false;
    }

    tiptap.commands.focus();
    return true;
  }

  function command(name: string, value?: string) {
    const tiptap = tiptapEditorRef.current;
    if (!tiptap) return;

    if (name === "bold") {
      tiptap.chain().focus().toggleBold().run();
    } else if (name === "italic") {
      tiptap.chain().focus().toggleItalic().run();
    } else if (name === "underline") {
      tiptap.chain().focus().toggleUnderline().run();
    } else if (name === "justifyLeft") {
      tiptap.chain().focus().setTextAlign("left").run();
    } else if (name === "justifyCenter") {
      tiptap.chain().focus().setTextAlign("center").run();
    } else if (name === "justifyRight") {
      tiptap.chain().focus().setTextAlign("right").run();
    } else if (name === "justifyFull") {
      tiptap.chain().focus().setTextAlign("justify").run();
    } else if (name === "fontName" && value) {
      tiptap.chain().focus().setFontFamily(value).run();
    } else if (name === "fontSize" && value) {
      const sizes: Record<string, string> = {
        "2": "13px",
        "3": "15px",
        "5": "22px",
      };

      tiptap
        .chain()
        .focus()
        .setFontSize(sizes[value] ?? value)
        .run();
    }
  }

  function formatTextBlock(
    blockName: "p" | "h2" | "h3" | "blockquote",
  ) {
    const tiptap = tiptapEditorRef.current;
    if (!tiptap) return;

    if (blockName === "p") {
      tiptap
        .chain()
        .focus()
        .setParagraph()
        .unsetFontFamily()
        .unsetFontSize()
        .run();
    } else if (blockName === "h2") {
      tiptap
        .chain()
        .focus()
        .unsetFontFamily()
        .unsetFontSize()
        .setHeading({ level: 2 })
        .run();
    } else if (blockName === "h3") {
      tiptap
        .chain()
        .focus()
        .unsetFontFamily()
        .unsetFontSize()
        .setHeading({ level: 3 })
        .run();
    } else {
      tiptap
        .chain()
        .focus()
        .unsetFontFamily()
        .unsetFontSize()
        .toggleBlockquote()
        .run();
    }
  }

  function toggleList(listName: "ul" | "ol") {
    const tiptap = tiptapEditorRef.current;
    if (!tiptap) return;

    if (listName === "ul") {
      tiptap
        .chain()
        .focus()
        .toggleBulletList()
        .run();
    } else {
      tiptap
        .chain()
        .focus()
        .toggleOrderedList()
        .run();
    }
  }

  function normalizeLinkHref(value: string) {
    const href = value.trim();

    if (!href) return "";

    if (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("/") ||
      href.startsWith("#")
    ) {
      return href;
    }

    return `https://${href}`;
  }

  function editLink() {
    const tiptap = tiptapEditorRef.current;
    if (!tiptap) return;

    const existingHref =
      tiptap.getAttributes("link").href ?? "";

    if (
      tiptap.state.selection.empty &&
      !tiptap.isActive("link")
    ) {
      window.alert(
        "Select the text you want to link first.",
      );
      return;
    }

    const enteredHref = window.prompt(
      "Enter the destination URL:",
      existingHref,
    );

    if (enteredHref === null) return;

    const href = normalizeLinkHref(enteredHref);
    const chain = tiptap
      .chain()
      .focus()
      .extendMarkRange("link");

    if (!href) {
      chain.unsetLink().run();
      return;
    }

    const external =
      href.startsWith("http://") ||
      href.startsWith("https://");

    chain
      .setLink({
        href,
        target: external ? "_blank" : null,
        rel: external
          ? "noopener noreferrer"
          : null,
      })
      .run();
  }

  function removeLink() {
    tiptapEditorRef.current
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .unsetLink()
      .run();
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
    selectedMediaPosition.current = null;
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
    selectedMediaPosition.current = null;
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

    const alignment: StoryImageAlignment =
      className.includes("story-media-left")
        ? "left"
        : className.includes("story-media-right")
          ? "right"
          : className.includes("story-media-full") &&
              (items[0]?.width ?? 100) >= 99
            ? "full"
            : "center";

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
      compositionHeight: Math.max(
        120,
        Math.min(
          1200,
          Number(
            container.getAttribute(
              "data-composition-height",
            ) ??
              container.getAttribute(
                "data-canvas-height",
              ) ??
              Math.ceil(
                items.reduce(
                  (maximum, item) =>
                    Math.max(
                      maximum,
                      (item.y ?? 0) +
                        (item.height ?? 320),
                    ),
                  120,
                ),
              ),
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
    selectedMediaPosition.current = null;
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
      "compositionWidth" | "compositionHeight" | "photoGap" | "cornerRadius"
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
    const safeCompositionHeight = Math.max(
      120,
      Math.min(
        1200,
        frame?.compositionHeight ?? 560,
      ),
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
                `top:${(safeY / safeCompositionHeight) * 100}%;` +
                `width:${safeWidth}% !important;` +
                `height:${(safeHeight / safeCompositionHeight) * 100}% !important;` +
                `padding:${safePhotoGap / 2}px;` +
                `box-sizing:border-box;` +
                `background:transparent;`
              )
        }border-radius:${
          safeCornerRadius + safePhotoGap / 2
        }px;" `
      : "";

    const imageStyle =
      `display:block;` +
      `width:100%;` +
      `height:100%;` +
      `object-fit:cover;` +
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

  function replaceSelectedStoryMedia(
    html: string,
  ) {
    const tiptap = tiptapEditorRef.current;
    const position = selectedMediaPosition.current;

    if (!tiptap || position === null) {
      return false;
    }

    const node = tiptap.state.doc.nodeAt(position);

    if (!node || node.type.name !== "storyMedia") {
      return false;
    }

    tiptap.view.dispatch(
      tiptap.state.tr.setNodeMarkup(
        position,
        undefined,
        {
          ...node.attrs,
          html,
        },
      ),
    );

    return true;
  }

  function insertStoryMedia(html: string) {
    const tiptap = tiptapEditorRef.current;
    if (!tiptap) return;

    tiptap
      .chain()
      .focus()
      .insertContent([
        {
          type: "storyMedia",
          attrs: { html },
        },
        {
          type: "paragraph",
        },
      ])
      .run();
  }

  function removeSelectedStoryMedia() {
    const tiptap = tiptapEditorRef.current;
    const position = selectedMediaPosition.current;

    if (!tiptap || position === null) {
      return;
    }

    const node = tiptap.state.doc.nodeAt(position);

    if (!node || node.type.name !== "storyMedia") {
      return;
    }

    tiptap.view.dispatch(
      tiptap.state.tr.delete(
        position,
        position + node.nodeSize,
      ),
    );

    selectedMediaPosition.current = null;
  }


function saveMediaDraft(draft: StoryMediaDraft) {
    const editor = tiptapEditorRef.current;

    if (!editor || draft.items.length === 0) return;

    const canvasHeight = Math.max(
      120,
      Math.min(
        1200,
        Math.round(draft.compositionHeight),
      ),
    );

    const compositionWidth = Math.max(
      40,
      Math.min(
        100,
        Math.round(draft.compositionWidth),
      ),
    );

    const mediaHtml =
      `<section contenteditable="false" tabindex="0" draggable="true" ` +
      `data-story-gallery="true" ` +
      `data-story-composition="true" ` +
      `data-layout="${draft.layout}" ` +
      `data-size="${draft.size}" ` +
      `data-count="${draft.items.length}" ` +
      `data-composition-width="${compositionWidth}" ` +
      `data-composition-height="${canvasHeight}" ` +
      `data-photo-gap="${draft.photoGap}" ` +
      `data-corner-radius="${draft.cornerRadius}" ` +
      `data-spatial-layout="true" ` +
      `data-canvas-height="${canvasHeight}" ` +
      `style="position:relative;display:block;width:${compositionWidth}%;aspect-ratio:${compositionWidth * 10} / ${canvasHeight};container-type:inline-size;overflow:hidden;gap:0;margin-inline:auto;" ` +
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
      `</section>`;

    const replaced =
      editingPhoto &&
      replaceSelectedStoryMedia(mediaHtml);

    if (!replaced) {
      insertStoryMedia(mediaHtml);
    }

    selectedFigure.current = null;
    selectedMediaPosition.current = null;
    setEditingPhoto(false);
    setPhotoOpen(false);
    synchronize();
  }

  function insertPhoto() {
    if (!photoSrc) return;

    const editor = tiptapEditorRef.current;
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

    const replaced =
      editingPhoto &&
      replaceSelectedStoryMedia(figureHtml);

    if (!replaced) {
      insertStoryMedia(figureHtml);
    }

    selectedFigure.current = null;
    selectedMediaPosition.current = null;
    setEditingPhoto(false);
    setPhotoOpen(false);
    synchronize();
  }

  function removeSelectedPhoto() {
    removeSelectedStoryMedia();
    selectedFigure.current = null;
    selectedMediaPosition.current = null;
    setEditingPhoto(false);
    setPhotoOpen(false);
    synchronize();
  }

  function openVideo() {
    selectedVideo.current = null;
    selectedMediaPosition.current = null;
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
    selectedMediaPosition.current = null;
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
    const editor = tiptapEditorRef.current;
    if (!editor) return;

    const videoHtml = buildVideoHtml(draft);
    if (!videoHtml) return;

    const replaced =
      editingVideo &&
      replaceSelectedStoryMedia(videoHtml);

    if (!replaced) {
      insertStoryMedia(videoHtml);
    }

    selectedVideo.current = null;
    selectedMediaPosition.current = null;
    setEditingVideo(false);
    setVideoOpen(false);
    synchronize();
  }

  function removeSelectedVideo() {
    removeSelectedStoryMedia();
    selectedVideo.current = null;
    selectedMediaPosition.current = null;
    setEditingVideo(false);
    setVideoOpen(false);
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
    <div ref={editorContainerRef}>
      <input
        type="hidden"
        name="content"
        value={contentValue}
        readOnly
      />

      <div
        ref={toolbarAnchorRef}
        className="mb-3"
        style={
          toolbarPosition
            ? { height: toolbarPosition.height }
            : undefined
        }
      >
        <div
          ref={toolbarRef}
          className={`relative z-[90] flex flex-col items-stretch gap-2 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/95 p-2 shadow-[0_14px_35px_rgba(20,20,10,0.12)] backdrop-blur-md lg:w-full lg:flex-row lg:gap-3 ${
            compactToolbar && !toolbarOpen
              ? "w-fit"
              : "w-full"
          }`}
          style={
            toolbarPosition
              ? {
                  position: "fixed",
                  top: 12,
                  left:
                    compactToolbar && !toolbarOpen
                      ? toolbarPosition.left +
                        toolbarPosition.width -
                        54
                      : toolbarPosition.left,
                  width:
                    compactToolbar && !toolbarOpen
                      ? 54
                      : toolbarPosition.width,
                }
              : compactToolbar && !toolbarOpen
                ? {
                    marginLeft: "auto",
                    width: 54,
                  }
                : undefined
          }
        >
          <button
            type="button"
            aria-expanded={toolbarOpen}
            aria-label={
              toolbarOpen
                ? "Hide formatting tools"
                : "Show formatting tools"
            }
            title={
              toolbarOpen
                ? "Hide formatting tools"
                : "Show formatting tools"
            }
            onClick={() =>
              setToolbarOpen((current) => !current)
            }
            className="absolute right-2 top-2 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-[#d5ad68]/35 bg-[#071321] text-xl text-[#f4efe4] transition hover:bg-[#142844] lg:hidden"
          >
            {toolbarOpen ? "−" : "+"}
          </button>

          {!toolbarOpen ? (
            <span
              aria-hidden="true"
              className="h-9 w-9 lg:hidden"
            />
          ) : null}

        <div className={`${toolbarOpen ? "flex" : "hidden"} min-w-0 flex-1 flex-col justify-center gap-2 pr-11 lg:flex lg:pr-0`}>
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              title="Bold"
              onPointerDown={(event) => {
                event.preventDefault();
                rememberSelection();
              }}
              onClick={() => command("bold")}
              className={toolbarButton}
            >
              <strong className="text-base">B</strong>
            </button>

            <button
              type="button"
              title="Italic"
              onPointerDown={(event) => {
                event.preventDefault();
                rememberSelection();
              }}
              onClick={() => command("italic")}
              className={toolbarButton}
            >
              <em className="font-serif text-base">I</em>
            </button>

            <button
              type="button"
              title="Underline"
              onPointerDown={(event) => {
                event.preventDefault();
                rememberSelection();
              }}
              onClick={() => command("underline")}
              className={toolbarButton}
            >
              <span className="text-base underline">U</span>
            </button>

            <span className="hidden h-7 w-px bg-[#242617]/14 lg:block" />

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
                onPointerDown={(event) => {
                  event.preventDefault();
                  rememberSelection();
                }}
                onClick={() =>
                  formatTextBlock(
                    block as
                      | "p"
                      | "h2"
                      | "h3"
                      | "blockquote",
                  )
                }
                className={toolbarButton}
              >
                {label}
              </button>
            ))}

            <span className="hidden h-7 w-px bg-[#242617]/14 lg:block" />

            <span
              aria-hidden="true"
              className="basis-full md:hidden"
            />

            <ToolbarDropdown
              label="Font"
              onBeforeOpen={rememberSelection}
              onSelect={(value) =>
                command("fontName", value)
              }
              options={[
                { value: "Anyway", label: "Anyway" },
                {
                  value: "Georgia",
                  label: "Editorial serif",
                },
                {
                  value: "Arial",
                  label: "Sans serif",
                },
              ]}
            />

            <ToolbarDropdown
              label="Size"
              onBeforeOpen={rememberSelection}
              onSelect={(value) =>
                command("fontSize", value)
              }
              options={[
                { value: "2", label: "Small" },
                { value: "3", label: "Normal" },
                { value: "5", label: "Large" },
              ]}
            />
          </div>

          <div className="grid grid-cols-4 gap-1.5 md:grid-cols-8 lg:flex lg:flex-wrap lg:items-center">
            {(
              [
                [
                  "left",
                  "justifyLeft",
                  "Align left",
                ],
                [
                  "center",
                  "justifyCenter",
                  "Align center",
                ],
                [
                  "right",
                  "justifyRight",
                  "Align right",
                ],
                [
                  "justify",
                  "justifyFull",
                  "Justify",
                ],
              ] as const
            ).map(([alignment, action, title]) => (
              <button
                key={action}
                type="button"
                title={title}
                aria-label={title}
                onPointerDown={(event) => {
                  event.preventDefault();
                  rememberSelection();
                }}
                onClick={() => command(action)}
                className={toolbarButton}
              >
                <TextAlignmentIcon
                  alignment={alignment}
                />
              </button>
            ))}

            <span className="hidden h-7 w-px bg-[#242617]/14 lg:block" />

            <button
              type="button"
              title="Bulleted list"
              onPointerDown={(event) => {
                event.preventDefault();
                rememberSelection();
              }}
              onClick={() =>
                toggleList("ul")
              }
              className={toolbarButton}
            >
              <span className="text-base leading-none">
                •
              </span>
            </button>

            <button
              type="button"
              title="Numbered list"
              onPointerDown={(event) => {
                event.preventDefault();
                rememberSelection();
              }}
              onClick={() =>
                toggleList("ol")
              }
              className={toolbarButton}
            >
              <span className="text-sm leading-none">
                1.
              </span>
            </button>

            <span className="hidden h-7 w-px bg-[#242617]/14 lg:block" />

            <button
              type="button"
              title="Add or edit link"
              onPointerDown={(event) => {
                event.preventDefault();
                rememberSelection();
              }}
              onClick={editLink}
              className={toolbarButton}
            >
              <span className="text-[11px] font-semibold">
                Link
              </span>
            </button>

            <button
              type="button"
              title="Remove link"
              onPointerDown={(event) => {
                event.preventDefault();
                rememberSelection();
              }}
              onClick={removeLink}
              className={toolbarButton}
            >
              <span className="text-[11px] font-semibold">
                Unlink
              </span>
            </button>
          </div>
        </div>

        <div className={`${toolbarOpen ? "grid" : "hidden"} w-full shrink-0 grid-cols-[minmax(0,1fr)_2.5rem] gap-2 md:grid-cols-[minmax(0,1fr)_5.5rem] lg:grid lg:w-[12rem] lg:grid-cols-[minmax(0,1fr)_2.5rem]`}>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-1">
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={openMedia}
            className="h-9 w-full cursor-pointer rounded-lg border border-[#b88a3b]/35 bg-[#b88a3b] px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#d5ad68]"
          >
            <span className="mr-2 text-sm font-normal">
              +
            </span>
            Photo
          </button>

          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={openVideo}
            className="h-9 w-full cursor-pointer rounded-lg border border-[#414832]/35 bg-[#414832] px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#596044]"
          >
            <span className="mr-2 text-sm font-normal">
              +
            </span>
            Video
          </button>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-1">
            <button
              type="button"
              aria-label="Go back"
              title="Go back"
              onClick={() => {
                if (onNavigateBack) {
                  onNavigateBack();
                  return;
                }

                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/admin/stories");
                }
              }}
              className="grid h-9 w-10 cursor-pointer place-items-center rounded-lg border border-[#d5ad68]/35 bg-[#071321] text-2xl leading-none text-[#f4efe4] transition hover:bg-[#142844]"
            >
              <span className="-mt-1">‹</span>
            </button>

            <button
              type="button"
              aria-label="Back to top"
              title="Back to top"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className={`grid h-9 w-10 place-items-center rounded-lg border border-[#d5ad68]/35 bg-[#071321] text-2xl leading-none text-[#f4efe4] transition ${
                showScrollTop
                  ? "cursor-pointer opacity-100"
                  : "pointer-events-none opacity-25"
              }`}
            >
              <span className="-mt-1 block rotate-90">‹</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      <div
        ref={editorRef}
        aria-label="Story content editor"
        style={typographyStyle}
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
    selectedMediaPosition.current = null;
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
