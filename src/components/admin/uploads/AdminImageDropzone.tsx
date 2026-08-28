"use client";

import { DragEvent, useRef, useState, useTransition } from "react";
import { compressImageBeforeUpload } from "@/lib/admin/clientImageCompression";

export type AdminImageUploadContext =
  | "website-page"
  | "story"
  | "portfolio"
  | "client-album"
  | "video"
  | "newsletter"
  | "seo"
  | "appearance"
  | "misc";

const DUPLICATE_IMAGE_ERROR = "Fichier double déjà présent sur cette page.";

type AdminImageDropzoneProps = {
  label: string;
  value: string;
  onChange: (path: string) => void;
  existingImageUrls?: readonly string[];
  context: AdminImageUploadContext;
  pageKey?: string;
  sectionKey?: string;
  slotKey?: string;
  entitySlug?: string;
  ratio?: string;
  emptyText?: string;
};

function fileNameFromPath(value: string) {
  return value.split("/").pop() || value;
}

function isLocalImagePath(value: string) {
  return value.startsWith("/images/");
}

type UploadApiResult = {
  ok: boolean;
  error?: string;
  path: string;
  src?: string;
  url?: string;
};

function getApiContext(context: AdminImageUploadContext) {
  if (context === "website-page" || context === "appearance") {
    return "site";
  }

  if (context === "misc") {
    return "general";
  }

  return context;
}

function getApiEntitySlug({
  context,
  pageKey,
  sectionKey,
  entitySlug,
}: {
  context: AdminImageUploadContext;
  pageKey: string;
  sectionKey: string;
  entitySlug: string;
}) {
  if (entitySlug) {
    return entitySlug;
  }

  if (context === "website-page") {
    return [pageKey, sectionKey].filter(Boolean).join("-") || "website-page";
  }

  if (context === "appearance") {
    return "appearance";
  }

  return "draft";
}

async function uploadImageViaApi(formData: FormData): Promise<UploadApiResult> {
  const response = await fetch("/api/admin/uploads/image", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    return {
      ok: false,
      error:
        payload?.error ||
        payload?.message ||
        `Upload failed with status ${response.status}.`,
      path: "",
    };
  }

  const path = payload.path || payload.src || payload.url || "";

  return {
    ok: Boolean(path),
    error: path ? "" : "Upload succeeded but returned no image URL.",
    path,
    src: payload.src,
    url: payload.url,
  };
}

export function AdminImageDropzone({
  label,
  value,
  onChange,
  existingImageUrls = [],
  context,
  pageKey = "",
  sectionKey = "",
  slotKey = "",
  entitySlug = "",
  ratio = "4 / 3",
  emptyText = "DRAG AND DROP",
}: AdminImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [renameValue, setRenameValue] = useState(value);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const canRename = Boolean(value && isLocalImagePath(value));

  const upload = (file: File | undefined) => {
    if (!file) return;

    setError("");

    startTransition(async () => {
      const preparedFile = await compressImageBeforeUpload(file);

      const formData = new FormData();
      formData.append("file", preparedFile);
      formData.append("context", getApiContext(context));
      formData.append("pageKey", pageKey);
      formData.append("sectionKey", sectionKey);
      formData.append("slotKey", slotKey);
      formData.append(
        "entitySlug",
        getApiEntitySlug({
          context,
          pageKey,
          sectionKey,
          entitySlug,
        }),
      );
      formData.append("label", label);

      const result = await uploadImageViaApi(formData);

      if (!result.ok) {
        setError(result.error || "Upload failed.");
        return;
      }

      if (
        result.path === value ||
        existingImageUrls.includes(result.path)
      ) {
        setError(DUPLICATE_IMAGE_ERROR);
        return;
      }

      onChange(result.path);
      setRenameValue(result.path);
    });
  };

  const renameCurrentImage = () => {
    if (!canRename) {
      setIsEditingPath(false);
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("currentPath", value);
    formData.append("requestedName", renameValue);

    startTransition(async () => {
      formData.append("operation", "rename");
      const result = await uploadImageViaApi(formData);

      if (!result.ok) {
        setError(result.error || "Rename failed.");
        return;
      }

      onChange(result.path);
      setRenameValue(result.path);
      setIsEditingPath(false);
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    upload(event.dataTransfer.files[0]);
  };

  return (
    <div className="min-w-0 w-full max-w-full">
      <div className="mb-3">
        {isEditingPath ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  renameCurrentImage();
                }

                if (event.key === "Escape") {
                  setRenameValue(value);
                  setIsEditingPath(false);
                }
              }}
              className="min-w-0 flex-1 rounded-2xl border border-[#b88a3b]/60 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none"
            />

            <button
              type="button"
              onClick={renameCurrentImage}
              className="cursor-pointer rounded-full bg-[#071321] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f4efe4]"
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => {
                setRenameValue(value);
                setIsEditingPath(false);
              }}
              className="cursor-pointer rounded-full border border-[#242617]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!value || !canRename}
            onClick={() => {
              if (!canRename) return;
              setRenameValue(value);
              setIsEditingPath(true);
            }}
            className={`group flex min-h-[48px] w-full items-center justify-between gap-4 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-left text-sm transition ${
              canRename
                ? "cursor-text hover:border-[#b88a3b]/55"
                : "cursor-default"
            }`}
          >
            <span
              className={`min-w-0 truncate ${
                value ? "text-[#242617]/55" : "text-[#242617]/32"
              }`}
            >
              {value || "No image selected"}
            </span>

            {canRename ? (
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.16em] text-[#242617]/30 opacity-0 transition group-hover:opacity-100">
                Rename
              </span>
            ) : null}
          </button>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`group relative min-w-0 w-full max-w-full cursor-pointer overflow-hidden rounded-[1.75rem] border border-dashed transition ${
          isDragging
            ? "border-[#b88a3b] bg-[#d5ad68]/10"
            : "border-[#242617]/12 bg-[#e8dfcf]"
        }`}
        style={{ aspectRatio: ratio }}
      >
        {value ? (
          <>
            <img
              src={value}
              alt=""
              className="h-full w-full object-contain transition duration-300 group-hover:opacity-45"
            />

            <button
              type="button"
              aria-label="Remove image"
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
                setRenameValue("");
                setIsEditingPath(false);
              }}
              className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 scale-90 cursor-pointer place-items-center rounded-full border border-red-900/20 bg-[#f4efe4]/90 p-0 text-red-800 opacity-0 shadow-[0_18px_45px_rgba(80,0,0,0.18)] transition duration-300 hover:bg-red-800 hover:text-[#f4efe4] group-hover:scale-100 group-hover:opacity-100"
            >
              <span
                className="relative block h-6 w-6"
                aria-hidden="true"
              >
                <span className="absolute left-1/2 top-1/2 h-[2.5px] w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                <span className="absolute left-1/2 top-1/2 h-[2.5px] w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
              </span>
            </button>

            <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-[#071321]/75 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#f4efe4] opacity-0 transition group-hover:opacity-100">
              Drop to replace
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#242617]/12 bg-[#f4efe4]/65">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-[#242617]/38"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 16V4" />
                <path d="m7 9 5-5 5 5" />
                <path d="M20 16.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5" />
              </svg>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#242617]/42">
                {emptyText}
              </p>

              <p className="mt-2 max-w-[260px] text-xs leading-5 text-[#242617]/38">
                Drop an image here or click to choose a file.
              </p>
            </div>
          </div>
        )}

        {isPending ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f4efe4]/70 backdrop-blur-[2px]">
            <span className="rounded-full bg-[#071321] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f4efe4]">
              Processing
            </span>
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(event) => {
            upload(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
      </div>

      {error ? (
        <p className="mt-3 text-xs font-semibold text-red-900/70">{error}</p>
      ) : null}
    </div>
  );
}
