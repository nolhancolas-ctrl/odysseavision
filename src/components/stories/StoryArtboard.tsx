"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import styles from "./StoryContent.module.css";
import {
  STORY_ARTBOARD_CONTENT_EVENT,
  STORY_DESKTOP_ARTBOARD_WIDTH,
  STORY_MOBILE_ARTBOARD_WIDTH,
  STORY_MOBILE_MEDIA_QUERY,
  type StoryArtboardMode,
} from "./storyComposition";
import { installSpatialLayouts } from "./storySpatialLayout";

type ReadingAnchor = {
  element: HTMLElement;
  fraction: number;
  viewportY: number;
};

function captureReadingAnchor(canvas: HTMLElement): ReadingAnchor | null {
  const root = canvas.querySelector(".story-tiptap-document") ?? canvas.firstElementChild;
  if (!root) return null;
  const readingLine = Math.min(120, window.innerHeight / 5);
  for (const element of Array.from(root.children)) {
    if (!(element instanceof HTMLElement)) continue;
    const rect = element.getBoundingClientRect();
    if (rect.height <= 0 || rect.bottom <= readingLine || rect.top >= window.innerHeight) continue;
    const viewportY = Math.max(readingLine, rect.top);
    return { element, viewportY, fraction: (viewportY - rect.top) / rect.height };
  }
  return null;
}

/**
 * The only owner of Story responsive mode and scale.
 * Commit mode -> arrange media -> measure height -> restore the reading point.
 * Save data and React's media HTML are never rewritten during a viewport change.
 */
export function StoryArtboard({
  children,
  mode = "auto",
}: {
  children: ReactNode;
  mode?: StoryArtboardMode;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !stage || !canvas) return;

    const query = window.matchMedia(STORY_MOBILE_MEDIA_QUERY);
    let frame = 0;
    let disposed = false;
    let appliedMode: "desktop" | "mobile" | null = null;
    let readingAnchor: ReadingAnchor | null = null;
    let contentDirty = true;

    const resolveMode = () =>
      mode === "mobile" || (mode === "auto" && query.matches) ? "mobile" : "desktop";

    const rememberReadingPoint = () => {
      // A resize can emit scroll events before our layout transaction.
      // Keep the last stable point, not coordinates from the intermediate layout.
      if (!frame && appliedMode === resolveMode()) {
        readingAnchor = captureReadingAnchor(canvas);
      }
    };

    const update = () => {
      frame = 0;
      if (disposed) return;
      const nextMode = resolveMode();
      const changed = appliedMode !== null && appliedMode !== nextMode;
      const anchor = mode === "auto" && changed ? readingAnchor : null;
      const width = nextMode === "mobile"
        ? STORY_MOBILE_ARTBOARD_WIDTH : STORY_DESKTOP_ARTBOARD_WIDTH;
      const scale = Math.min(nextMode === "mobile" ? 1.1 : 1.2, Math.max(1, viewport.clientWidth) / width);

      canvas.dataset.storyArtboardResolved = nextMode;
      canvas.style.width = width + "px";
      canvas.style.transform = "scale(" + scale + ")";
      if (contentDirty || appliedMode !== nextMode) {
        // Ignore mutations made by our renderer; observe only subsequent content changes.
        mutations.disconnect();
        installSpatialLayouts(canvas);
        mutations.observe(canvas, { childList: true, subtree: true });
        contentDirty = false;
      }
      stage.style.width = width * scale + "px";
      stage.style.height = Math.ceil(canvas.scrollHeight * scale) + "px";
      appliedMode = nextMode;

      if (anchor?.element.isConnected && canvas.contains(anchor.element)) {
        const rect = anchor.element.getBoundingClientRect();
        const offset = rect.top + anchor.fraction * rect.height - anchor.viewportY;
        if (Number.isFinite(offset) && Math.abs(offset) > 0.5) {
          window.scrollBy({ top: offset, left: 0, behavior: "instant" });
        }
      }
      readingAnchor = captureReadingAnchor(canvas);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const contentChanged = () => {
      contentDirty = true;
      schedule();
    };
    const mutations = new MutationObserver(contentChanged);
    const sizes = new ResizeObserver(schedule);
    sizes.observe(viewport);
    sizes.observe(canvas);
    query.addEventListener("change", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", rememberReadingPoint, { passive: true });
    canvas.addEventListener(STORY_ARTBOARD_CONTENT_EVENT, contentChanged);
    canvas.addEventListener("load", schedule, true);
    update();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      mutations.disconnect();
      sizes.disconnect();
      query.removeEventListener("change", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", rememberReadingPoint);
      canvas.removeEventListener(STORY_ARTBOARD_CONTENT_EVENT, contentChanged);
      canvas.removeEventListener("load", schedule, true);
    };
  }, [mode]);

  return (
    <div ref={viewportRef} className={styles.artboardViewport}>
      <div ref={stageRef} className={styles.artboardStage}>
        <div
          ref={canvasRef}
          className={styles.artboardCanvas}
          data-story-artboard-mode={mode}
          data-story-artboard-resolved={mode === "mobile" ? "mobile" : "desktop"}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
