"use client";

import Link from "next/link";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PublicSectionContent } from "@/lib/content/site";
import type { PublicStory } from "@/lib/content/stories";

type StoriesArchiveProps = {
  stories: PublicStory[];
  storyCategories: string[];
  content?: PublicSectionContent;
};

type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
  label: string;
};

function Dropdown({
  value,
  options,
  onChange,
  className = "",
  label,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    options.find((option) => option.value === value)?.label ?? value;

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className={`relative z-40 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 border border-[#242617]/35 bg-[#f4efe4]/95 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] transition hover:border-[#596044]/70"
      >
        <span className="truncate">{currentLabel}</span>
        <span
          className={`h-2 w-2 shrink-0 border-b border-r border-current transition-transform duration-200 ${
            open
              ? "translate-y-0.5 rotate-[225deg]"
              : "-translate-y-0.5 rotate-45"
          }`}
        />
      </button>

      <div
        role="listbox"
        aria-label={label}
        aria-hidden={!open}
        className={`absolute right-0 top-[calc(100%+6px)] w-full origin-top border border-[#242617]/20 bg-[#f4efe4] p-1 shadow-[0_14px_30px_rgba(36,38,23,0.16)] transition-[opacity,transform] duration-200 ease-out ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
        }`}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            tabIndex={open ? 0 : -1}
            aria-selected={value === option.value}
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
            className={`block w-full cursor-pointer px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.13em] transition ${
              value === option.value
                ? "bg-[#596044] text-[#f4efe4]"
                : "text-[#242617]/70 hover:bg-[#e8dfcf] hover:text-[#242617]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
];

export function StoriesArchive({
  stories,
  storyCategories,
  content,
}: StoriesArchiveProps) {
  const [category, setCategory] = useState("All stories");
  const [sort, setSort] = useState("latest");

  const safeStories = Array.isArray(stories) ? stories : [];
  const safeCategories =
    Array.isArray(storyCategories) && storyCategories.length > 0
      ? storyCategories
      : ["All stories"];

  const filteredStories = useMemo(() => {
    const result =
      category === "All stories"
        ? safeStories
        : safeStories.filter((story) => story.category === category);

    return result.slice().sort((a, b) =>
      sort === "latest"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date),
    );
  }, [category, sort, safeStories]);

  const primaryStory = filteredStories[0];
  const remainingStories = filteredStories.slice(1, 9);

  const categoryOptions = safeCategories.map((item) => ({
    value: item,
    label: item,
  }));

  const ornament =
    content?.images.ornament || "/images/about/hero_drawing_01.png";

  return (
    <section className="bg-[#f4efe4] px-6 py-14 md:px-14 md:py-20">
      <div className="mx-auto max-w-[1450px]">
        <div className="border-b border-[#242617]/15 pb-8">
          <p className="mb-7 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#242617]/55">
            {content?.eyebrow || "Browse by category"}
          </p>

          <div className="flex gap-3 lg:hidden">
            <Dropdown
              value={category}
              options={categoryOptions}
              onChange={setCategory}
              label="Choose a story category"
              className="min-w-0 flex-1"
            />

            <Dropdown
              value={sort}
              options={sortOptions}
              onChange={setSort}
              label="Sort stories"
              className="w-36 shrink-0"
            />
          </div>

          <div className="hidden items-end justify-between gap-8 lg:flex">
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              {safeCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`cursor-pointer border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.13em] transition ${
                    category === item
                      ? "border-[#242617] text-[#242617]"
                      : "border-transparent text-[#242617]/55 hover:text-[#242617]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <Dropdown
              value={sort}
              options={sortOptions}
              onChange={setSort}
              label="Sort stories"
              className="w-36 shrink-0"
            />
          </div>
        </div>

        {primaryStory ? (
          <>
            <article className="grid items-center gap-10 border-b border-[#242617]/15 py-12 lg:grid-cols-[1.25fr_0.8fr]">
              <Link
                href={`/stories/${primaryStory.slug}`}
                className="relative block min-h-[310px] overflow-hidden bg-[#cfc8bb] bg-cover bg-center transition-opacity hover:opacity-90 md:min-h-[390px]"
                style={{
                  backgroundImage: `url(${primaryStory.imageSrc})`,
                }}
                aria-label={primaryStory.title}
              >
                <FrameWatermark />
              </Link>

              <div className="relative max-w-lg">
                <p className="text-right text-[9px] font-semibold uppercase tracking-[0.2em] text-[#242617]/55">
                  {primaryStory.category}
                </p>

                <h2 className="mt-5 font-serif text-4xl uppercase leading-[1.05]">
                  {primaryStory.title}
                </h2>

                <div className="my-6 h-px w-10 bg-[#242617]/35" />

                <p className="text-sm leading-7 text-[#242617]/65">
                  {primaryStory.description}
                </p>

                <p className="mt-5 text-[10px] text-[#242617]/50">
                  {primaryStory.displayDate}
                  &nbsp; · &nbsp;
                  {primaryStory.readTime}
                </p>

                <Link
                  href={`/stories/${primaryStory.slug}`}
                  className="mt-7 inline-block bg-[#414832] px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#596044]"
                >
                  Read the story
                </Link>

                {ornament ? (
                  <img
                    src={ornament}
                    alt=""
                    className="pointer-events-none absolute -bottom-53 right-0 hidden w-68 rotate-25 opacity-30 md:block"
                  />
                ) : null}
              </div>
            </article>

            {remainingStories.length > 0 ? (
              <div className="grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
                {remainingStories.map((story) => (
                  <article
                    key={story.slug}
                    className="border border-[#242617]/12 bg-[#f7f2e8]"
                  >
                    <Link
                      href={`/stories/${story.slug}`}
                      className="group block"
                    >
                      <div
                        className="aspect-[1.42] bg-[#d4cdc0] bg-cover bg-center transition duration-700 group-hover:opacity-90"
                        style={{
                          backgroundImage: `url(${story.imageSrc})`,
                        }}
                      />

                      <div className="p-5">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#242617]/55">
                          {story.category}
                        </p>

                        <h2 className="mt-3 font-serif text-2xl uppercase leading-[1.05]">
                          {story.title}
                        </h2>

                        <p className="mt-4 text-xs leading-6 text-[#242617]/60">
                          {story.description}
                        </p>

                        <p className="mt-5 text-[9px] text-[#242617]/45">
                          {story.displayDate}
                          &nbsp; · &nbsp;
                          {story.readTime}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="py-20 text-center text-sm text-[#242617]/55">
            No stories found in this category.
          </p>
        )}

        <div
          className={
            remainingStories.length === 0
              ? "pt-8 text-center"
              : "text-center"
          }
        >
          <button
            type="button"
            className="cursor-pointer border border-[#242617]/25 px-8 py-3 text-[9px] font-semibold uppercase tracking-[0.18em] transition hover:border-[#596044] hover:bg-[#596044] hover:text-[#f4efe4]"
          >
            {content?.ctaLabel || "Load more stories"}
          </button>
        </div>
      </div>
    </section>
  );
}
