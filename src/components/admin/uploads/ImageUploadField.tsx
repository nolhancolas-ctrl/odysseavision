"use client";

import { DragEvent, useRef, useState, useTransition } from "react";
import { uploadImage } from "@/server/actions/uploads";

export type ImageUploadContext =
  | "website-page"
  | "story"
  | "portfolio"
  | "client-album"
  | "newsletter"
  | "seo"
  | "appearance"
  | "misc";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (path: string) => void;
  context: ImageUploadContext;
  pageKey?: string;
  sectionKey?: string;
  slotKey?: string;
  entitySlug?: string;
  help?: string;
};

export function ImageUploadField({
  label,
  value,
  onChange,
  context,
  pageKey = "",
  sectionKey = "",
  slotKey = "",
  entitySlug = "",
  help,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const upload = (file: File | undefined) => {
    if (!file) return;

    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context);
    formData.append("pageKey", pageKey);
    formData.append("sectionKey", sectionKey);
    formData.append("slotKey", slotKey);
    formData.append("entitySlug", entitySlug);
    formData.append("label", label);

    startTransition(async () => {
      const result = await uploadImage(formData);

      if (!result.ok) {
        setError(result.error || "Upload failed.");
        return;
      }

      onChange(result.path);
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    upload(event.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`overflow-hidden rounded-[1.5rem] border border-dashed p-4 transition ${
          isDragging
            ? "border-[#b88a3b] bg-[#d5ad68]/10"
            : "border-[#242617]/15 bg-[#f4efe4]/65"
        }`}
      >
        <div className="grid gap-4 md:grid-cols-[160px_1fr] md:items-center">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="relative aspect-[1.35] cursor-pointer overflow-hidden rounded-[1rem] border border-[#242617]/10 bg-[#e8dfcf] text-left"
          >
            {value ? (
              <img
                src={value}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center px-4 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/35">
                Drop image
              </span>
            )}

            <span className="absolute bottom-2 left-2 rounded-full bg-[#071321]/85 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#f4efe4]">
              {isPending ? "Uploading" : value ? "Replace" : "Upload"}
            </span>
          </button>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40">
              {label}
            </p>

            <p className="mt-2 text-sm leading-6 text-[#242617]/55">
              Drag and drop an image here or choose a file from your computer.
            </p>

            {help ? (
              <p className="mt-1 text-xs leading-5 text-[#242617]/35">{help}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="cursor-pointer rounded-full border border-[#242617]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
              >
                Choose file
              </button>

              {value ? (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="cursor-pointer rounded-full border border-red-900/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]"
                >
                  Remove
                </button>
              ) : null}
            </div>

            {value ? (
              <p className="mt-3 break-all rounded-xl bg-white/45 px-3 py-2 text-xs text-[#242617]/45">
                {value}
              </p>
            ) : null}

            {error ? (
              <p className="mt-3 text-xs font-semibold text-red-900/70">
                {error}
              </p>
            ) : null}
          </div>
        </div>

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
    </div>
  );
}
