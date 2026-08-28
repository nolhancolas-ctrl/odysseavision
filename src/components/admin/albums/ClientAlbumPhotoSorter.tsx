"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
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
  deleteClientAlbumPhoto,
  reorderClientAlbumPhotos,
  updateClientAlbumPhotoWatermark,
} from "@/server/actions/albums";

type ClientAlbumPhoto = {
  id: string;
  imageSrc: string;
  title: string;
  watermark: string;
  order: number;
};

type ClientAlbumPhotoSorterProps = {
  albumId: string;
  initialItems: ClientAlbumPhoto[];
};

function watermarkLabel(value: string) {
  if (value === "ANDREW") return "Andrew";
  if (value === "MORGANE") return "Morgane";
  return "None";
}

function SortablePhoto({
  item,
  position,
  disabled,
  onWatermarkChange,
  onDelete,
}: {
  item: ClientAlbumPhoto;
  position: number;
  disabled: boolean;
  onWatermarkChange: (id: string, watermark: string) => void;
  onDelete: (id: string, title: string) => void;
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

  const watermarkEnabled =
    item.watermark === "ANDREW" || item.watermark === "MORGANE";

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        "mb-5 break-inside-avoid overflow-hidden rounded-[1.6rem] border border-[#242617]/10",
        "bg-white/70 shadow-[0_12px_40px_rgba(20,20,10,0.06)]",
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
        <h3 className="truncate font-serif text-xl uppercase leading-none tracking-[-0.035em] text-[#242617]">
          {item.title}
        </h3>

        <div className="mt-4 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#242617]/45">
                Watermark
              </p>
              <p className="mt-1 truncate text-xs text-[#242617]/55">
                {watermarkLabel(item.watermark)}
              </p>
            </div>

            <button
              type="button"
              disabled={disabled}
              aria-pressed={watermarkEnabled}
              onClick={() =>
                onWatermarkChange(
                  item.id,
                  watermarkEnabled ? "NONE" : "ANDREW",
                )
              }
              className={[
                "relative h-8 w-14 shrink-0 rounded-full border transition",
                watermarkEnabled
                  ? "border-[#b88a3b]/40 bg-[#242617]"
                  : "border-[#242617]/12 bg-[#e8dfcf]",
                disabled ? "cursor-wait opacity-50" : "cursor-pointer",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
                  watermarkEnabled ? "left-7" : "left-1",
                ].join(" ")}
              />
            </button>
          </div>

          {watermarkEnabled ? (
            <div className="mt-4 grid grid-cols-2 rounded-full border border-[#242617]/10 bg-[#e8dfcf]/80 p-1">
              {(["ANDREW", "MORGANE"] as const).map((owner) => (
                <button
                  key={owner}
                  type="button"
                  disabled={disabled}
                  onClick={() => onWatermarkChange(item.id, owner)}
                  className={[
                    "rounded-full px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] transition",
                    item.watermark === owner
                      ? "bg-[#242617] text-[#f4efe4]"
                      : "text-[#242617]/45 hover:bg-white/60",
                    disabled ? "cursor-wait opacity-50" : "cursor-pointer",
                  ].join(" ")}
                >
                  {owner}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(item.id, item.title)}
          className="mt-3 w-full cursor-pointer rounded-full border border-red-900/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-red-900/50 transition hover:border-red-800/40 hover:bg-red-900 hover:text-white disabled:cursor-wait disabled:opacity-40"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export function ClientAlbumPhotoSorter({
  albumId,
  initialItems,
}: ClientAlbumPhotoSorterProps) {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function showSaved() {
    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 1600);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id || saveState === "saving" || busyId) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);

    setItems(next);
    setSaveState("saving");

    try {
      await reorderClientAlbumPhotos(
        albumId,
        next.map((item) => item.id),
      );
      showSaved();
    } catch {
      setItems(previous);
      setSaveState("error");
    }
  }

  async function changeWatermark(imageId: string, watermark: string) {
    if (busyId || saveState === "saving") return;

    const previous = items;

    setItems((current) =>
      current.map((item) =>
        item.id === imageId ? { ...item, watermark } : item,
      ),
    );
    setBusyId(imageId);
    setSaveState("saving");

    try {
      await updateClientAlbumPhotoWatermark(imageId, watermark);
      showSaved();
    } catch {
      setItems(previous);
      setSaveState("error");
    } finally {
      setBusyId(null);
    }
  }

  async function removePhoto(imageId: string, title: string) {
    if (
      busyId ||
      saveState === "saving" ||
      !window.confirm(`Delete "${title}" from this album?`)
    ) {
      return;
    }

    setBusyId(imageId);
    setSaveState("saving");

    try {
      await deleteClientAlbumPhoto(imageId);
      setItems((current) =>
        current.filter((item) => item.id !== imageId),
      );
      showSaved();
    } catch {
      setSaveState("error");
    } finally {
      setBusyId(null);
    }
  }

  if (!mounted) {
    return (
      <div className="p-8 text-sm text-[#242617]/45">
        Loading photo manager...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-sm text-[#242617]/50">
        No photos in this album yet.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 border-b border-[#242617]/10 px-6 py-4 sm:flex-row sm:items-center">
        <p className="max-w-xl text-xs leading-5 text-[#242617]/45">
          Drag photos by the handle to change their public display order.
          Watermark and order changes are saved automatically.
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
            ? "Saving..."
            : saveState === "saved"
              ? "Changes saved"
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
                disabled={saveState === "saving" || busyId !== null}
                onWatermarkChange={changeWatermark}
                onDelete={removePhoto}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
