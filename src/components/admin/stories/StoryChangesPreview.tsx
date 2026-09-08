"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export type StoryChangeSnapshot = {
  title: string;
  slug: string;
  excerpt: string;
  articleIntro: string;
  date: string;
  readTime: string;
  status: string;
  category: string;
  imageSrc: string;
  content: string;
};

type DiffKind = "unchanged" | "added" | "removed";

type ContentBlock = {
  type: string;
  text: string;
};

type DiffSegment = {
  text: string;
  kind: DiffKind;
};

type DiffBlock = ContentBlock & {
  kind: DiffKind;
  segments?: DiffSegment[];
};

type StoryImage = {
  src: string;
  alt: string;
};

function extractHtml(content: string) {
  return content
    .replace(/^\uFEFF/, "")
    .replace(/^STORY_HTML_V1\s*/, "");
}

function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractBlocks(content: string): ContentBlock[] {
  if (!content || typeof DOMParser === "undefined") {
    return [];
  }

  const document = new DOMParser().parseFromString(
    extractHtml(content),
    "text/html",
  );

  const blocks: ContentBlock[] = [];

  for (const element of Array.from(document.body.children)) {
    const tag = element.tagName.toLowerCase();

    if (element.matches("figure, section")) {
      continue;
    }

    if (element.matches("ul, ol")) {
      const ordered = tag === "ol";

      Array.from(element.children).forEach(
        (item, index) => {
          const text = normalizeText(item.textContent);

          if (text) {
            blocks.push({
              type: ordered ? `${index + 1}.` : "•",
              text,
            });
          }
        },
      );

      continue;
    }

    const text = normalizeText(element.textContent);

    if (text) {
      blocks.push({
        type: tag,
        text,
      });
    }
  }

  return blocks;
}

function diffWords(
  before: string,
  after: string,
): DiffSegment[] {
  const beforeWords = normalizeText(before)
    .split(" ")
    .filter(Boolean);
  const afterWords = normalizeText(after)
    .split(" ")
    .filter(Boolean);

  const rows = beforeWords.length;
  const columns = afterWords.length;

  const matrix = Array.from(
    { length: rows + 1 },
    () => Array<number>(columns + 1).fill(0),
  );

  for (let row = rows - 1; row >= 0; row -= 1) {
    for (
      let column = columns - 1;
      column >= 0;
      column -= 1
    ) {
      matrix[row][column] =
        beforeWords[row] === afterWords[column]
          ? matrix[row + 1][column + 1] + 1
          : Math.max(
              matrix[row + 1][column],
              matrix[row][column + 1],
            );
    }
  }

  const segments: DiffSegment[] = [];

  function append(kind: DiffKind, word: string) {
    const previous = segments.at(-1);

    if (previous?.kind === kind) {
      previous.text += ` ${word}`;
      return;
    }

    segments.push({
      kind,
      text: word,
    });
  }

  let row = 0;
  let column = 0;

  while (row < rows && column < columns) {
    if (beforeWords[row] === afterWords[column]) {
      append("unchanged", afterWords[column]);
      row += 1;
      column += 1;
      continue;
    }

    if (
      matrix[row + 1][column] >=
      matrix[row][column + 1]
    ) {
      append("removed", beforeWords[row]);
      row += 1;
    } else {
      append("added", afterWords[column]);
      column += 1;
    }
  }

  while (row < rows) {
    append("removed", beforeWords[row]);
    row += 1;
  }

  while (column < columns) {
    append("added", afterWords[column]);
    column += 1;
  }

  return segments;
}

function InlineDiff({
  segments,
}: {
  segments: DiffSegment[];
}) {
  return (
    <>
      {segments.map((segment, index) => (
        <span key={`${segment.kind}-${index}`}>
          {index > 0 ? " " : null}
          <span
            className={
              segment.kind === "added"
                ? "rounded-sm bg-emerald-500/20 px-0.5 text-emerald-950"
                : segment.kind === "removed"
                  ? "rounded-sm bg-red-500/15 px-0.5 text-red-950 line-through decoration-red-700/70 decoration-2"
                  : undefined
            }
          >
            {segment.text}
          </span>
        </span>
      ))}
    </>
  );
}

function diffBlocks(
  before: ContentBlock[],
  after: ContentBlock[],
): DiffBlock[] {
  const rows = before.length;
  const columns = after.length;

  const matrix = Array.from(
    { length: rows + 1 },
    () => Array<number>(columns + 1).fill(0),
  );

  for (let row = 0; row <= rows; row += 1) {
    matrix[row][columns] = rows - row;
  }

  for (
    let column = 0;
    column <= columns;
    column += 1
  ) {
    matrix[rows][column] = columns - column;
  }

  const key = (block: ContentBlock) =>
    `${block.type}:${block.text}`;

  for (let row = rows - 1; row >= 0; row -= 1) {
    for (
      let column = columns - 1;
      column >= 0;
      column -= 1
    ) {
      if (key(before[row]) === key(after[column])) {
        matrix[row][column] =
          matrix[row + 1][column + 1];
        continue;
      }

      const modification =
        before[row].type === after[column].type
          ? matrix[row + 1][column + 1] + 1
          : Number.POSITIVE_INFINITY;

      matrix[row][column] = Math.min(
        modification,
        matrix[row + 1][column] + 1,
        matrix[row][column + 1] + 1,
      );
    }
  }

  const changes: DiffBlock[] = [];
  let row = 0;
  let column = 0;

  while (row < rows && column < columns) {
    if (key(before[row]) === key(after[column])) {
      changes.push({
        ...after[column],
        kind: "unchanged",
      });
      row += 1;
      column += 1;
      continue;
    }

    const modification =
      before[row].type === after[column].type
        ? matrix[row + 1][column + 1] + 1
        : Number.POSITIVE_INFINITY;

    if (matrix[row][column] === modification) {
      changes.push({
        ...after[column],
        kind: "unchanged",
        segments: diffWords(
          before[row].text,
          after[column].text,
        ),
      });
      row += 1;
      column += 1;
      continue;
    }

    if (
      matrix[row + 1][column] <=
      matrix[row][column + 1]
    ) {
      changes.push({
        ...before[row],
        kind: "removed",
      });
      row += 1;
    } else {
      changes.push({
        ...after[column],
        kind: "added",
      });
      column += 1;
    }
  }

  while (row < rows) {
    changes.push({
      ...before[row],
      kind: "removed",
    });
    row += 1;
  }

  while (column < columns) {
    changes.push({
      ...after[column],
      kind: "added",
    });
    column += 1;
  }

  return changes;
}

function extractImages(content: string): StoryImage[] {
  if (!content || typeof DOMParser === "undefined") {
    return [];
  }

  const document = new DOMParser().parseFromString(
    extractHtml(content),
    "text/html",
  );

  return Array.from(document.querySelectorAll("img"))
    .map((image) => ({
      src: image.getAttribute("src") ?? "",
      alt: image.getAttribute("alt") ?? "",
    }))
    .filter((image) => Boolean(image.src));
}

function imageKey(image: StoryImage) {
  return image.src.trim();
}

function diffImages(
  before: StoryImage[],
  after: StoryImage[],
) {
  const beforeKeys = new Set(before.map(imageKey));
  const afterKeys = new Set(after.map(imageKey));

  return [
    ...before.map((image) => ({
      ...image,
      kind: afterKeys.has(imageKey(image))
        ? ("unchanged" as const)
        : ("removed" as const),
    })),
    ...after
      .filter(
        (image) => !beforeKeys.has(imageKey(image)),
      )
      .map((image) => ({
        ...image,
        kind: "added" as const,
      })),
  ];
}

function changeClasses(kind: DiffKind) {
  if (kind === "added") {
    return "border-emerald-700/25 bg-emerald-500/12 text-emerald-950";
  }

  if (kind === "removed") {
    return "border-red-800/25 bg-red-500/10 text-red-950 line-through decoration-red-700/55";
  }

  return "border-[#242617]/8 bg-white/35 text-[#242617]/72";
}

function ChangeLabel({ kind }: { kind: DiffKind }) {
  if (kind === "unchanged") return null;

  return (
    <span
      className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${
        kind === "added"
          ? "bg-emerald-700 text-white"
          : "bg-red-800 text-white"
      }`}
    >
      {kind}
    </span>
  );
}

export function StoryChangesPreview({
  published,
  current,
  onClose,
}: {
  published: StoryChangeSnapshot;
  current: StoryChangeSnapshot;
  onClose: () => void;
}) {
  useEffect(() => {
    function closeComparisonOnEscape(
      event: KeyboardEvent,
    ) {
      if (event.key !== "Escape") return;

      event.preventDefault();
      onClose();
    }

    document.addEventListener(
      "keydown",
      closeComparisonOnEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        closeComparisonOnEscape,
      );
    };
  }, [onClose]);

  const metadata = [
    ["Title", published.title, current.title],
    ["Slug", published.slug, current.slug],
    ["Excerpt", published.excerpt, current.excerpt],
    [
      "Article introduction",
      published.articleIntro,
      current.articleIntro,
    ],
    ["Date", published.date, current.date],
    ["Read time", published.readTime, current.readTime],
    ["Status", published.status, current.status],
    ["Category", published.category, current.category],
  ];

  const contentChanges = diffBlocks(
    extractBlocks(published.content),
    extractBlocks(current.content),
  );

  const beforeImages = [
    ...(published.imageSrc
      ? [
          {
            src: published.imageSrc,
            alt: "Published cover",
          },
        ]
      : []),
    ...extractImages(published.content),
  ];

  const afterImages = [
    ...(current.imageSrc
      ? [
          {
            src: current.imageSrc,
            alt: "Current cover",
          },
        ]
      : []),
    ...extractImages(current.content),
  ];

  const imageChanges = diffImages(
    beforeImages,
    afterImages,
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    (
    <div className="fixed inset-0 z-[230] overflow-y-auto bg-[#071321]/60 p-4 backdrop-blur-sm sm:p-7">
      <section className="mx-auto w-full max-w-5xl rounded-[2rem] border border-[#d5ad68]/30 bg-[#f4efe4] p-5 shadow-[0_30px_100px_rgba(7,19,33,0.4)] sm:p-8">
        <header className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
              Story comparison
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#071321]">
              View changes
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close changes preview"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg bg-[#071321] text-xl text-white"
          >
            ×
          </button>
        </header>

        <div className="mt-8 grid gap-8">
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/45">
              Story information
            </h3>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {metadata.map(([label, before, after]) => {
                const unchanged = before === after;

                return (
                  <article
                    key={label}
                    className="rounded-2xl border border-[#242617]/10 bg-white/25 p-4"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#242617]/38">
                      {label}
                    </p>

                    <div className="mt-2 rounded-lg border border-[#242617]/8 bg-white/35 p-3 text-sm leading-6 text-[#242617]/72">
                      {unchanged ? (
                        after || "Empty"
                      ) : (
                        <InlineDiff
                          segments={diffWords(
                            before || "Empty",
                            after || "Empty",
                          )}
                        />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {imageChanges.length ? (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/45">
                Images
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {imageChanges.map((image, index) => (
                  <figure
                    key={`${imageKey(image)}-${index}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#242617]/10 bg-[#e8dfcf]"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover"
                    />

                    {image.kind !== "unchanged" ? (
                      <div
                        className={`absolute inset-0 ${
                          image.kind === "added"
                            ? "bg-emerald-500/40"
                            : "bg-red-600/40"
                        }`}
                      />
                    ) : null}

                    <div className="absolute bottom-2 left-2">
                      <ChangeLabel kind={image.kind} />
                    </div>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/45">
              Article content
            </h3>

            <div className="mt-3 grid gap-2">
              {contentChanges.length ? (
                contentChanges.map((block, index) => (
                  <article
                    key={`${block.type}-${index}`}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${changeClasses(block.kind)}`}
                  >
                    <span className="mt-1 min-w-7 text-[9px] font-bold uppercase tracking-[0.12em] opacity-45">
                      {block.type}
                    </span>

                    <p className="min-w-0 flex-1 text-sm leading-6">
                      {block.segments ? (
                        <InlineDiff
                          segments={block.segments}
                        />
                      ) : (
                        block.text
                      )}
                    </p>

                    <ChangeLabel kind={block.kind} />
                  </article>
                ))
              ) : (
                <p className="rounded-xl border border-[#242617]/10 bg-white/30 p-4 text-sm text-[#242617]/45">
                  No article content.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
    ),
    document.body,
  );
}
