import sanitizeHtml from "sanitize-html";

const SIDE_TEXT_BLOCK = /^\s*<(?:p|ul|ol)(?:\s|>)/i;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function plainTextToHtml(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

/**
 * Side text used to be stored as plain text. New values are small rich-text
 * documents, so normalize both formats at every storage boundary.
 */
export function normalizeStorySideTextHtml(value: string | null | undefined) {
  const source = value ?? "";
  if (!source.trim()) return "";

  const html = SIDE_TEXT_BLOCK.test(source)
    ? source
    : plainTextToHtml(source);

  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "ul", "ol", "li", "a"],
    allowedAttributes: {
      p: ["style"],
      a: ["href", "target", "rel"],
    },
    allowedStyles: {
      p: {
        "text-align": [/^(?:left|center|right|justify)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
  });
}

export function storySideTextHasContent(value: string | null | undefined) {
  const text = sanitizeHtml(normalizeStorySideTextHtml(value), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replaceAll("&nbsp;", " ")
    .replaceAll("&#160;", " ")
    .replaceAll("\u00a0", " ");

  return text.trim().length > 0;
}
