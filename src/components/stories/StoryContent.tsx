import type { ReactNode } from "react";
import { sanitizeStoryHtml } from "./sanitizeStoryHtml";
import styles from "@/components/stories/StoryContent.module.css";
import { StoryArtboard } from "@/components/stories/StoryArtboard";
import { StoryRichHtml } from "@/components/stories/StoryRichHtml";
import {
  defaultStoryTypographySettings,
  getStoryTypographyVariables,
  type StoryTypographySettings,
} from "@/lib/content/storyTypography";

const STORY_HTML_MARKER = "STORY_HTML_V1";

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

type StoryBlock =
  | {
      type: "heading";
      level: 2 | 3;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    };

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < text.length) {
    if (text.startsWith("**", index)) {
      const end = text.indexOf("**", index + 2);

      if (end !== -1) {
        nodes.push(
          <strong key={key++} className="font-semibold text-[#242617]">
            {text.slice(index + 2, end)}
          </strong>,
        );
        index = end + 2;
        continue;
      }
    }

    if (text[index] === "*") {
      const end = text.indexOf("*", index + 1);

      if (end !== -1) {
        nodes.push(
          <em key={key++} className="italic text-[#242617]/80">
            {text.slice(index + 1, end)}
          </em>,
        );
        index = end + 1;
        continue;
      }
    }

    const nextBold = text.indexOf("**", index);
    const nextItalic = text.indexOf("*", index);
    const nextMarkers = [nextBold, nextItalic].filter((value) => value !== -1);
    const nextIndex = nextMarkers.length ? Math.min(...nextMarkers) : text.length;

    nodes.push(text.slice(index, nextIndex));
    index = nextIndex;
  }

  return nodes;
}

function parseStoryContent(content: string): StoryBlock[] {
  const blocks: StoryBlock[] = [];
  const paragraphLines: string[] = [];

  function flushParagraph() {
    if (!paragraphLines.length) return;

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });

    paragraphLines.length = 0;
  }

  for (const line of content.replace(/\r\n/g, "\n").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const heading =
      /^(?:(?:Title|Subtitle):\s*)?(#{2,3})\s+(.+)$/i.exec(
        trimmed,
      );

    if (heading) {
      flushParagraph();

      blocks.push({
        type: "heading",
        level: heading[1].length as 2 | 3,
        text: heading[2],
      });

      continue;
    }

    paragraphLines.push(trimmed);
  }

  flushParagraph();

  return blocks;
}


export function StoryContent({
  content,
  typography = defaultStoryTypographySettings,
}: {
  content: string;
  typography?: StoryTypographySettings;
}) {
  const typographyStyle = getStoryTypographyVariables(typography);
  const richHtml = extractStoryHtml(content);

  if (richHtml !== null) {
    const html = sanitizeStoryHtml(richHtml);

    return (
      <div className={styles.viewport}>
        <StoryArtboard>
          <StoryRichHtml
            html={html}
            className={`${styles.content} ${styles.canvas}`}
            style={typographyStyle}
          />
        </StoryArtboard>
      </div>
    );
  }
  const blocks = parseStoryContent(content);

  return (
    <div className={styles.viewport}>
      <StoryArtboard>
        <div
          className={`${styles.content} ${styles.canvas}`}
          style={typographyStyle}
        >
          {blocks.map((block, index) => {
            if (block.type === "heading") {
              const className =
                block.level === 2
                  ? "pt-5 font-serif text-3xl leading-tight text-[#242617] md:text-4xl"
                  : "pt-3 font-serif text-2xl leading-tight text-[#242617] md:text-3xl";

              if (block.level === 2) {
                return (
                  <h2 key={`${block.text}-${index}`} className={className}>
                    {renderInlineMarkdown(block.text)}
                  </h2>
                );
              }

              return (
                <h3 key={`${block.text}-${index}`} className={className}>
                  {renderInlineMarkdown(block.text)}
                </h3>
              );
            }

            return (
              <p key={`${block.text}-${index}`}>
                {renderInlineMarkdown(block.text)}
              </p>
            );
          })}
        </div>
      </StoryArtboard>
    </div>
  );
}
