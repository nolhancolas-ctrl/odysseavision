"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import {
  deletePortfolioGalleryPhoto,
  reorderPortfolioGalleryPhotos,
} from "@/server/actions/portfolio-gallery-photos";

type PortfolioPhoto = {
  id: string;
  title: string;
  imageSrc: string;
  status: string;
  featured: boolean;
  watermark: string;
  order: number;
};

type PortfolioPhotoSorterProps = {
  categoryId: string;
  returnTo: string;
  initialItems: PortfolioPhoto[];
};

function watermarkLabel(value: string) {
  if (value === "ANDREW") return "Andrew watermark";
  if (value === "MORGANE") return "Morgane watermark";
  return "No watermark";
}

function SortablePhoto({
  item,
  position,
  returnTo,
  disabled,
}: {
  item: PortfolioPhoto;
  position: number;
  returnTo: string;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        "mb-5 break-inside-avoid overflow-hidden rounded-[1.6rem]",
        "border border-[#242617]/10 bg-white/70 shadow-[0_12px_40px_rgba(20,20,10,0.06)]",
        "transition-shadow",
        isDragging ? "shadow-[0_24px_70px_rgba(20,20,10,0.18)]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative overflow-hidden bg-[#e8dfcf]">
        <img
          src={item.imageSrc}
          alt={item.title}
          draggable={false}
          className="block h-auto w-full select-none"
        />

        <div className="absolute left-3 top-3 rounded-full bg-[#071008]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f4efe4] backdrop-blur-sm">
          {String(position + 1).padStart(2, "0")}
        </div>

        <button
          type="button"
          disabled={disabled}
          {...attributes}
          {...listeners}
          aria-label={`Move ${item.title}`}
          title="Drag to reorder"
          className="absolute right-3 top-3 flex h-11 w-11 touch-none cursor-grab items-center justify-center rounded-full bg-[#f4efe4]/95 text-[#242617] shadow-lg backdrop-blur-sm transition hover:scale-105 active:cursor-grabbing disabled:cursor-wait disabled:opacity-50"
        >
          <GripVertical size={19} strokeWidth={1.8} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-[#242617]/45">
            {item.status}
          </span>

          {item.featured ? (
            <span className="rounded-full border border-[#b88a3b]/25 bg-[#b88a3b]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-[#b88a3b]">
              Featured
            </span>
          ) : null}

          <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-[#242617]/40">
            {watermarkLabel(item.watermark)}
          </span>
        </div>

        <h3 className="mt-4 font-serif text-2xl uppercase leading-none tracking-[-0.035em] text-[#242617]">
          {item.title}
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/admin/portfolio/${item.id}`}
            className="rounded-full border border-[#242617]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
          >
            Edit
          </Link>

          <form action={deletePortfolioGalleryPhoto.bind(null, item.id)}>
            <input type="hidden" name="returnTo" value={returnTo} />
            <button
              type="submit"
              className="cursor-pointer rounded-full border border-red-900/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-red-900/50 transition hover:border-red-800/40 hover:text-red-900"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

export function PortfolioPhotoSorter({
  categoryId,
  returnTo,
  initialItems,
}: PortfolioPhotoSorterProps) {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id || saveState === "saving") {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);

    setItems(next);
    setSaveState("saving");

    try {
      await reorderPortfolioGalleryPhotos(
        categoryId,
        next.map((item) => item.id),
      );

      setSaveState("saved");

      window.setTimeout(() => {
        setSaveState("idle");
      }, 1600);
    } catch {
      setItems(previous);
      setSaveState("error");
    }
  }

  if (!mounted) {
    return (
      <div className="p-8 text-sm text-[#242617]/45">
        Loading photo manager...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 border-b border-[#242617]/10 px-6 py-4 sm:flex-row sm:items-center">
        <p className="max-w-xl text-xs leading-5 text-[#242617]/45">
          Drag photos by the handle to change their public display order.
          Changes are saved automatically.
        </p>

        <div
          className={[
            "text-[10px] font-bold uppercase tracking-[0.16em]",
            saveState === "error"
              ? "text-red-700"
              : saveState === "saved"
                ? "text-emerald-700"
                : "text-[#242617]/40",
          ].join(" ")}
        >
          {saveState === "saving"
            ? "Saving order..."
            : saveState === "saved"
              ? "Order saved"
              : saveState === "error"
                ? "Could not save — try again"
                : "Drag & drop enabled"}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="columns-1 gap-5 p-5 sm:columns-2 xl:columns-3">
            {items.map((item, index) => (
              <SortablePhoto
                key={item.id}
                item={item}
                position={index}
                returnTo={returnTo}
                disabled={saveState === "saving"}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
