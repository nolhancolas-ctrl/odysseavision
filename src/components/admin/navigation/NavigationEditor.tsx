"use client";

import { useMemo, useState } from "react";
import type {
  NavigationLink,
  NavigationSettings,
  SocialLink,
} from "@/lib/content/navigation";

type NavigationEditorProps = {
  settings: NavigationSettings;
  updateAction: (formData: FormData) => Promise<void>;
  resetAction: () => Promise<void>;
};

function reorder<T extends { order: number }>(items: T[]) {
  return items.map((item, index) => ({ ...item, order: index }));
}

function moveItem<T extends { order: number }>(
  items: T[],
  index: number,
  direction: -1 | 1,
) {
  const nextIndex = index + direction;

  if (nextIndex < 0 || nextIndex >= items.length) return items;

  const copy = [...items];
  const current = copy[index];
  copy[index] = copy[nextIndex];
  copy[nextIndex] = current;

  return reorder(copy);
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[#242617]/10 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-3xl uppercase leading-none text-[#242617]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#242617]/55">
        {description}
      </p>
    </div>
  );
}

function LinkRow({
  item,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  item: NavigationLink;
  index: number;
  total: number;
  onChange: (item: NavigationLink) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-4 border-b border-[#242617]/10 p-5 last:border-b-0 lg:grid-cols-[70px_1fr_1.4fr_130px_90px] lg:items-center">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#242617]/15 text-[#242617]/45 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b] disabled:pointer-events-none disabled:opacity-25"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#242617]/15 text-[#242617]/45 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b] disabled:pointer-events-none disabled:opacity-25"
        >
          ↓
        </button>
      </div>

      <input
        value={item.label}
        onChange={(event) => onChange({ ...item, label: event.target.value })}
        placeholder="Label"
        className="rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
      />

      <input
        value={item.href}
        onChange={(event) => onChange({ ...item, href: event.target.value })}
        placeholder="/about"
        className="rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
      />

      <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/55 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#242617]/55">
        <input
          type="checkbox"
          checked={item.visible}
          onChange={(event) =>
            onChange({ ...item, visible: event.target.checked })
          }
          className="h-4 w-4 accent-[#b88a3b]"
        />
        Visible
      </label>

      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer rounded-full border border-red-900/20 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]"
      >
        Remove
      </button>
    </div>
  );
}

function SocialRow({
  item,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  item: SocialLink;
  index: number;
  total: number;
  onChange: (item: SocialLink) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-4 border-b border-[#242617]/10 p-5 last:border-b-0 lg:grid-cols-[70px_1fr_90px_1.4fr_130px_90px] lg:items-center">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#242617]/15 text-[#242617]/45 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b] disabled:pointer-events-none disabled:opacity-25"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#242617]/15 text-[#242617]/45 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b] disabled:pointer-events-none disabled:opacity-25"
        >
          ↓
        </button>
      </div>

      <input
        value={item.label}
        onChange={(event) => onChange({ ...item, label: event.target.value })}
        placeholder="Instagram"
        className="rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
      />

      <input
        value={item.shortLabel}
        onChange={(event) =>
          onChange({ ...item, shortLabel: event.target.value })
        }
        placeholder="Ig"
        className="rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
      />

      <input
        value={item.href}
        onChange={(event) => onChange({ ...item, href: event.target.value })}
        placeholder="https://..."
        className="rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
      />

      <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/55 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#242617]/55">
        <input
          type="checkbox"
          checked={item.visible}
          onChange={(event) =>
            onChange({ ...item, visible: event.target.checked })
          }
          className="h-4 w-4 accent-[#b88a3b]"
        />
        Visible
      </label>

      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer rounded-full border border-red-900/20 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]"
      >
        Remove
      </button>
    </div>
  );
}

export function NavigationEditor({
  settings,
  updateAction,
  resetAction,
}: NavigationEditorProps) {
  const [mainLinks, setMainLinks] = useState(settings.mainLinks);
  const [footerLinks, setFooterLinks] = useState(settings.footerLinks);
  const [socialLinks, setSocialLinks] = useState(settings.socialLinks);
  const [footerCopyright, setFooterCopyright] = useState(
    settings.footerCopyright,
  );
  const [footerTagline, setFooterTagline] = useState(settings.footerTagline);

  const payload = useMemo(
    () =>
      JSON.stringify({
        mainLinks: reorder(mainLinks),
        footerLinks: reorder(footerLinks),
        socialLinks: reorder(socialLinks),
        footerCopyright,
        footerTagline,
      }),
    [mainLinks, footerLinks, socialLinks, footerCopyright, footerTagline],
  );

  const updateMainLink = (index: number, item: NavigationLink) => {
    setMainLinks((current) =>
      current.map((link, currentIndex) =>
        currentIndex === index ? item : link,
      ),
    );
  };

  const updateFooterLink = (index: number, item: NavigationLink) => {
    setFooterLinks((current) =>
      current.map((link, currentIndex) =>
        currentIndex === index ? item : link,
      ),
    );
  };

  const updateSocialLink = (index: number, item: SocialLink) => {
    setSocialLinks((current) =>
      current.map((link, currentIndex) =>
        currentIndex === index ? item : link,
      ),
    );
  };

  const addMainLink = () => {
    setMainLinks((current) => [
      ...current,
      {
        id: `main-${Date.now()}`,
        label: "New link",
        href: "/",
        visible: true,
        order: current.length,
      },
    ]);
  };

  const addFooterLink = () => {
    setFooterLinks((current) => [
      ...current,
      {
        id: `footer-${Date.now()}`,
        label: "New link",
        href: "/",
        visible: true,
        order: current.length,
      },
    ]);
  };

  const addSocialLink = () => {
    setSocialLinks((current) => [
      ...current,
      {
        id: `social-${Date.now()}`,
        label: "New social",
        shortLabel: "So",
        href: "https://",
        visible: true,
        order: current.length,
      },
    ]);
  };

  return (
    <form action={updateAction} className="space-y-8">
      <input type="hidden" name="navigationSettings" value={payload} />

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <SectionTitle
          eyebrow="Header"
          title="Main menu"
          description="Control the links shown in the public site header and mobile menu."
        />

        <div>
          {mainLinks.map((item, index) => (
            <LinkRow
              key={item.id}
              item={item}
              index={index}
              total={mainLinks.length}
              onChange={(nextItem) => updateMainLink(index, nextItem)}
              onMove={(direction) =>
                setMainLinks((current) => moveItem(current, index, direction))
              }
              onRemove={() =>
                setMainLinks((current) =>
                  reorder(current.filter((_, currentIndex) => currentIndex !== index)),
                )
              }
            />
          ))}
        </div>

        <div className="border-t border-[#242617]/10 p-5">
          <button
            type="button"
            onClick={addMainLink}
            className="cursor-pointer rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
          >
            Add header link
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <SectionTitle
          eyebrow="Footer"
          title="Footer menu"
          description="Control the navigation links displayed in the footer."
        />

        <div>
          {footerLinks.map((item, index) => (
            <LinkRow
              key={item.id}
              item={item}
              index={index}
              total={footerLinks.length}
              onChange={(nextItem) => updateFooterLink(index, nextItem)}
              onMove={(direction) =>
                setFooterLinks((current) => moveItem(current, index, direction))
              }
              onRemove={() =>
                setFooterLinks((current) =>
                  reorder(current.filter((_, currentIndex) => currentIndex !== index)),
                )
              }
            />
          ))}
        </div>

        <div className="border-t border-[#242617]/10 p-5">
          <button
            type="button"
            onClick={addFooterLink}
            className="cursor-pointer rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
          >
            Add footer link
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <SectionTitle
          eyebrow="Footer"
          title="Social links"
          description="Edit the circular social buttons shown on the footer."
        />

        <div>
          {socialLinks.map((item, index) => (
            <SocialRow
              key={item.id}
              item={item}
              index={index}
              total={socialLinks.length}
              onChange={(nextItem) => updateSocialLink(index, nextItem)}
              onMove={(direction) =>
                setSocialLinks((current) => moveItem(current, index, direction))
              }
              onRemove={() =>
                setSocialLinks((current) =>
                  reorder(current.filter((_, currentIndex) => currentIndex !== index)),
                )
              }
            />
          ))}
        </div>

        <div className="border-t border-[#242617]/10 p-5">
          <button
            type="button"
            onClick={addSocialLink}
            className="cursor-pointer rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
          >
            Add social link
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <SectionTitle
          eyebrow="Footer"
          title="Footer text"
          description="Edit the copyright line and footer tagline."
        />

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40">
              Copyright
            </label>
            <input
              value={footerCopyright}
              onChange={(event) => setFooterCopyright(event.target.value)}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40">
              Tagline
            </label>
            <input
              value={footerTagline}
              onChange={(event) => setFooterTagline(event.target.value)}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-[2rem] border border-[#242617]/10 bg-[#f4efe4]/90 p-4 shadow-[0_20px_60px_rgba(20,20,10,0.16)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#242617]/55">
          Save to update the public header and footer instantly.
        </p>

        <div className="flex gap-3">
          <button
            formAction={resetAction}
            className="cursor-pointer rounded-full border border-red-900/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-red-900/60 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]"
          >
            Reset
          </button>

          <button
            type="submit"
            className="cursor-pointer rounded-full bg-[#071321] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#142844]"
          >
            Save navigation
          </button>
        </div>
      </div>
    </form>
  );
}
