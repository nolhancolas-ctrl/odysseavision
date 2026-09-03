"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  closestCenter,
  pointerWithin,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arraySwap,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

export type StoryWatermark = "NONE" | "ANDREW" | "MORGANE";
export type StoryImageAlignment = "left" | "center" | "full" | "right";
export type StoryImageSize = "small" | "medium" | "large";
export type StoryGalleryLayout = "row" | "grid" | "mosaic" | "stack";

export type StoryMediaItem = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  watermark: StoryWatermark;
  width: number;
  x?: number;
  y?: number;
  height?: number;
  cropX?: number;
  cropY?: number;
  cropZoom?: number;
};

export type StoryMediaDraft = {
  items: StoryMediaItem[];
  alignment: StoryImageAlignment;
  size: StoryImageSize;
  layout: StoryGalleryLayout;
  compositionWidth: number;
  photoGap: number;
  cornerRadius: number;
};

type Props = {
  initialDraft: StoryMediaDraft;
  editing: boolean;
  uploadSlug: string;
  existingImageUrls: string[];
  onCancel: () => void;
  onRemove?: () => void;
  onSave: (draft: StoryMediaDraft) => void;
};

type UploadResult = {
  ok?: boolean;
  error?: string;
  message?: string;
  path?: string;
  src?: string;
  url?: string;
};

export function createEmptyStoryMediaDraft(): StoryMediaDraft {
  return {
    items: [],
    alignment: "center",
    size: "medium",
    layout: "grid",
    compositionWidth: 100,
    photoGap: 12,
    cornerRadius: 16,
  };
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function titleFromFile(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

function clampWidth(value: number) {
  return Math.max(
    12,
    Math.min(100, Math.round(value * 10) / 10),
  );
}

function optionClass(active: boolean) {
  return `cursor-pointer rounded-xl border px-3 py-3 text-[10px] font-bold uppercase tracking-[0.14em] transition ${
    active
      ? "border-[#071321] bg-[#071321] text-white"
      : "border-[#242617]/12 bg-[#f4efe4]/75 text-[#242617]/55 hover:border-[#b88a3b]/65"
  }`;
}

function clampPosition(value: number, maximum: number) {
  return Math.max(0, Math.min(maximum, Math.round(value * 10) / 10));
}

function normalizeMediaItem(item: StoryMediaItem) {
  return {
    ...item,
    width: clampWidth(item.width || 100),
    x: item.x ?? 0,
    y: Math.max(0, item.y ?? 0),
    height: Math.max(120, item.height ?? 320),
    cropX: item.cropX ?? 50,
    cropY: item.cropY ?? 50,
    cropZoom: Math.max(1, Math.min(2.5, item.cropZoom ?? 1)),
  };
}

function rectanglesOverlap(
  first: StoryMediaItem,
  second: StoryMediaItem,
) {
  const gapX = 0;
  const gapY = 0;

  const firstX = first.x ?? 0;
  const firstY = first.y ?? 0;
  const firstHeight = first.height ?? 320;
  const secondX = second.x ?? 0;
  const secondY = second.y ?? 0;
  const secondHeight = second.height ?? 320;

  return (
    firstX < secondX + second.width + gapX &&
    firstX + first.width + gapX > secondX &&
    firstY < secondY + secondHeight + gapY &&
    firstY + firstHeight + gapY > secondY
  );
}


function compositionHasOverlaps(
  sourceItems: StoryMediaItem[],
) {
  const items = sourceItems.map(normalizeMediaItem);

  for (let firstIndex = 0; firstIndex < items.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < items.length;
      secondIndex += 1
    ) {
      if (
        rectanglesOverlap(
          items[firstIndex],
          items[secondIndex],
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

function reflowCompositionRows(
  sourceItems: StoryMediaItem[],
) {
  if (sourceItems.length === 0) return [];

  const gapX = 0;
  const gapY = 0;

  const orderedItems = sourceItems
    .map((item, index) => ({
      item: normalizeMediaItem(item),
      index,
    }))
    .sort((first, second) => {
      const firstY = first.item.y ?? 0;
      const secondY = second.item.y ?? 0;

      if (Math.abs(firstY - secondY) > 24) {
        return firstY - secondY;
      }

      const firstX = first.item.x ?? 0;
      const secondX = second.item.x ?? 0;

      return firstX - secondX || first.index - second.index;
    })
    .map(({ item }) => ({
      ...item,
      width: clampWidth(item.width),
    }));

  const rows: StoryMediaItem[][] = [];
  let currentRow: StoryMediaItem[] = [];
  let currentWidth = 0;

  for (const item of orderedItems) {
    const requiredWidth =
      currentRow.length === 0
        ? item.width
        : currentWidth + gapX + item.width;

    if (currentRow.length > 0 && requiredWidth > 100) {
      rows.push(currentRow);
      currentRow = [];
      currentWidth = 0;
    }

    currentRow.push(item);
    currentWidth =
      currentRow.length === 1
        ? item.width
        : currentWidth + gapX + item.width;
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  const result: StoryMediaItem[] = [];
  let rowY = 0;

  for (const row of rows) {
    const photosWidth = row.reduce(
      (total, item) => total + item.width,
      0,
    );
    const gapsWidth = gapX * Math.max(0, row.length - 1);
    const rowWidth = Math.min(100, photosWidth + gapsWidth);
    const rowHeight = Math.max(
      ...row.map((item) => item.height ?? 320),
    );

    let itemX = Math.max(0, (100 - rowWidth) / 2);

    for (const item of row) {
      result.push({
        ...item,
        x: itemX,
        y: rowY,
      });

      itemX += item.width + gapX;
    }

    rowY += rowHeight + gapY;
  }

  return result;
}

function resolveComposition(
  sourceItems: StoryMediaItem[],
  activeId: string,
) {
  const items = sourceItems.map(normalizeMediaItem);
  const active = items.find((item) => item.id === activeId);

  if (!active) return items;

  active.width = Math.min(active.width, 100);
  active.x = clampPosition(
    active.x ?? 0,
    Math.max(0, 100 - active.width),
  );
  active.y = Math.max(0, active.y ?? 0);

  const gapX = 0;
  const gapY = 0;

  for (let pass = 0; pass < items.length * 3; pass += 1) {
    let changed = false;

    for (const other of items) {
      if (other.id === active.id) continue;
      if (!rectanglesOverlap(active, other)) continue;

      const activeCenter =
        (active.x ?? 0) + active.width / 2;
      const otherCenter =
        (other.x ?? 0) + other.width / 2;

      if (activeCenter <= otherCenter) {
        const nextX = (active.x ?? 0) + active.width + gapX;
        const availableWidth = 100 - nextX;

        if (availableWidth >= 20) {
          other.x = nextX;
          other.width = Math.min(other.width, availableWidth);
        } else {
          other.y =
            (active.y ?? 0) +
            (active.height ?? 320) +
            gapY;
        }
      } else {
        const availableWidth =
          (active.x ?? 0) - gapX - (other.x ?? 0);

        if (availableWidth >= 20) {
          other.width = Math.min(other.width, availableWidth);
        } else {
          active.y =
            (other.y ?? 0) +
            (other.height ?? 320) +
            gapY;
        }
      }

      other.x = clampPosition(
        other.x ?? 0,
        Math.max(0, 100 - other.width),
      );
      other.y = Math.max(0, other.y ?? 0);
      changed = true;
    }

    if (!changed) break;
  }

  return items;
}

function getCompositionCanvasHeight(items: StoryMediaItem[]) {
  const contentBottom = items.reduce(
    (maximum, item) =>
      Math.max(
        maximum,
        (item.y ?? 0) + (item.height ?? 320),
      ),
    0,
  );

  return Math.max(120, Math.ceil(contentBottom));
}

// STORY_NORMALIZED_SPATIAL_PREVIEW
const STORY_COMPOSITION_BASE_WIDTH = 1000;

function getLayoutVariantOptions(layout: StoryGalleryLayout) {
  if (layout === "row") {
    return [
      { value: "small" as const, label: "3 per row" },
      { value: "medium" as const, label: "2 per row" },
      { value: "large" as const, label: "1 per row" },
    ];
  }

  if (layout === "grid") {
    return [
      { value: "small" as const, label: "4 columns" },
      { value: "medium" as const, label: "3 columns" },
      { value: "large" as const, label: "2 columns" },
    ];
  }

  if (layout === "mosaic") {
    return [
      { value: "small" as const, label: "Lead right" },
      { value: "medium" as const, label: "Editorial" },
      { value: "large" as const, label: "Lead left" },
    ];
  }

  return [
    { value: "small" as const, label: "Compact" },
    { value: "medium" as const, label: "Balanced" },
    { value: "large" as const, label: "Tall" },
  ];
}

function arrangeUniformRows({
  items,
  columns,
  rowHeight,
}: {
  items: StoryMediaItem[];
  columns: number;
  rowHeight: number;
}) {
  const gapX = 0;
  const gapY = 0;
  const baseWidth =
    (100 - gapX * (columns - 1)) / columns;

  return items.map((item, index) => {
    const row = Math.floor(index / columns);
    const rowStart = row * columns;
    const rowCount = Math.min(
      columns,
      items.length - rowStart,
    );
    const rowWidth =
      rowCount * baseWidth +
      Math.max(0, rowCount - 1) * gapX;
    const offset = Math.max(0, (100 - rowWidth) / 2);
    const column = index % columns;

    return {
      ...item,
      x: offset + column * (baseWidth + gapX),
      y: row * (rowHeight + gapY),
      width: baseWidth,
      height: rowHeight,
    };
  });
}

function arrangeMosaicLead(
  items: StoryMediaItem[],
  side: "left" | "right",
) {
  if (items.length <= 1) {
    return items;
  }

  const gapX = 0;
  const gapY = 0;
  const leadWidth = 58;
  const secondaryAreaWidth = 100 - leadWidth - gapX;
  const secondaryItems = items.slice(1);
  const secondaryColumns =
    secondaryItems.length >= 4 ? 2 : 1;
  const secondaryWidth =
    (
      secondaryAreaWidth -
      gapX * (secondaryColumns - 1)
    ) / secondaryColumns;
  const secondaryHeight = 220;
  const secondaryRows = Math.ceil(
    secondaryItems.length / secondaryColumns,
  );
  const totalHeight =
    secondaryRows * secondaryHeight +
    Math.max(0, secondaryRows - 1) * gapY;

  const leadX = side === "left"
    ? 0
    : secondaryAreaWidth + gapX;
  const secondaryStartX = side === "left"
    ? leadWidth + gapX
    : 0;

  return items.map((item, index) => {
    if (index === 0) {
      return {
        ...item,
        x: leadX,
        y: 0,
        width: leadWidth,
        height: Math.max(420, totalHeight),
      };
    }

    const secondaryIndex = index - 1;
    const column = secondaryIndex % secondaryColumns;
    const row = Math.floor(
      secondaryIndex / secondaryColumns,
    );

    const fillsFinalRow =
      secondaryColumns > 1 &&
      secondaryIndex === secondaryItems.length - 1 &&
      column === 0;

    return {
      ...item,
      x:
        secondaryStartX +
        column * (secondaryWidth + gapX),
      y: row * (secondaryHeight + gapY),
      width: fillsFinalRow
        ? secondaryAreaWidth
        : secondaryWidth,
      height: secondaryHeight,
    };
  });
}

function arrangeEditorialMosaic(items: StoryMediaItem[]) {
  const gapX = 0;
  const gapY = 0;
  const patterns = [
    {
      widths: [62, 36],
      height: 360,
    },
    {
      widths: [31, 32, 31],
      height: 240,
    },
    {
      widths: [40, 58],
      height: 300,
    },
  ];

  const arranged: StoryMediaItem[] = [];
  let sourceIndex = 0;
  let rowIndex = 0;
  let y = 0;

  while (sourceIndex < items.length) {
    const pattern = patterns[rowIndex % patterns.length];
    const count = Math.min(
      pattern.widths.length,
      items.length - sourceIndex,
    );
    const rawWidths = pattern.widths.slice(0, count);
    const rawTotal = rawWidths.reduce(
      (total, width) => total + width,
      0,
    );
    const widths =
      count < pattern.widths.length && rawTotal > 0
        ? rawWidths.map((width) => (width / rawTotal) * 100)
        : rawWidths;
    const occupiedWidth =
      widths.reduce((total, width) => total + width, 0) +
      Math.max(0, count - 1) * gapX;
    let x = Math.max(0, (100 - occupiedWidth) / 2);

    for (let index = 0; index < count; index += 1) {
      arranged.push({
        ...items[sourceIndex + index],
        x,
        y,
        width: widths[index],
        height: pattern.height,
      });

      x += widths[index] + gapX;
    }

    sourceIndex += count;
    y += pattern.height + gapY;
    rowIndex += 1;
  }

  return arranged;
}


function repairPersistedEditorialMosaic(
  sourceItems: StoryMediaItem[],
) {
  const items = sourceItems.map(normalizeMediaItem);

  if (items.length < 2) return items;

  const finalY = Math.max(
    ...items.map((item) => item.y ?? 0),
  );
  const finalRow = items
    .filter(
      (item) =>
        Math.abs((item.y ?? 0) - finalY) < 8,
    )
    .sort(
      (first, second) =>
        (first.x ?? 0) - (second.x ?? 0),
    );

  if (finalRow.length === 0) return items;

  const rowStart = Math.min(
    ...finalRow.map((item) => item.x ?? 0),
  );
  const rowEnd = Math.max(
    ...finalRow.map(
      (item) => (item.x ?? 0) + item.width,
    ),
  );
  const rowSpan = rowEnd - rowStart;
  const looksAutomaticallyCentered =
    Math.abs(rowStart - (100 - rowSpan) / 2) < 1.5;

  if (
    rowSpan >= 99 ||
    !looksAutomaticallyCentered
  ) {
    return items;
  }

  const widthTotal = finalRow.reduce(
    (total, item) => total + item.width,
    0,
  );

  if (widthTotal <= 0) return items;

  const positions = new Map<
    string,
    { x: number; width: number }
  >();
  let nextX = 0;

  finalRow.forEach((item) => {
    const width = (item.width / widthTotal) * 100;

    positions.set(item.id, {
      x: nextX,
      width,
    });

    nextX += width;
  });

  return items.map((item) => {
    const position = positions.get(item.id);

    return position
      ? {
          ...item,
          ...position,
        }
      : item;
  });
}

function arrangeItems(
  sourceItems: StoryMediaItem[],
  layout: StoryGalleryLayout,
  variant: StoryImageSize = "medium",
) {
  const items = sourceItems.map(normalizeMediaItem);

  if (items.length <= 1) {
    const width =
      variant === "small"
        ? 55
        : variant === "large"
          ? 100
          : 75;
    const height =
      variant === "small"
        ? 300
        : variant === "large"
          ? 540
          : 420;

    return items.map((item) => ({
      ...item,
      x: Math.max(0, (100 - width) / 2),
      y: 0,
      width,
      height,
    }));
  }

  if (layout === "row") {
    const columns =
      variant === "small"
        ? 3
        : variant === "large"
          ? 1
          : 2;
    const rowHeight =
      variant === "small"
        ? 250
        : variant === "large"
          ? 420
          : 320;

    return arrangeUniformRows({
      items,
      columns,
      rowHeight,
    });
  }

  if (layout === "grid") {
    const columns =
      variant === "small"
        ? 4
        : variant === "large"
          ? 2
          : 3;
    const rowHeight =
      variant === "small"
        ? 210
        : variant === "large"
          ? 340
          : 270;

    return arrangeUniformRows({
      items,
      columns,
      rowHeight,
    });
  }

  if (layout === "mosaic") {
    if (variant === "large") {
      return arrangeMosaicLead(items, "left");
    }

    if (variant === "small") {
      return arrangeMosaicLead(items, "right");
    }

    return arrangeEditorialMosaic(items);
  }

  const width =
    variant === "small"
      ? 62
      : variant === "large"
        ? 100
        : 80;
  const height =
    variant === "small"
      ? 220
      : variant === "large"
        ? 440
        : 320;
  const gapY = 0;

  return items.map((item, index) => ({
    ...item,
    x: Math.max(0, (100 - width) / 2),
    y: index * (height + gapY),
    width,
    height,
  }));
}

function resizeRowWithinLayout(
  sourceItems: StoryMediaItem[],
  itemId: string,
  requestedWidth: number,
) {
  const items = sourceItems.map(normalizeMediaItem);
  const selected = items.find((item) => item.id === itemId);

  if (!selected) {
    return items;
  }

  const rowItems = items
    .filter(
      (item) =>
        Math.abs((item.y ?? 0) - (selected.y ?? 0)) < 8,
    )
    .sort((first, second) => (first.x ?? 0) - (second.x ?? 0));

  if (rowItems.length <= 1) {
    const width = clampWidth(requestedWidth);

    return items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            width,
            x: Math.max(0, (100 - width) / 2),
          }
        : item,
    );
  }

  const gapX = 0;
  const rowStart = Math.min(
    ...rowItems.map((item) => item.x ?? 0),
  );
  const rowEnd = Math.max(
    ...rowItems.map(
      (item) => (item.x ?? 0) + item.width,
    ),
  );
  const rowSpan = Math.min(
    100,
    Math.max(24, rowEnd - rowStart),
  );
  const widthBudget =
    rowSpan - gapX * (rowItems.length - 1);
  const minimumSiblingWidth = 12;
  const selectedWidth = Math.max(
    minimumSiblingWidth,
    Math.min(
      requestedWidth,
      widthBudget -
        minimumSiblingWidth * (rowItems.length - 1),
    ),
  );
  const otherItems = rowItems.filter(
    (item) => item.id !== itemId,
  );
  const previousOtherWidth = otherItems.reduce(
    (total, item) => total + item.width,
    0,
  );
  const remainingWidth = widthBudget - selectedWidth;

  const widths = new Map<string, number>();

  widths.set(itemId, selectedWidth);

  otherItems.forEach((item) => {
    const ratio =
      previousOtherWidth > 0
        ? item.width / previousOtherWidth
        : 1 / otherItems.length;

    widths.set(
      item.id,
      Math.max(
        minimumSiblingWidth,
        remainingWidth * ratio,
      ),
    );
  });

  const calculatedTotal = rowItems.reduce(
    (total, item) => total + (widths.get(item.id) ?? item.width),
    0,
  );
  const correction = widthBudget - calculatedTotal;

  if (otherItems.length > 0 && Math.abs(correction) > 0.01) {
    const finalItem = otherItems[otherItems.length - 1];

    widths.set(
      finalItem.id,
      Math.max(
        minimumSiblingWidth,
        (widths.get(finalItem.id) ?? finalItem.width) +
          correction,
      ),
    );
  }

  const rowPositions = new Map<
    string,
    { x: number; width: number }
  >();
  let nextX = rowStart;

  rowItems.forEach((item) => {
    const width = widths.get(item.id) ?? item.width;

    rowPositions.set(item.id, {
      x: nextX,
      width,
    });

    nextX += width + gapX;
  });

  return items.map((item) => {
    const position = rowPositions.get(item.id);

    return position
      ? {
          ...item,
          ...position,
        }
      : item;
  });
}

function resizeMosaicLead(
  sourceItems: StoryMediaItem[],
  itemId: string,
  requestedWidth: number,
  side: "left" | "right",
) {
  const items = sourceItems.map(normalizeMediaItem);
  const lead = items[0];

  if (!lead || lead.id !== itemId) {
    return resizeRowWithinLayout(
      items,
      itemId,
      requestedWidth,
    );
  }

  const gapX = 0;
  const leadWidth = Math.max(
    30,
    Math.min(78, requestedWidth),
  );
  const secondaryAreaWidth =
    100 - leadWidth - gapX;
  const secondaryItems = items.slice(1);
  const secondaryColumns =
    secondaryItems.length >= 4 ? 2 : 1;
  const secondaryWidth =
    (
      secondaryAreaWidth -
      gapX * (secondaryColumns - 1)
    ) / secondaryColumns;
  const leadX =
    side === "left"
      ? 0
      : secondaryAreaWidth + gapX;
  const secondaryStartX =
    side === "left"
      ? leadWidth + gapX
      : 0;

  return items.map((item, index) => {
    if (index === 0) {
      return {
        ...item,
        x: leadX,
        width: leadWidth,
      };
    }

    const secondaryIndex = index - 1;
    const column =
      secondaryIndex % secondaryColumns;

    return {
      ...item,
      x:
        secondaryStartX +
        column * (secondaryWidth + gapX),
      width: secondaryWidth,
    };
  });
}

function resizeItemWithinLayout(
  sourceItems: StoryMediaItem[],
  itemId: string,
  requestedWidth: number,
  layout: StoryGalleryLayout,
  variant: StoryImageSize,
) {
  if (
    layout === "mosaic" &&
    variant === "large"
  ) {
    return resizeMosaicLead(
      sourceItems,
      itemId,
      requestedWidth,
      "left",
    );
  }

  if (
    layout === "mosaic" &&
    variant === "small"
  ) {
    return resizeMosaicLead(
      sourceItems,
      itemId,
      requestedWidth,
      "right",
    );
  }

  return resizeRowWithinLayout(
    sourceItems,
    itemId,
    requestedWidth,
  );
}

function resizeHeightInComposition(
  sourceItems: StoryMediaItem[],
  itemId: string,
  requestedHeight: number,
  layout: StoryGalleryLayout,
) {
  const items = sourceItems.map(normalizeMediaItem);
  const selected = items.find((item) => item.id === itemId);

  if (!selected) {
    return items;
  }

  const height = Math.max(
    120,
    Math.min(1400, requestedHeight),
  );

  if (layout === "mosaic") {
    return items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            height,
          }
        : item,
    );
  }

  const selectedY = selected.y ?? 0;
  const rowItems = items.filter(
    (item) =>
      Math.abs((item.y ?? 0) - selectedY) < 8,
  );
  const previousRowHeight = Math.max(
    ...rowItems.map((item) => item.height ?? 280),
  );
  const nextRowHeight = Math.max(
    ...rowItems.map((item) =>
      item.id === itemId
        ? height
        : item.height ?? 280,
    ),
  );
  const delta = nextRowHeight - previousRowHeight;

  return items.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        height,
      };
    }

    if ((item.y ?? 0) > selectedY + 8) {
      return {
        ...item,
        y: Math.max(0, (item.y ?? 0) + delta),
      };
    }

    return item;
  });
}

function SortablePhoto({
  item,
  index,
  active,
  single,
  alignment,
  onSelect,
  onUpdate,
}: {
  item: StoryMediaItem;
  index: number;
  active: boolean;
  single: boolean;
  alignment: StoryImageAlignment;
  onSelect: () => void;
  onUpdate: (
    patch: Partial<Omit<StoryMediaItem, "id">>,
  ) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const itemX = item.x ?? 0;
  const itemY = item.y ?? 0;
  const itemHeight = item.height ?? 65;
  const cropX = item.cropX ?? 50;
  const cropY = item.cropY ?? 50;
  const cropZoom = item.cropZoom ?? 1;

  function beginResize(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const canvas = event.currentTarget.closest(
      "[data-story-media-canvas]",
    ) as HTMLElement | null;

    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = item.width;
    const startHeight = itemHeight;

    function move(pointerEvent: PointerEvent) {
      const widthDelta =
        ((pointerEvent.clientX - startX) / canvasRect.width) * 100;
      const heightDelta =
        ((pointerEvent.clientY - startY) / canvasRect.width) *
        STORY_COMPOSITION_BASE_WIDTH;

      onUpdate({
        width: Math.max(
          12,
          Math.min(100 - itemX, startWidth + widthDelta),
        ),
        height: Math.max(120, startHeight + heightDelta),
      });
    }

    function stop() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }

  function beginCrop(event: React.PointerEvent<HTMLImageElement>) {
    event.preventDefault();
    event.stopPropagation();
    onSelect();

    const frame = event.currentTarget.parentElement;

    if (!frame) return;

    const frameRect = frame.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startCropX = cropX;
    const startCropY = cropY;

    function move(pointerEvent: PointerEvent) {
      const deltaX =
        ((pointerEvent.clientX - startX) / frameRect.width) * 100;
      const deltaY =
        ((pointerEvent.clientY - startY) / frameRect.height) * 100;

      onUpdate({
        cropX: clampPosition(startCropX - deltaX, 100),
        cropY: clampPosition(startCropY - deltaY, 100),
      });
    }

    function stop() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }

  const spatialStyle = single
    ? {
        position: "relative" as const,
        left: `${itemX}%`,
        width: `${item.width}%`,
        height: `${itemHeight / 10}cqw`,
        marginTop: `${itemY / 10}cqw`,
      }
    : {
        position: "absolute" as const,
        left: `${itemX}%`,
        top: `${itemY / 10}cqw`,
        width: `${item.width}%`,
        height: `${itemHeight / 10}cqw`,
      };

  return (
    <figure
      ref={setNodeRef}
      style={{
        ...spatialStyle,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition: isDragging
          ? "none"
          : transition ||
            "left 180ms ease, top 180ms ease, width 180ms ease, height 180ms ease",
        opacity: isDragging ? 0.58 : 1,
        zIndex: isDragging ? 30 : active ? 10 : 1,
        boxSizing: "border-box",
        willChange: isDragging ? "transform" : undefined,
        padding: "calc(var(--story-preview-gap, 12px) / 2)",
        borderRadius:
          "calc(var(--story-preview-radius, 16px) + var(--story-preview-gap, 12px) / 2)",
        backgroundColor: "transparent",
        outline: "none",
        isolation: "isolate",
      }}
      onClick={onSelect}
      className="group bg-transparent"
    >
      <div
        className={`relative h-full min-h-0 overflow-hidden bg-[#e9e0d1] transition-[border-color,box-shadow] duration-180 ${
          active
            ? "border border-[#b88a3b] ring-2 ring-inset ring-[#b88a3b]/25"
            : "border border-[#242617]/10"
        }`}
        style={{
          borderRadius: "var(--story-preview-radius, 16px)",
          borderWidth:
            "clamp(0px, var(--story-preview-gap, 12px), 1px)",
          boxShadow: "none",
        }}
      >
        <img
          src={item.src}
          alt={item.alt}
          draggable={false}
          onPointerDown={beginCrop}
          className="h-full w-full cursor-move select-none object-cover"
          style={{
            objectPosition: `${cropX}% ${cropY}%`,
            transform: `scale(${cropZoom})`,
            transformOrigin: `${cropX}% ${cropY}%`,
          }}
        />

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute left-3 top-3 flex h-10 w-10 cursor-grab touch-none items-center justify-center rounded-full bg-[#071321]/88 text-base text-white shadow-lg active:cursor-grabbing"
          aria-label={`Move photo ${index + 1}`}
          title="Drag to move"
        >
          ⠿
        </button>

        <span className="absolute right-3 top-3 rounded-full bg-[#071321]/88 px-3 py-2 text-[9px] font-bold text-white">
          {index + 1}
        </span>

        <button
          type="button"
          onPointerDown={beginResize}
          className="absolute bottom-0 right-0 flex h-11 w-11 cursor-nwse-resize touch-none items-center justify-center rounded-tl-2xl border-l border-t border-white/40 bg-[#071321]/88 text-lg text-white"
          aria-label="Resize and crop photo"
          title="Drag to resize the frame"
        >
          ↘
        </button>

        {item.caption ? (
          <figcaption className="absolute inset-x-0 bottom-0 bg-white/90 px-4 py-3 pr-14 text-xs italic text-[#242617]/60 backdrop-blur-sm">
            {item.caption}
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}

export function StoryMediaDialog({
  initialDraft,
  editing,
  uploadSlug,
  existingImageUrls,
  onCancel,
  onRemove,
  onSave,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<StoryMediaItem[]>(() => {
    const hasSavedSpatialLayout = initialDraft.items.every(
      (item) =>
        item.x !== undefined &&
        item.y !== undefined &&
        item.height !== undefined,
    );

    const normalized = initialDraft.items.map(normalizeMediaItem);

    if (!hasSavedSpatialLayout) {
      return arrangeItems(
        normalized,
        initialDraft.layout,
        initialDraft.size,
      );
    }

    let restored = normalized;

    if (
      initialDraft.layout === "mosaic" &&
      initialDraft.size === "medium"
    ) {
      restored =
        repairPersistedEditorialMosaic(normalized);
    }

    return compositionHasOverlaps(restored)
      ? arrangeItems(
          restored,
          initialDraft.layout,
          initialDraft.size,
        )
      : restored;
  });
  const [alignment, setAlignment] = useState(initialDraft.alignment);
  const [size, setSize] = useState(initialDraft.size);
  const [layout, setLayout] = useState(initialDraft.layout);
  const [compositionWidth, setCompositionWidth] = useState(
    Math.max(40, Math.min(100, initialDraft.compositionWidth ?? 100)),
  );
  const [photoGap, setPhotoGap] = useState(
    Math.max(0, Math.min(32, initialDraft.photoGap ?? 12)),
  );
  const [cornerRadius, setCornerRadius] = useState(
    Math.max(0, Math.min(40, initialDraft.cornerRadius ?? 16)),
  );
  const [activeId, setActiveId] = useState(
    initialDraft.items[0]?.id ?? "",
  );
  const [uploading, setUploading] = useState(false);
  const [draggingFiles, setDraggingFiles] = useState(false);
  const [error, setError] = useState("");

  const activeItem =
    items.find((item) => item.id === activeId) ?? items[0] ?? null;

  const needsSpatialNormalization = items.some(
    (item) =>
      item.x === undefined ||
      item.y === undefined ||
      item.height === undefined,
  );

  useEffect(() => {
    if (!needsSpatialNormalization) return;

    setItems((current) => arrangeItems(current, layout));
  }, [layout, needsSpatialNormalization]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setMounted(true);

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onCancel]);

  function updateItem(
    id: string,
    patch: Partial<Omit<StoryMediaItem, "id">>,
  ) {
    setItems((current) => {
      const {
        width,
        height,
        x,
        y,
        ...metadata
      } = patch;

      let next = current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...metadata,
            }
          : item,
      );

      if (width !== undefined) {
        next = resizeItemWithinLayout(
          next,
          id,
          width,
          layout,
          size,
        );
      }

      if (height !== undefined) {
        next = resizeHeightInComposition(
          next,
          id,
          height,
          layout,
        );
      }

      if (x !== undefined || y !== undefined) {
        next = next.map((item) =>
          item.id === id
            ? {
                ...item,
                ...(x !== undefined ? { x } : {}),
                ...(y !== undefined ? { y } : {}),
              }
            : item,
        );

        next = resolveComposition(next, id);
      }

      return next;
    });
  }

  function removeItem(id: string) {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);

      if (activeId === id) {
        setActiveId(next[0]?.id ?? "");
      }

      return reflowCompositionRows(next);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setItems((current) => {
      const oldIndex = current.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = current.findIndex(
        (item) => item.id === over.id,
      );

      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      const reordered = arraySwap(
        current,
        oldIndex,
        newIndex,
      );

      return arrangeItems(
        reordered,
        layout,
        size,
      );
    });
  }

  function chooseLayout(value: StoryGalleryLayout) {
    setLayout(value);
    setItems((current) =>
      arrangeItems(current, value, size),
    );
  }

  function chooseVariant(value: StoryImageSize) {
    setSize(value);
    setItems((current) =>
      arrangeItems(current, layout, value),
    );
  }

  function chooseAlignment(value: StoryImageAlignment) {
    setAlignment(value);

    setItems((current) =>
      current.map((item, index) => {
        if (index !== 0 || current.length !== 1) return item;

        const width = value === "full" ? 100 : item.width;
        const x =
          value === "right"
            ? 100 - width
            : value === "center"
              ? (100 - width) / 2
              : 0;

        return {
          ...item,
          width,
          x,
        };
      }),
    );
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;

    setError("");
    setUploading(true);

    const next = [...items];

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const formData = new FormData();

        formData.set("file", file);
        formData.set("context", "story");
        formData.set("entitySlug", uploadSlug || "draft");
        formData.set(
          "slotKey",
          `inline-content-${Date.now()}-${index}`,
        );

        [
          ...existingImageUrls,
          ...next.map((item) => item.src),
        ].forEach((url) => {
          formData.append("existingImageUrls", url);
        });

        const response = await fetch("/api/admin/uploads/image", {
          method: "POST",
          body: formData,
        });

        const result = (await response
          .json()
          .catch(() => null)) as UploadResult | null;

        if (!response.ok || !result?.ok) {
          throw new Error(
            result?.error ||
              result?.message ||
              "Upload failed.",
          );
        }

        const src = result.path || result.src || result.url || "";

        if (!src) {
          throw new Error("Upload returned no image URL.");
        }

        if (
          [...existingImageUrls, ...next.map((item) => item.src)].includes(
            src,
          )
        ) {
          throw new Error(
            "Fichier double déjà présent sur cette page.",
          );
        }

        const photo: StoryMediaItem = {
          id: createId(),
          src,
          alt: titleFromFile(file.name),
          caption: "",
          watermark: "NONE",
          width: files.length + next.length <= 2 ? 50 : 33,
        };

        next.push(photo);
        setItems([...next]);
        setActiveId(photo.id);
      }

      setItems((current) =>
        current.length === 1
          ? current.map((item) => ({ ...item, width: 70 }))
          : arrangeItems(current, layout),
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  function receiveFiles(fileList: FileList | null) {
    if (!fileList || uploading) return;
    void uploadFiles(Array.from(fileList));
  }

  if (!mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#071321]/50 p-3 backdrop-blur-md"
      style={{ zIndex: 2147483000 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-[#f8f4eb] shadow-[0_30px_100px_rgba(7,19,33,0.34)]">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            receiveFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />

        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#242617]/10 px-5 py-4 md:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
              Story media
            </p>

            <h2 className="mt-1 font-serif text-3xl text-[#242617]">
              {editing ? "Edit media composition" : "Insert media"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {items.length > 0 ? (
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="h-11 cursor-pointer rounded-full bg-[#b88a3b] px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#d5ad68] disabled:cursor-wait disabled:opacity-55"
              >
                {uploading ? "Uploading..." : "+ Upload more"}
              </button>
            ) : null}

            <button
              type="button"
              onClick={onCancel}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#071321] text-xl text-white transition hover:bg-[#b88a3b]"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-7">
          {items.length === 0 ? (
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setDraggingFiles(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDraggingFiles(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDraggingFiles(false);
                receiveFiles(event.dataTransfer.files);
              }}
              className={`mx-auto flex min-h-[52vh] w-full max-w-3xl cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed px-8 text-center transition ${
                draggingFiles
                  ? "border-[#b88a3b] bg-[#b88a3b]/10"
                  : "border-[#b88a3b]/55 bg-white/35 hover:bg-white/65"
              }`}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#242617]/12 text-3xl text-[#242617]/45">
                ↑
              </span>

              <span className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#242617]/60">
                {uploading
                  ? "Uploading..."
                  : "Select one or more photos"}
              </span>

              <span className="mt-2 text-sm text-[#242617]/35">
                Drop several files here or click to browse
              </span>
            </button>
          ) : (
            <div className="grid items-start gap-6 lg:h-[calc(100dvh-245px)] lg:min-h-0 lg:overflow-hidden lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
              <section className="min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2 [scrollbar-gutter:stable]">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b88a3b]">
                      Live composition
                    </p>

                    <p className="mt-1 text-sm text-[#242617]/45">
                      Drag the dotted handles to reorder photos. Resize from the corner, or drag inside a photo to adjust its crop.
                    </p>
                  </div>
                </div>

                <div
                  data-story-media-canvas
                  className="flow-root rounded-[1.75rem] border border-[#242617]/10 bg-[#f3ecdf] shadow-inner"
                  style={{
                    maxWidth: 1050,
                    width: `${compositionWidth}%`,
                    ...({
                      "--story-preview-gap": `${photoGap}px`,
                      "--story-preview-radius": `${cornerRadius}px`,
                    } as React.CSSProperties),
                    containerType: "inline-size",
                    marginInline: "auto",
                  }}
                >
                  <DndContext
                    sensors={sensors}
                    collisionDetection={(args) => {
                      const pointerCollisions = pointerWithin(args);

                      return pointerCollisions.length > 0
                        ? pointerCollisions
                        : closestCenter(args);
                    }}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={items.map((item) => item.id)}
                      strategy={rectSortingStrategy}
                    >
                      {items.length === 1 ? (
                        <div className="flow-root">
                          <SortablePhoto
                            item={items[0]}
                            index={0}
                            active={activeItem?.id === items[0].id}
                            single
                            alignment={alignment}
                            onSelect={() => setActiveId(items[0].id)}
                            onUpdate={(patch) =>
                              updateItem(items[0].id, patch)
                            }
                          />

                          <p className="mb-4 text-sm leading-7 text-[#242617]/62">
                            Images and words share the same space. Resize
                            and position the photo to preview how the
                            surrounding story will flow.
                          </p>

                          <p className="text-sm leading-7 text-[#242617]/62">
                            The text automatically adapts around a
                            left- or right-aligned image.
                          </p>
                        </div>
                      ) : (
                        <div
                          className="relative w-full transition-[aspect-ratio] duration-200 ease-out"
                          style={{
                            aspectRatio: `${STORY_COMPOSITION_BASE_WIDTH} / ${getCompositionCanvasHeight(items)}`,
                          }}
                        >
                          {items.map((item, index) => (
                            <SortablePhoto
                              key={item.id}
                              item={item}
                              index={index}
                              active={activeItem?.id === item.id}
                              single={false}
                              alignment="center"
                              onSelect={() => setActiveId(item.id)}
                              onUpdate={(patch) =>
                                updateItem(item.id, patch)
                              }
                            />
                          ))}
                        </div>
                      )}
                    </SortableContext>
                  </DndContext>
                </div>
              </section>

              <aside className="min-h-0 space-y-5 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2 [scrollbar-gutter:stable]">
                {activeItem ? (
                  <section className="rounded-[1.5rem] border border-[#242617]/10 bg-white/42 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b88a3b]">
                        Selected photo
                      </p>

                      <button
                        type="button"
                        onClick={() => removeItem(activeItem.id)}
                        className="text-[9px] font-bold uppercase tracking-[0.14em] text-red-800/55"
                      >
                        Remove
                      </button>
                    </div>

                    <label className="mt-4 block">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/45">
                        Alternative text
                      </span>

                      <input
                        value={activeItem.alt}
                        onChange={(event) =>
                          updateItem(activeItem.id, {
                            alt: event.target.value,
                          })
                        }
                        className="h-13 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-4 text-sm outline-none focus:border-[#b88a3b]"
                      />
                    </label>

                    <label className="mt-4 block">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/45">
                        Legend
                      </span>

                      <input
                        value={activeItem.caption}
                        onChange={(event) =>
                          updateItem(activeItem.id, {
                            caption: event.target.value,
                          })
                        }
                        placeholder="Credit or context"
                        className="h-13 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-4 text-sm outline-none focus:border-[#b88a3b]"
                      />
                    </label>

                    <div className="mt-4">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/45">
                        Width · {Math.round(activeItem.width)}%
                      </span>

                      <input
                        type="range"
                        min="12"
                        max="100"
                        step="1"
                        value={activeItem.width}
                        onChange={(event) =>
                          updateItem(activeItem.id, {
                            width: Number(event.target.value),
                          })
                        }
                        className="w-full accent-[#b88a3b]"
                      />
                    </div>

                    <div className="mt-4">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/45">
                        Height · {Math.round(activeItem.height ?? 280)}px
                      </span>

                      <input
                        type="range"
                        min="120"
                        max="1200"
                        step="10"
                        value={activeItem.height ?? 280}
                        onChange={(event) =>
                          updateItem(activeItem.id, {
                            height: Number(event.target.value),
                          })
                        }
                        className="w-full accent-[#b88a3b]"
                      />
                    </div>

                    <div className="mt-4">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/45">
                        Watermark
                      </span>

                      <div className="grid grid-cols-3 gap-2">
                        {(["NONE", "ANDREW", "MORGANE"] as const).map(
                          (value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                updateItem(activeItem.id, {
                                  watermark: value,
                                })
                              }
                              className={optionClass(
                                activeItem.watermark === value,
                              )}
                            >
                              {value}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </section>
                ) : null}

                <section className="rounded-[1.5rem] border border-[#242617]/10 bg-[#f4efe4]/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b88a3b]">
                    Display
                  </p>

                  <h3 className="mt-2 font-serif text-2xl text-[#242617]">
                    Group presentation
                  </h3>

                  {items.length === 1 ? (
                    <div className="mt-4">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/45">
                        Placement
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        {(
                          ["left", "center", "right", "full"] as const
                        ).map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => chooseAlignment(value)}
                            className={optionClass(alignment === value)}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/45">
                        Layout family
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        {(
                          ["row", "grid", "mosaic", "stack"] as const
                        ).map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => chooseLayout(value)}
                            className={optionClass(layout === value)}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/45">
                      {items.length === 1
                        ? "Photo size"
                        : "Layout variation"}
                    </span>

                    <div className="grid grid-cols-3 gap-2">
                      {(
                        items.length === 1
                          ? [
                              {
                                value: "small" as const,
                                label: "Small",
                              },
                              {
                                value: "medium" as const,
                                label: "Medium",
                              },
                              {
                                value: "large" as const,
                                label: "Large",
                              },
                            ]
                          : getLayoutVariantOptions(layout)
                      ).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            chooseVariant(option.value)
                          }
                          className={optionClass(
                            size === option.value,
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {items.length === 1 ? (
                      <p className="mt-2 text-[11px] leading-5 text-[#242617]/40">
                        Choose the starting size, then refine width and height above.
                      </p>
                    ) : null}
                  </div>
                </section>


                <section className="rounded-[1.5rem] border border-[#242617]/10 bg-[#f4efe4]/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b88a3b]">
                    Frame
                  </p>

                  <h3 className="mt-2 font-serif text-2xl text-[#242617]">
                    Composition frame
                  </h3>

                  <div className="mt-5 space-y-5">
                    <label className="block">
                      <span className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/45">
                        <span>Total width</span>
                        <span>{compositionWidth}%</span>
                      </span>
                      <input
                        type="range"
                        min="40"
                        max="100"
                        step="1"
                        value={compositionWidth}
                        onChange={(event) =>
                          setCompositionWidth(Number(event.target.value))
                        }
                        className="w-full accent-[#b88a3b]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/45">
                        <span>Photo spacing</span>
                        <span>{photoGap}px</span>
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        step="1"
                        value={photoGap}
                        onChange={(event) =>
                          setPhotoGap(Number(event.target.value))
                        }
                        className="w-full accent-[#b88a3b]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/45">
                        <span>Corner radius</span>
                        <span>{cornerRadius}px</span>
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="1"
                        value={cornerRadius}
                        onChange={(event) =>
                          setCornerRadius(Number(event.target.value))
                        }
                        className="w-full accent-[#b88a3b]"
                      />
                    </label>
                  </div>
                </section>

                {error ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-5 py-4 text-sm text-red-800">
                    {error}
                  </div>
                ) : null}
              </aside>
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-col-reverse justify-between gap-3 border-t border-[#242617]/10 bg-[#f8f4eb] px-5 py-4 sm:flex-row md:px-7">
          <div>
            {editing && onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="h-12 rounded-full border border-red-500/20 px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-red-800/60"
              >
                Remove composition
              </button>
            ) : null}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-12 rounded-full border border-[#242617]/12 px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#242617]/50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={items.length === 0 || uploading}
              onClick={() =>
                onSave({
                  items,
                  alignment,
                  size,
                  layout,
                  compositionWidth,
                  photoGap,
                  cornerRadius,
                })
              }
              className="h-12 rounded-full bg-[#202711] px-7 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b88a3b] disabled:cursor-not-allowed disabled:bg-[#242617]/25"
            >
              {uploading
                ? "Uploading..."
                : editing
                  ? "Save composition"
                  : `Insert ${items.length} photo${items.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
