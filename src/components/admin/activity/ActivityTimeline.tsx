"use client";

import Link from "next/link";
import { useState } from "react";
import type { AdminActivityItem } from "@/lib/admin/activity";

function CategoryPill({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-[#d5ad68]/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a6314]">
      {children}
    </span>
  );
}

function ActivityDetailsModal({
  item,
  onClose,
}: {
  item: AdminActivityItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close activity details"
        onClick={onClose}
        className="absolute inset-0 bg-[#071321]/45 backdrop-blur-md"
      />

      <article className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-[#f4efe4]/15 bg-[#f4efe4] p-6 text-[#242617] shadow-[0_30px_100px_rgba(7,19,33,0.28)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
              Activity details
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-none tracking-[-0.04em]">
              {item.modalTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#242617]/10 text-xl text-[#242617]/55 transition hover:bg-[#071321] hover:text-[#f4efe4]"
          >
            ×
          </button>
        </div>

        <p className="mt-5 rounded-3xl border border-[#242617]/8 bg-white/45 p-4 text-sm leading-7 text-[#242617]/65">
          {item.modalDescription}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#242617]/8 bg-white/45 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#242617]/38">
              Category
            </p>
            <p className="mt-2 text-sm font-semibold">{item.category}</p>
          </div>

          <div className="rounded-3xl border border-[#242617]/8 bg-white/45 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#242617]/38">
              Date
            </p>
            <p className="mt-2 text-sm font-semibold">{item.fullDate}</p>
          </div>
        </div>

        {item.metadata.length > 0 ? (
          <div className="mt-5 max-h-[34vh] space-y-2 overflow-y-auto pr-1">
            {item.metadata.map((meta) => (
              <div
                key={`${meta.label}-${meta.value}`}
                className="grid gap-2 rounded-2xl border border-[#242617]/8 bg-white/35 px-4 py-3 sm:grid-cols-[150px_1fr]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#242617]/38">
                  {meta.label}
                </p>
                <p className="min-w-0 break-words text-sm text-[#242617]/70">
                  {meta.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}

function ActivityRow({
  item,
  onOpen,
}: {
  item: AdminActivityItem;
  onOpen: () => void;
}) {
  const className =
    "group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-t border-[#242617]/8 px-1 py-4 text-left transition first:border-t-0 hover:opacity-70";

  const content = (
    <>
      <span className="min-w-0">
        <span className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="truncate text-sm font-semibold text-[#242617]">
            {item.title}
          </span>
          <CategoryPill>{item.category}</CategoryPill>
          <span className="truncate text-sm text-[#242617]/45">
            {item.detail}
          </span>
          {!item.href ? (
            <span className="rounded-full border border-[#242617]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#242617]/35">
              Details
            </span>
          ) : null}
        </span>
      </span>

      <span className="shrink-0 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-[#242617]/38">
        {item.date}
      </span>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onOpen} className={className}>
      {content}
    </button>
  );
}

export function ActivityTimeline({ items }: { items: AdminActivityItem[] }) {
  const [selectedItem, setSelectedItem] = useState<AdminActivityItem | null>(
    null
  );

  return (
    <>
      <section className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        {items.length > 0 ? (
          <div>
            {items.map((item) => (
              <ActivityRow
                key={item.id}
                item={item}
                onOpen={() => setSelectedItem(item)}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-[#242617]/8 bg-[#f4efe4]/55 p-5 text-sm text-[#242617]/45">
            No activity yet.
          </p>
        )}
      </section>

      {selectedItem ? (
        <ActivityDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </>
  );
}
