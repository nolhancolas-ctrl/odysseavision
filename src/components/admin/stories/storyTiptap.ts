import {
  Extension,
  Node as TiptapNode,
  mergeAttributes,
  type Editor,
} from "@tiptap/core";
import { ListItem } from "@tiptap/extension-list";
import { installIndependentCompositions } from "@/components/stories/storyComposition";

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
      const mobileQuery = window.matchMedia("(max-width: 767px)");
      const refreshComposition = () => installIndependentCompositions(dom, mobileQuery.matches);
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
    // Independent frames must survive even when they contain a single photo.
    if (gallery.dataset.storyCoordinates === "independent") continue;
    const figures = Array.from(
      gallery.querySelectorAll<HTMLElement>(
        ':scope > figure[data-story-image="true"]',
      ),
    );

    for (const figure of figures) {
      for (const property of [
        "position",
        "left",
        "top",
        "width",
        "height",
        "padding",
        "margin",
        "max-width",
        "display",
      ]) {
        const value = figure.style.getPropertyValue(property);

        if (value) {
          figure.style.setProperty(property, value);
        }
      }

      const image = figure.querySelector<HTMLElement>(":scope > img");

      if (!image) continue;

      for (const property of [
        "width",
        "height",
        "min-height",
        "max-height",
        "flex",
        "object-fit",
        "object-position",
        "transform",
        "transform-origin",
      ]) {
        const value = image.style.getPropertyValue(property);

        if (value) {
          image.style.setProperty(property, value);
        }
      }
    }

    if (figures.length !== 1) continue;

    const figure = figures[0];
    const parsedWidth = Number(figure.dataset.width);
    const width = Number.isFinite(parsedWidth)
      ? Math.max(12, Math.min(100, parsedWidth))
      : 100;
    const parsedX = Number(figure.dataset.x);
    const x = Number.isFinite(parsedX)
      ? Math.max(0, Math.min(100, parsedX))
      : (100 - width) / 2;
    const parsedHeight = Number(figure.dataset.height);
    const height = Number.isFinite(parsedHeight)
      ? Math.max(120, Math.min(10000, parsedHeight))
      : 320;
    const alignment =
      width >= 99
        ? "full"
        : x <= 1
          ? "left"
          : x + width >= 99
            ? "right"
            : "center";
    const size =
      gallery.dataset.size === "small"
        ? "small"
        : gallery.dataset.size === "large"
          ? "large"
          : "medium";
    const widthClass = Math.max(
      20,
      Math.min(100, Math.round(width / 5) * 5),
    );

    figure.className =
      `story-media story-media-${alignment} ` +
      `story-media-${size} story-media-width-${widthClass}`;
    figure.removeAttribute("data-story-image-index");
    figure.style.setProperty("position", "relative");
    figure.style.removeProperty("left");
    figure.style.removeProperty("top");
    figure.style.setProperty("width", `${width}%`);
    figure.style.setProperty("max-width", `${width}%`);
    figure.style.setProperty("height", `${height}px`);
    figure.style.setProperty("padding", "0");
    figure.style.removeProperty("margin");

    gallery.replaceWith(figure);
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
