"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { stories, storyCategories } from "@/data/stories";

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
        className="flex w-full items-center justify-between gap-4 border border-[#242617]/35 bg-[#f4efe4]/95 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] transition hover:border-[#596044]/70"
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
            className={`block w-full px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.13em] transition ${
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

export function StoriesArchive() {
  const [category, setCategory] = useState("All stories");
  const [sort, setSort] = useState("latest");

  const filteredStories = useMemo(() => {
    const result =
      category === "All stories"
        ? stories
        : stories.filter((story) => story.category === category);

    return [...result].sort((a, b) =>
      sort === "latest"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date),
    );
  }, [category, sort]);

  const primaryStory = filteredStories[0];
  const remainingStories = filteredStories.slice(1, 9);

  const categoryOptions = storyCategories.map((item) => ({
    value: item,
    label: item,
  }));

  return (
    <section className="bg-[#f4efe4] px-6 py-14 md:px-14 md:py-20">
      <div className="mx-auto max-w-[1450px]">
        <div className="border-b border-[#242617]/15 pb-8">
          <p className="mb-7 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#242617]/55">
            Browse by category
          </p>

          {/* Mobile and tablet controls */}
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

          {/* Desktop controls */}
          <div className="hidden items-end justify-between gap-8 lg:flex">
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              {storyCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.13em] transition ${
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
            {/* First result displayed in the large format */}
            <article className="grid items-center gap-10 border-b border-[#242617]/15 py-12 lg:grid-cols-[1.25fr_0.8fr]">
              <Link
                href={`/stories/${primaryStory.slug}`}
                className="block min-h-[310px] bg-[#cfc8bb] bg-cover bg-center transition-opacity hover:opacity-90 md:min-h-[390px]"
                style={{
                  backgroundImage: `url(${primaryStory.image.src})`,
                }}
                aria-label={primaryStory.title}
              />

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
                    
              <img
                src="/images/about/hero_drawing_01.png"
                alt=""
                className="pointer-events-none absolute -bottom-53 right-0 rotate-25 hidden w-68 opacity-30 md:block"
              />
                    
              </div>
            </article>

            {/* Remaining results */}
            {remainingStories.length > 0 && (
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
                          backgroundImage: `url(${story.image.src})`,
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
            )}
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
          <Link
            href="/stories/all"
            className="inline-block border border-[#242617]/45 px-10 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] transition hover:bg-[#242617] hover:text-[#f4efe4]"
          >
            View all stories
          </Link>
        </div>
      </div>
    </section>
  );
}