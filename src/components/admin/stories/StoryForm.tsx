"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import type { Story, StoryCategory } from "@prisma/client";
import { AdminImageDropzone } from "@/components/admin/uploads/AdminImageDropzone";
import { StoryRichTextEditor } from "@/components/admin/stories/StoryRichTextEditor";
import {
  StoryChangesPreview,
  type StoryChangeSnapshot,
} from "@/components/admin/stories/StoryChangesPreview";
import {
  discardStoryDraft,
  saveStoryDraft,
  saveStoryChanges,
} from "@/server/actions/stories";

type StoryWithCategory = Story & {
  category: StoryCategory | null;
};

type StoryFormProps = {
  story?: StoryWithCategory | null;
  categories: StoryCategory[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  typographyStyle?: CSSProperties;
};

type StatusValue = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type CategoryValue = string | "__new__";

type StoryDraftData = Record<string, unknown>;

function readStoryDraft(value: unknown): StoryDraftData | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as StoryDraftData;
}

function draftText(
  draft: StoryDraftData | null,
  key: string,
  fallback: string,
) {
  return typeof draft?.[key] === "string"
    ? String(draft[key])
    : fallback;
}


const statusOptions: Array<{
  value: StatusValue;
  label: string;
  description: string;
}> = [
  {
    value: "DRAFT",
    label: "Draft",
    description: "Hidden from the public website.",
  },
  {
    value: "PUBLISHED",
    label: "Published",
    description: "Visible on the public Stories page.",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
    description: "Kept in admin but removed from public flow.",
  },
];

function fieldLabelClass() {
  return "mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40";
}

function inputClass() {
  return "w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70";
}

function textareaClass() {
  return "w-full resize-none rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm leading-7 text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70";
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={fieldLabelClass()}>{label}</label>
      {children}
      {help ? (
        <p className="mt-2 text-xs leading-5 text-[#242617]/40">{help}</p>
      ) : null}
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: StatusValue;
  onChange: (value: StatusValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected =
    statusOptions.find((option) => option.value === value) ?? statusOptions[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-5 rounded-2xl border bg-[#f4efe4]/80 px-4 py-3 text-left transition ${
          open
            ? "border-[#b88a3b]/70"
            : "border-[#242617]/10 hover:border-[#b88a3b]/55"
        }`}
      >
        <span>
          <span className="block text-sm font-semibold text-[#242617]">
            {selected.label}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#242617]/42">
            {selected.description}
          </span>
        </span>

        <span
          className={`h-2.5 w-2.5 shrink-0 border-r border-t border-[#242617]/55 transition-transform duration-200 ${
            open ? "-translate-y-0.5 rotate-[135deg]" : "rotate-[45deg]"
          }`}
        />
      </button>

      <div
        role="listbox"
        aria-hidden={!open}
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#242617]/12 bg-[#f4efe4] p-1 shadow-[0_18px_45px_rgba(36,38,23,0.16)] transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {statusOptions.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full cursor-pointer rounded-xl px-4 py-3 text-left transition ${
                isSelected
                  ? "bg-[#071321] text-[#f4efe4]"
                  : "text-[#242617]/60 hover:bg-[#e8dfcf] hover:text-[#242617]"
              }`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em]">
                {option.label}
              </span>
              <span
                className={`mt-1 block text-xs leading-5 ${
                  isSelected ? "text-[#f4efe4]/62" : "text-[#242617]/42"
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategorySelect({
  value,
  categories,
  error,
  onChange,
}: {
  value: CategoryValue;
  categories: StoryCategory[];
  error: string;
  onChange: (value: CategoryValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find((category) => category.id === value);

  const selectedLabel =
    value === "__new__"
      ? "New category"
      : selectedCategory?.name || "Choose a category";

  const selectedDescription =
    value === "__new__"
      ? "Create a new category for this story."
      : selectedCategory
        ? "Existing story category."
        : "A category is required before saving.";

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-5 rounded-2xl border bg-[#f4efe4]/80 px-4 py-3 text-left transition ${
          error
            ? "border-red-900/45"
            : open
              ? "border-[#b88a3b]/70"
              : "border-[#242617]/10 hover:border-[#b88a3b]/55"
        }`}
      >
        <span>
          <span
            className={`block text-sm font-semibold ${
              value ? "text-[#242617]" : "text-[#242617]/38"
            }`}
          >
            {selectedLabel}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#242617]/42">
            {selectedDescription}
          </span>
        </span>

        <span
          className={`h-2.5 w-2.5 shrink-0 border-r border-t border-[#242617]/55 transition-transform duration-200 ${
            open ? "-translate-y-0.5 rotate-[135deg]" : "rotate-[45deg]"
          }`}
        />
      </button>

      <div
        role="listbox"
        aria-hidden={!open}
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#242617]/12 bg-[#f4efe4] p-1 shadow-[0_18px_45px_rgba(36,38,23,0.16)] transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {categories.map((category) => {
          const isSelected = category.id === value;

          return (
            <button
              key={category.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                onChange(category.id);
                setOpen(false);
              }}
              className={`block w-full cursor-pointer rounded-xl px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] transition ${
                isSelected
                  ? "bg-[#071321] text-[#f4efe4]"
                  : "text-[#242617]/60 hover:bg-[#e8dfcf] hover:text-[#242617]"
              }`}
            >
              {category.name}
            </button>
          );
        })}

        <button
          type="button"
          role="option"
          aria-selected={value === "__new__"}
          onClick={() => {
            onChange("__new__");
            setOpen(false);
          }}
          className={`mt-1 block w-full cursor-pointer rounded-xl px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] transition ${
            value === "__new__"
              ? "bg-[#071321] text-[#f4efe4]"
              : "text-[#b88a3b] hover:bg-[#d5ad68]/15"
          }`}
        >
          + New category
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-xs font-semibold text-red-900/70">{error}</p>
      ) : null}
    </div>
  );
}

function parseStatus(value: string | undefined): StatusValue {
  if (value === "PUBLISHED" || value === "ARCHIVED") return value;
  return "DRAFT";
}

export function StoryForm({
  story,
  categories,
  action,
  submitLabel,
  typographyStyle,
}: StoryFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const draft = readStoryDraft(story?.draftData);

  const [status, setStatus] = useState<StatusValue>(
    parseStatus(
      draftText(draft, "status", story?.status ?? ""),
    ),
  );
  const [categoryId, setCategoryId] = useState<CategoryValue>(
    draftText(
      draft,
      "categoryId",
      story?.categoryId ?? "",
    ),
  );
  const [categoryError, setCategoryError] = useState("");
  const [newCategory, setNewCategory] = useState(
    draftText(draft, "newCategory", ""),
  );
  const [imageSrc, setImageSrc] = useState(
    draftText(draft, "imageSrc", story?.imageSrc ?? ""),
  );
  const [draftMessage, setDraftMessage] = useState("");
  const [draftPending, startDraftTransition] =
    useTransition();
  const [hasChanges, setHasChanges] = useState(
    Boolean(draft),
  );
  const [changeVersion, setChangeVersion] = useState(0);
  const latestChangeVersion = useRef(0);
  const suspendAutosaveRef = useRef(false);
  const autosaveQueueRef = useRef<Promise<void>>(
    Promise.resolve(),
  );
  const autosaveTimerRef = useRef<number | null>(null);
  const autosaveGenerationRef = useRef(0);
  const allowNavigationRef = useRef(false);
  const [leaveDialogOpen, setLeaveDialogOpen] =
    useState(false);
  const [pendingNavigation, setPendingNavigation] =
    useState<string | null>(null);
  const [leavePending, setLeavePending] = useState<
    "save" | "draft" | "discard" | null
  >(null);
  const [leaveError, setLeaveError] = useState("");
  const [changePreview, setChangePreview] = useState<{
    published: StoryChangeSnapshot;
    current: StoryChangeSnapshot;
  } | null>(null);

  const storyId = story?.id;
  const uploadSlug = story?.slug || "draft";

  function markChanged() {
    if (suspendAutosaveRef.current) return;

    latestChangeVersion.current += 1;
    setChangeVersion(latestChangeVersion.current);
    setHasChanges(true);
    setDraftMessage("");
  }

  function cancelPendingAutosave() {
    if (autosaveTimerRef.current === null) return;

    window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = null;
  }

  function invalidatePendingAutosave() {
    autosaveGenerationRef.current += 1;
    cancelPendingAutosave();
  }

  useEffect(() => {
    if (
      !storyId ||
      changeVersion === 0 ||
      suspendAutosaveRef.current
    ) {
      return;
    }

    const revision = changeVersion;
    const generation = autosaveGenerationRef.current;

    const timeout = window.setTimeout(() => {
      if (autosaveTimerRef.current === timeout) {
        autosaveTimerRef.current = null;
      }

      const currentForm = formRef.current;

      if (
        !currentForm ||
        suspendAutosaveRef.current
      ) {
        return;
      }

      const formData = new FormData(currentForm);
      setDraftMessage("Saving...");

      autosaveQueueRef.current = autosaveQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          if (
            generation !== autosaveGenerationRef.current ||
            suspendAutosaveRef.current
          ) {
            return;
          }

          try {
            await saveStoryDraft(storyId, formData);

            if (
              latestChangeVersion.current === revision
            ) {
              setDraftMessage("Draft saved");
            }
          } catch (error) {
            console.error(error);

            if (
              latestChangeVersion.current === revision
            ) {
              setDraftMessage("Draft failed");
            }
          }
        });
    }, 1200);

    autosaveTimerRef.current = timeout;

    return () => {
      window.clearTimeout(timeout);

      if (autosaveTimerRef.current === timeout) {
        autosaveTimerRef.current = null;
      }
    };
  }, [changeVersion, storyId]);

  useEffect(() => {
    if (!hasChanges) return;

    const warnBeforeUnload = (
      event: BeforeUnloadEvent,
    ) => {
      if (allowNavigationRef.current) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      warnBeforeUnload,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        warnBeforeUnload,
      );
    };
  }, [hasChanges]);

  useEffect(() => {
    const interceptLink = (event: MouseEvent) => {
      if (
        !hasChanges ||
        allowNavigationRef.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>(
        "a[href]",
      );

      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const url = new URL(
        anchor.href,
        window.location.href,
      );

      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.href === window.location.href
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setPendingNavigation(url.href);
      setLeaveError("");
      setLeaveDialogOpen(true);
    };

    document.addEventListener(
      "click",
      interceptLink,
      true,
    );

    return () => {
      document.removeEventListener(
        "click",
        interceptLink,
        true,
      );
    };
  }, [hasChanges]);

  function requestNavigation(destination: string) {
    if (!hasChanges) {
      router.push(destination);
      return;
    }

    setPendingNavigation(destination);
    setLeaveError("");
    setLeaveDialogOpen(true);
  }

  function completeNavigation() {
    const destination =
      pendingNavigation || "/admin/stories";
    const url = new URL(
      destination,
      window.location.href,
    );

    allowNavigationRef.current = true;
    setHasChanges(false);
    setLeaveDialogOpen(false);

    if (url.origin === window.location.origin) {
      router.push(
        `${url.pathname}${url.search}${url.hash}`,
      );
    } else {
      window.location.assign(url.href);
    }
  }

  function handleLeaveChoice(
    choice: "save" | "draft" | "discard",
  ) {
    const currentForm = formRef.current;

    if (!currentForm || leavePending) return;

    const formData = new FormData(currentForm);

    invalidatePendingAutosave();
    suspendAutosaveRef.current = true;
    setLeavePending(choice);
    setLeaveError("");

    void (async () => {
      try {
        await autosaveQueueRef.current;

        if (choice === "save") {
          if (story) {
            await saveStoryChanges(
              story.id,
              formData,
            );
          } else {
            allowNavigationRef.current = true;
            await action(formData);
            return;
          }
        }

        if (choice === "draft") {
          if (story) {
            await saveStoryDraft(
              story.id,
              formData,
            );
          } else {
            formData.set("status", "DRAFT");
            allowNavigationRef.current = true;
            await action(formData);
            return;
          }
        }

        if (choice === "discard" && story) {
          await discardStoryDraft(story.id);
        }

        completeNavigation();
      } catch (error) {
        console.error(error);
        suspendAutosaveRef.current = false;
        allowNavigationRef.current = false;
        setHasChanges(true);
        setLeavePending(null);
        setLeaveError(
          "The action could not be completed. Please try again.",
        );
      }
    })();
  }


  function openChangesPreview() {
    const currentForm = formRef.current;

    if (!currentForm) return;

    const formData = new FormData(currentForm);
    const currentCategoryId = String(
      formData.get("categoryId") ?? "",
    );

    const currentCategory =
      currentCategoryId === "__new__"
        ? String(formData.get("newCategory") ?? "")
        : categories.find(
            (category) =>
              category.id === currentCategoryId,
          )?.name ?? "";

    setChangePreview({
      published: {
        title: story?.title ?? "",
        slug: story?.slug ?? "",
        excerpt: story?.excerpt ?? "",
        articleIntro: story?.articleIntro ?? "",
        date: story?.date
          ? story.date.toISOString().slice(0, 10)
          : "",
        readTime: story?.readTime ?? "",
        status: story?.status ?? "DRAFT",
        category: story?.category?.name ?? "",
        imageSrc: story?.imageSrc ?? "",
        content: story?.content ?? "",
      },
      current: {
        title: String(formData.get("title") ?? ""),
        slug: String(formData.get("slug") ?? ""),
        excerpt: String(formData.get("excerpt") ?? ""),
        articleIntro: String(
          formData.get("articleIntro") ?? "",
        ),
        date: String(formData.get("date") ?? ""),
        readTime: String(
          formData.get("readTime") ?? "",
        ),
        status: String(formData.get("status") ?? ""),
        category: currentCategory,
        imageSrc: String(
          formData.get("imageSrc") ?? "",
        ),
        content: String(
          formData.get("content") ?? "",
        ),
      },
    });
  }

  function handleSaveDraft() {
    const currentForm = formRef.current;

    if (!currentForm || draftPending) return;

    const formData = new FormData(currentForm);
    setDraftMessage("Saving...");

    startDraftTransition(async () => {
      if (!story) {
        formData.set("status", "DRAFT");
        await action(formData);
        return;
      }

      try {
        await autosaveQueueRef.current;
        await saveStoryDraft(story.id, formData);
        setDraftMessage("Draft saved");
      } catch (error) {
        console.error(error);
        setDraftMessage("Draft failed");
      }
    });
  }

  function handleCancel() {
    if (draftPending) return;

    invalidatePendingAutosave();
    suspendAutosaveRef.current = true;

    startDraftTransition(async () => {
      try {
        if (story) {
          await autosaveQueueRef.current;
          await discardStoryDraft(story.id);
          allowNavigationRef.current = true;
          setHasChanges(false);

          setDraftMessage("");
          router.refresh();

          return;
        }

        router.push("/admin/stories");
      } catch (error) {
        suspendAutosaveRef.current = false;
        allowNavigationRef.current = false;
        setHasChanges(true);
        console.error(error);
        setDraftMessage("Cancel failed");
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={action}
      onInput={markChanged}
      onSubmit={(event) => {
        event.preventDefault();

        if (!categoryId) {
          setCategoryError("Please choose a category.");
          return;
        }

        if (
          categoryId === "__new__" &&
          !newCategory.trim()
        ) {
          setCategoryError("Please name the new category.");
          return;
        }

        suspendAutosaveRef.current = true;
        allowNavigationRef.current = true;
        setHasChanges(false);

        const formData = new FormData(
          event.currentTarget,
        );

        startDraftTransition(async () => {
          try {
            await autosaveQueueRef.current;
            await action(formData);
          } catch (error) {
            console.error(error);
            suspendAutosaveRef.current = false;
            allowNavigationRef.current = false;
            setHasChanges(true);
            setDraftMessage("Save failed");
          }
        });
      }}
      className="min-w-0 space-y-8"
    >
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="imageSrc" value={imageSrc} />
      <input
        type="hidden"
        name="order"
        value={story?.order ?? 0}
      />
      <input
        type="hidden"
        name="featured"
        value={story?.featured ? "on" : ""}
      />

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] xl:items-stretch">
        <div className="h-full min-w-0 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <Field label="Cover image">
            <div className="mx-auto w-full max-w-none">
              <AdminImageDropzone
                label="Story cover image"
                value={imageSrc}
                onChange={(nextImage) => {
                  setImageSrc(nextImage);
                  markChanged();
                }}
                context="story"
                entitySlug={uploadSlug}
                slotKey="cover"
                ratio="16 / 6"
              />
            </div>
          </Field>
        </div>
        <div className="grid h-full min-w-0 content-center gap-5 rounded-[2rem] border sm:grid-cols-2 border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <Field label="Status">
            <StatusSelect
              value={status}
              onChange={(nextStatus) => {
                setStatus(nextStatus);
                markChanged();
              }}
            />
          </Field>

          <Field label="Category">
            <CategorySelect
              value={categoryId}
              categories={categories}
              error={categoryError}
              onChange={(nextCategory) => {
                setCategoryId(nextCategory);
                setCategoryError("");
                markChanged();
              }}
            />
          </Field>

          {categoryId === "__new__" ? (
            <Field label="New category name">
              <input
                name="newCategory"
                value={newCategory}
                onChange={(event) => {
                  setNewCategory(event.target.value);
                  setCategoryError("");
                  markChanged();
                }}
                className={inputClass()}
                placeholder="Behind the lens"
              />
            </Field>
          ) : (
            <input type="hidden" name="newCategory" value="" />
          )}

          <Field label="Date">
            <input
              type="date"
              name="date"
              defaultValue={draftText(
                draft,
                "date",
                story?.date
                  ? story.date.toISOString().slice(0, 10)
                  : "",
              )}
              className={inputClass()}
            />
          </Field>

          <Field label="Read time">
            <input
              name="readTime"
              defaultValue={draftText(draft, "readTime", story?.readTime ?? "")}
              className={inputClass()}
              placeholder="5 min read"
            />
          </Field>


        </div>
      </section>

      <div className="min-w-0 space-y-6 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <Field label="Title">
          <input
            name="title"
            required
            defaultValue={draftText(draft, "title", story?.title ?? "")}
            className={inputClass()}
            placeholder="Into the quiet blue"
          />
        </Field>

        <Field label="Slug" help="Leave empty to generate it from the title.">
          <input
            name="slug"
            defaultValue={draftText(draft, "slug", story?.slug ?? "")}
            className={inputClass()}
            placeholder="into-the-quiet-blue"
          />
        </Field>

        <Field label="Excerpt">
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={draftText(draft, "excerpt", story?.excerpt ?? "")}
            className={textareaClass()}
            placeholder="A short introduction shown on story cards."
          />
        </Field>

        <Field
          label="Article introduction"
          help="Optional text shown at the beginning of the article. It is independent from the excerpt displayed in the hero and on Story cards."
        >
          <textarea
            name="articleIntro"
            rows={3}
            defaultValue={draftText(draft, "articleIntro", story?.articleIntro ?? "")}
            className={textareaClass()}
            placeholder="A short opening thought for the article."
          />
        </Field>

        <Field
          label="Full content"
        >
          <StoryRichTextEditor
            existingPageImageUrls={imageSrc ? [imageSrc] : []}
            initialContent={draftText(draft, "content", story?.content ?? "")}
            typographyStyle={typographyStyle}
            uploadSlug={uploadSlug}
            onContentChange={markChanged}
            onNavigateBack={() =>
              requestNavigation("/admin/stories")
            }
          />
        </Field>
      </div>

        <div className={`fixed bottom-6 right-6 z-[100] flex w-36 flex-col gap-2 transition-all duration-200 sm:w-40 lg:w-44 ${
          hasChanges
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}>
          <button
            type="button"
            onClick={openChangesPreview}
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-[#242617]/15 bg-[#f4efe4] px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#071321] shadow-[0_16px_40px_rgba(7,19,33,0.12)] transition hover:-translate-y-0.5 hover:bg-white sm:h-11 sm:text-[10px] lg:h-12"
          >
            View changes
          </button>

          <button
            type="submit"
            disabled={draftPending}
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-[#414832]/35 bg-[#414832] px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_16px_40px_rgba(7,19,33,0.18)] transition hover:-translate-y-0.5 hover:bg-[#596044] disabled:cursor-wait disabled:opacity-60 sm:h-11 lg:h-12"
          >
            {submitLabel}
          </button>

          <button
            type="button"
            disabled={draftPending}
            onClick={handleSaveDraft}
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-[#071321]/35 bg-[#071321] px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_16px_40px_rgba(7,19,33,0.16)] transition hover:-translate-y-0.5 hover:bg-[#142844] disabled:cursor-wait disabled:opacity-60 sm:h-11 sm:text-[10px] lg:h-12"
          >
            {draftPending
              ? "Saving..."
              : draftMessage || "Save as draft"}
          </button>

          <button
            type="button"
            disabled={draftPending}
            onClick={handleCancel}
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-[#b88a3b]/35 bg-[#b88a3b] px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321] shadow-[0_16px_40px_rgba(7,19,33,0.14)] transition hover:-translate-y-0.5 hover:bg-[#d5ad68] disabled:cursor-wait disabled:opacity-60 sm:h-11 lg:h-12"
          >
            Cancel
          </button>
        </div>

      {changePreview ? (
        <StoryChangesPreview
          published={changePreview.published}
          current={changePreview.current}
          onClose={() => setChangePreview(null)}
        />
      ) : null}

      {leaveDialogOpen ? (
        <div
          className="fixed inset-0 z-[220] grid place-items-center bg-[#071321]/55 p-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !leavePending
            ) {
              setLeaveDialogOpen(false);
              setPendingNavigation(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-story-title"
            className="w-full max-w-md rounded-[1.75rem] border border-[#d5ad68]/30 bg-[#f4efe4] p-6 shadow-[0_28px_90px_rgba(7,19,33,0.35)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
              Unsaved changes
            </p>

            <h2
              id="unsaved-story-title"
              className="mt-3 font-serif text-2xl text-[#071321]"
            >
              What would you like to do?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#242617]/60">
              Your edits have not been published yet.
            </p>

            {leaveError ? (
              <p className="mt-4 text-sm font-semibold text-red-900/70">
                {leaveError}
              </p>
            ) : null}

            <div className="mt-6 grid gap-2">
              <button
                type="button"
                disabled={Boolean(leavePending)}
                onClick={() =>
                  handleLeaveChoice("save")
                }
                className="h-11 cursor-pointer rounded-lg bg-[#414832] px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:cursor-wait disabled:opacity-55"
              >
                {leavePending === "save"
                  ? "Saving..."
                  : "Save changes"}
              </button>

              <button
                type="button"
                disabled={Boolean(leavePending)}
                onClick={() =>
                  handleLeaveChoice("draft")
                }
                className="h-11 cursor-pointer rounded-lg bg-[#071321] px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:cursor-wait disabled:opacity-55"
              >
                {leavePending === "draft"
                  ? "Saving..."
                  : "Save as draft"}
              </button>

              <button
                type="button"
                disabled={Boolean(leavePending)}
                onClick={() =>
                  handleLeaveChoice("discard")
                }
                className="h-11 cursor-pointer rounded-lg bg-[#b88a3b] px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321] disabled:cursor-wait disabled:opacity-55"
              >
                {leavePending === "discard"
                  ? "Discarding..."
                  : "Cancel changes"}
              </button>

              <button
                type="button"
                disabled={Boolean(leavePending)}
                onClick={() => {
                  setLeaveDialogOpen(false);
                  setPendingNavigation(null);
                  setLeaveError("");
                }}
                className="mt-1 h-10 cursor-pointer text-[10px] font-bold uppercase tracking-[0.15em] text-[#242617]/48 disabled:cursor-wait"
              >
                Continue editing
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </form>
  );
}
