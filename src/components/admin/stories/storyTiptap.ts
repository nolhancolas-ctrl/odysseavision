import {
  Extension,
  Node as TiptapNode,
  mergeAttributes,
  type Editor,
} from "@tiptap/core";
import { ListItem } from "@tiptap/extension-list";
import {
  installIndependentCompositions,
  storyLayoutIsMobile,
  STORY_MOBILE_MEDIA_QUERY,
  STORY_MAX_FRAME_HEIGHT,
} from "@/components/stories/storyComposition";

export const STORY_MEDIA_EDIT_EVENT =
  "story-media-edit";

export type StoryMediaEditDetail = {
  position: number;
  html: string;
  element: HTMLElement;
};

/*
 * A list item may contain one text block and, optionally,
 * one nested list. A second paragraph can therefore never
 * remain invisibly attached to the preceding bullet.
 */
export const StoryListItem = ListItem.extend({
  content:
    "(paragraph|heading|blockquote) (bulletList|orderedList)?",
});

/*
 * Enter at the end of a heading inside a list creates a new
 * list item and immediately turns its block into a paragraph.
 */
export const StoryListEnter = Extension.create({
  name: "storyListEnter",
  priority: 1100,

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { selection } = this.editor.state;
        const { $from } = selection;

        if (
          !selection.empty ||
          $from.parent.type.name !== "heading" ||
          $from.parentOffset !== $from.parent.content.size ||
          $from.depth < 2 ||
          $from.node(-1).type.name !== "listItem"
        ) {
          return false;
        }

        return this.editor
          .chain()
          .splitListItem("listItem")
          .setParagraph()
          .run();
      },
    };
  },
});

/*
 * Photos, galleries and videos remain atomic Story blocks.
 * Their current HTML is preserved exactly, while ProseMirror
 * controls their position in the document.
 */
export const StoryMediaNode = TiptapNode.create({
  name: "storyMedia",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      html: {
        default: "",
        parseHTML: (element) =>
          element.tagName.toLowerCase() === "story-media"
            ? element.getAttribute("data-html") ?? ""
            : element.outerHTML,
        renderHTML: (attributes) => ({
          "data-html": attributes.html,
        }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: "story-media[data-html]" },
      { tag: "section[data-story-text-media='true']" },
      { tag: "figure[data-story-image='true']" },
      { tag: "section[data-story-gallery='true']" },
      { tag: "figure[data-story-video='true']" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "story-media",
      mergeAttributes(HTMLAttributes, {
        "data-story-media-node": "true",
      }),
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const template = document.createElement("template");
      template.innerHTML = String(node.attrs.html ?? "").trim();

      const dom =
        (template.content.firstElementChild as HTMLElement | null) ??
        document.createElement("div");

      dom.contentEditable = "false";
      dom.draggable = true;
      dom.dataset.storyTiptapMedia = "true";
      const mobileQuery = window.matchMedia(STORY_MOBILE_MEDIA_QUERY);
      const refreshComposition = () => {
        // Mounted artboards own responsive updates. The fallback covers standalone nodes.
        if (!dom.closest("[data-story-artboard-mode]")) {
          installIndependentCompositions(dom, storyLayoutIsMobile(dom));
        }
      };
      refreshComposition();
      mobileQuery.addEventListener("change", refreshComposition);

      const openEditor = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const position = getPos();

        if (typeof position !== "number") {
          return;
        }

        editor.commands.setNodeSelection(position);

        dom.dispatchEvent(
          new CustomEvent<StoryMediaEditDetail>(
            STORY_MEDIA_EDIT_EVENT,
            {
              bubbles: true,
              detail: {
                position,
                html: String(node.attrs.html ?? ""),
                element: dom,
              },
            },
          ),
        );
      };

      dom.addEventListener("click", openEditor);

      return {
        dom,
        update(updatedNode) {
          return (
            updatedNode.type === node.type &&
            updatedNode.attrs.html === node.attrs.html
          );
        },
        ignoreMutation: () => true,
        destroy() {
          mobileQuery.removeEventListener("change", refreshComposition);
          dom.removeEventListener("click", openEditor);
        },
      };
    };
  },
});

export function normalizeLegacyStoryHtml(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;

  function boundedNumber(
    value: string | null | undefined,
    fallback: number,
    minimum: number,
    maximum: number,
  ) {
    const parsed = Number(value);
    return Math.max(
      minimum,
      Math.min(maximum, Number.isFinite(parsed) ? parsed : fallback),
    );
  }

  function compactNumber(value: number) {
    return String(Math.round(value * 1000) / 1000);
  }

  function migrateGalleryToIndependentCoordinates(gallery: HTMLElement) {
    if (gallery.dataset.storyCoordinates === "independent") return;

    const compositionWidth = boundedNumber(
      gallery.dataset.compositionWidth,
      100,
      40,
      100,
    );
    const figures = Array.from(
      gallery.querySelectorAll<HTMLElement>(
        ':scope > figure[data-story-image="true"]',
      ),
    );
    const compositionHeight = boundedNumber(
      gallery.dataset.compositionHeight ?? gallery.dataset.canvasHeight,
      Math.max(
        120,
        ...figures.map((figure) => {
          const y = boundedNumber(figure.dataset.y, 0, 0, 10000);
          const height = boundedNumber(
            figure.dataset.height,
            320,
            120,
            10000,
          );
          return y + height;
        }),
      ),
      120,
      STORY_MAX_FRAME_HEIGHT,
    );

    for (const figure of figures) {
      // Legacy galleries stored horizontal geometry as percentages of the
      // frame. The independent model stores it on the shared 1000-unit
      // canvas, so convert it once before installing the new renderer.
      const legacyWidth = boundedNumber(figure.dataset.width, 100, 12, 100);
      const legacyX = boundedNumber(figure.dataset.x, 0, 0, 100);
      figure.dataset.width = compactNumber(
        (legacyWidth * compositionWidth) / 100,
      );
      figure.dataset.x = compactNumber((legacyX * compositionWidth) / 100);
    }

    gallery.dataset.storyComposition = "true";
    gallery.dataset.storyCoordinates = "independent";
    gallery.dataset.spatialLayout = "true";
    gallery.dataset.compositionWidth = compactNumber(compositionWidth);
    gallery.dataset.compositionHeight = compactNumber(compositionHeight);
    gallery.dataset.canvasHeight = compactNumber(compositionHeight);
  }

  const fontSizes: Record<string, string> = {
    "1": "11px",
    "2": "13px",
    "3": "15px",
    "4": "18px",
    "5": "22px",
    "6": "28px",
    "7": "34px",
  };

  for (const font of Array.from(
    container.querySelectorAll("font"),
  )) {
    const span = document.createElement("span");
    const family = font.getAttribute("face");
    const size = font.getAttribute("size");

    if (family) {
      span.style.fontFamily = family;
    }

    if (size && fontSizes[size]) {
      span.style.fontSize = fontSizes[size];
    }

    while (font.firstChild) {
      span.appendChild(font.firstChild);
    }

    font.replaceWith(span);
  }

  const items = Array.from(
    container.querySelectorAll("li"),
  ).reverse();

  for (const item of items) {
    const blocks: HTMLElement[] = [];
    const nestedLists: HTMLElement[] = [];
    let inlineParagraph: HTMLParagraphElement | null = null;

    const flushInlineParagraph = () => {
      if (!inlineParagraph) return;

      if (
        inlineParagraph.textContent?.trim() ||
        inlineParagraph.querySelector("br")
      ) {
        blocks.push(inlineParagraph);
      }

      inlineParagraph = null;
    };

    for (const child of Array.from(item.childNodes)) {
      if (
        child instanceof HTMLElement &&
        child.matches("p, h2, h3, blockquote")
      ) {
        flushInlineParagraph();
        blocks.push(child);
        continue;
      }

      if (
        child instanceof HTMLElement &&
        child.matches("ul, ol")
      ) {
        flushInlineParagraph();
        nestedLists.push(child);
        continue;
      }

      if (
        child.nodeType === globalThis.Node.TEXT_NODE &&
        !child.textContent?.trim()
      ) {
        child.remove();
        continue;
      }

      inlineParagraph ??= document.createElement("p");
      inlineParagraph.appendChild(child);
    }

    flushInlineParagraph();

    if (!blocks.length) {
      const paragraph = document.createElement("p");
      paragraph.appendChild(document.createElement("br"));
      blocks.push(paragraph);
    }

    item.replaceChildren(blocks[0]);

    let lastItem = item;

    for (const block of blocks.slice(1)) {
      const nextItem = item.cloneNode(false) as HTMLLIElement;
      nextItem.appendChild(block);
      lastItem.after(nextItem);
      lastItem = nextItem;
    }

    for (const nestedList of nestedLists) {
      lastItem.appendChild(nestedList);
    }
  }

  const storyGalleries = Array.from(
    container.querySelectorAll<HTMLElement>(
      'section[data-story-gallery="true"]',
    ),
  );

  for (const gallery of storyGalleries) {
    // Keep the frame for every composition, including one-photo blocks.
    // Flattening a single gallery into a figure discarded FRAME width and
    // made the editor render PHOTO width against the whole article instead.
    migrateGalleryToIndependentCoordinates(gallery);
  }

  // Previous editor versions already persisted some single-photo galleries
  // as standalone figures. Give those blocks a real frame again so the next
  // edit/save round-trip cannot confuse PHOTO width with FRAME width.
  const standaloneFigures = Array.from(
    container.querySelectorAll<HTMLElement>(
      'figure.story-media[data-story-image="true"]',
    ),
  ).filter(
    (figure) =>
      !figure.closest('[data-story-gallery="true"]') &&
      !figure.closest('[data-story-text-media="true"]'),
  );

  for (const figure of standaloneFigures) {
    const storedWidth = boundedNumber(
      figure.dataset.width ?? figure.style.width,
      100,
      12,
      100,
    );
    const frameWidth = Math.max(40, storedWidth);
    const height = boundedNumber(figure.dataset.height, 320, 120, 1200);
    const alignment = figure.classList.contains("story-media-left")
      ? "left"
      : figure.classList.contains("story-media-right")
        ? "right"
        : figure.classList.contains("story-media-full")
          ? "full"
          : "center";
    const x =
      alignment === "right"
        ? frameWidth - storedWidth
        : alignment === "center"
          ? (frameWidth - storedWidth) / 2
          : 0;
    const size = figure.classList.contains("story-media-small")
      ? "small"
      : figure.classList.contains("story-media-large")
        ? "large"
        : "medium";
    const widthClass = Math.max(
      20,
      Math.min(100, Math.round(storedWidth / 5) * 5),
    );
    const gallery = document.createElement("section");

    gallery.contentEditable = "false";
    gallery.tabIndex = 0;
    gallery.draggable = true;
    gallery.dataset.storyGallery = "true";
    gallery.dataset.storyComposition = "true";
    gallery.dataset.storyCoordinates = "independent";
    gallery.dataset.spatialLayout = "true";
    gallery.dataset.alignment = alignment;
    gallery.dataset.layout = "grid";
    gallery.dataset.size = size;
    gallery.dataset.count = "1";
    gallery.dataset.compositionWidth = compactNumber(frameWidth);
    gallery.dataset.compositionHeight = compactNumber(height);
    gallery.dataset.canvasHeight = compactNumber(height);
    gallery.dataset.photoGap = "0";
    gallery.dataset.cornerRadius = "16";
    gallery.className = `story-gallery story-gallery-grid story-gallery-${size}`;

    figure.dataset.width = compactNumber(storedWidth);
    figure.dataset.x = compactNumber(x);
    figure.dataset.y = "0";
    figure.dataset.height = compactNumber(height);
    figure.dataset.storyImageIndex = "0";
    figure.className = `story-gallery-item story-media-width-${widthClass}`;
    figure.before(gallery);
    gallery.appendChild(figure);
  }

  return container.innerHTML;
}

export function serializeStoryHtml(editor: Editor) {
  const container = document.createElement("div");
  container.innerHTML = editor.getHTML();

  for (const placeholder of Array.from(
    container.querySelectorAll("story-media[data-html]"),
  )) {
    const html = placeholder.getAttribute("data-html") ?? "";
    const template = document.createElement("template");
    template.innerHTML = html.trim();

    const media = template.content.firstElementChild;

    if (media) {
      placeholder.replaceWith(media);
    } else {
      placeholder.remove();
    }
  }

  return container.innerHTML;
}
