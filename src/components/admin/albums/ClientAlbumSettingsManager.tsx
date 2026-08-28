"use client";

import type { CSSProperties, ReactNode } from "react";
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { reorderClientAlbums } from "@/server/actions/albums";

export type ClientAlbumSettingsItem = {
  id: string;
  title: string;
  slug: string;
  coverSrc: string;
  status: string;
  location: string;
  photoCount: number;
  order: number;
};

function RowLayout({
  item,
  position,
  dragHandle,
}: {
  item: ClientAlbumSettingsItem;
  position: number;
  dragHandle: ReactNode;
}) {
  return (
    <div className="grid min-w-0 items-center gap-4 p-4 sm:grid-cols-[42px_86px_minmax(0,1fr)] lg:grid-cols-[42px_86px_minmax(0,1fr)_auto]">
      <div className="flex justify-center">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#071321] text-[10px] font-bold tracking-[0.12em] text-[#f4efe4]">
          {String(position + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[#e8dfcf]">
        {item.coverSrc ? (
          <img
            src={item.coverSrc}
            alt=""
            draggable={false}
            className="h-full w-full select-none object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#242617]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-[#242617]/45">
            {item.status}
          </span>
          <span className="rounded-full border border-[#242617]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-[#242617]/40">
            {item.photoCount} {item.photoCount === 1 ? "photo" : "photos"}
          </span>
        </div>

        <h3 className="mt-2 truncate font-serif text-xl leading-tight text-[#242617] sm:text-2xl">
          {item.title}
        </h3>

        <p className="mt-1 truncate text-[11px] text-[#242617]/35">
          /portfolio/{item.slug}
        </p>
      </div>

      <div className="col-span-full flex items-center justify-end gap-2 lg:col-span-1">
        <Link
          href={`/client-albums/${item.slug}`}
          target="_blank"
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#242617]/12 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45 transition hover:border-[#071321] hover:text-[#071321]"
        >
          Preview
        </Link>

        <Link
          href={`/admin/albums/${item.id}`}
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#242617]/12 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45 transition hover:border-[#071321] hover:text-[#071321]"
        >
          Edit
        </Link>

        {dragHandle}
      </div>
    </div>
  );
}

function StaticRow({
  item,
  position,
}: {
  item: ClientAlbumSettingsItem;
  position: number;
}) {
  return (
    <article className="overflow-hidden rounded-[1.4rem] border border-[#242617]/10 bg-white/50">
      <RowLayout
        item={item}
        position={position}
        dragHandle={
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#242617]/10 text-[#242617]/25">
            <GripVertical size={17} />
          </span>
        }
      />
    </article>
  );
}

function SortableRow({
  item,
  position,
  disabled,
}: {
  item: ClientAlbumSettingsItem;
  position: number;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.66 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden rounded-[1.4rem] border bg-white/55 transition-shadow ${
        isDragging
          ? "border-[#b88a3b]/50 shadow-[0_24px_70px_rgba(20,20,10,0.2)]"
          : "border-[#242617]/10 shadow-[0_10px_35px_rgba(20,20,10,0.04)]"
      }`}
    >
      <RowLayout
        item={item}
        position={position}
        dragHandle={
          <button
            type="button"
            disabled={disabled}
            {...attributes}
            {...listeners}
            aria-label={`Move ${item.title}`}
            title="Drag to reorder"
            className="grid h-10 w-10 touch-none cursor-grab place-items-center rounded-full bg-[#071321] text-[#f4efe4] transition hover:bg-[#b88a3b] active:cursor-grabbing disabled:cursor-wait disabled:opacity-45"
          >
            <GripVertical size={17} strokeWidth={1.8} />
          </button>
        }
      />
    </article>
  );
}

export function ClientAlbumSettingsManager({
  initialItems,
}: {
  initialItems: ClientAlbumSettingsItem[];
}) {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [state, setState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  useEffect(() => {
    setMounted(true);
  }, []);

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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id || state === "saving") return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    const previousItems = items;
    const nextItems = arrayMove(items, oldIndex, newIndex).map(
      (item, order) => ({ ...item, order }),
    );

    setItems(nextItems);
    setState("saving");

    try {
      await reorderClientAlbums(nextItems.map((item) => item.id));
      setState("saved");
      window.setTimeout(() => setState("idle"), 1600);
    } catch {
      setItems(previousItems);
      setState("error");
    }
  }

  const stateLabel =
    state === "saving"
      ? "Saving order..."
      : state === "saved"
        ? "Order saved"
        : state === "error"
          ? "Order could not be saved"
          : "Changes save automatically";

  if (!mounted) {
    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <StaticRow key={item.id} item={item} position={index} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs leading-5 text-[#242617]/45">
          Drag Client Albums by their handle to change their public display order.
        </p>

        <span
          className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
            state === "error"
              ? "text-red-900/65"
              : state === "saved"
                ? "text-emerald-800/65"
                : "text-[#242617]/35"
          }`}
        >
          {stateLabel}
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {items.map((item, index) => (
              <SortableRow
                key={item.id}
                item={item}
                position={index}
                disabled={state === "saving"}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
