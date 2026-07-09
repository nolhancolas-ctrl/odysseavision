"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import { createPortfolioGalleryPhotos } from "@/server/actions/portfolio-gallery-photos";

type PortfolioCategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type UploadedPhoto = {
  imageSrc: string;
  title: string;
  originalName: string;
};

type PortfolioGalleryBulkUploaderProps = {
  categories: PortfolioCategoryOption[];
  defaultCategoryId?: string;
  lockedCategory?: boolean;
  returnTo?: string;
  submitLabel?: string;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

function titleFromFileName(fileName: string) {
  return fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

async function compressImageToWebp(file: File) {
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  if (!file.type.startsWith("image/")) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const maxSize = 2200;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.84);
  });

  if (!blob) {
    return file;
  }

  const name = file.name.replace(/\.[a-z0-9]+$/i, ".webp");

  return new File([blob], name, {
    type: "image/webp",
  });
}

function isImageUrl(value: string) {
  return (
    value.startsWith("/images/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    /\.(webp|jpg|jpeg|png|gif|svg)(\?|#|$)/i.test(value)
  );
}

function findImageUrl(value: unknown): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return isImageUrl(value) ? value : "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImageUrl(item);

      if (found) {
        return found;
      }
    }

    return "";
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;

    const priorityKeys = [
      "src",
      "url",
      "href",
      "path",
      "publicUrl",
      "publicURL",
      "imageUrl",
      "imageURL",
      "imageSrc",
      "location",
      "pathname",
    ];

    for (const key of priorityKeys) {
      const found = findImageUrl(objectValue[key]);

      if (found) {
        return found;
      }
    }

    for (const nestedValue of Object.values(objectValue)) {
      const found = findImageUrl(nestedValue);

      if (found) {
        return found;
      }
    }
  }

  return "";
}

function resolveUploadedSrc(payload: unknown) {
  return findImageUrl(payload);
}

export function PortfolioGalleryBulkUploader({
  categories,
  defaultCategoryId,
  lockedCategory = false,
  returnTo = "/admin/portfolio/photos",
  submitLabel = "Import photos",
}: PortfolioGalleryBulkUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [categoryId, setCategoryId] = useState(
    defaultCategoryId || categories[0]?.id || "",
  );
  const [status, setStatus] = useState("PUBLISHED");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0 || !selectedCategory) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadedPhotos: UploadedPhoto[] = [];

      for (const file of files) {
        const optimizedFile = await compressImageToWebp(file);
        const formData = new FormData();

        formData.append("file", optimizedFile);
        formData.append("context", "portfolio");
        formData.append("entitySlug", selectedCategory.slug);
        formData.append("slotKey", slugify(file.name));

        const response = await fetch("/api/admin/uploads/image", {
          method: "POST",
          body: formData,
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error || payload?.message || "Upload failed");
        }

        const imageSrc = resolveUploadedSrc(payload);

        if (!imageSrc) {
          throw new Error("Upload succeeded but returned no image URL.");
        }

        uploadedPhotos.push({
          imageSrc,
          title: titleFromFileName(file.name),
          originalName: file.name,
        });
      }

      setPhotos((currentPhotos) => [...currentPhotos, ...uploadedPhotos]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      void uploadFiles(event.target.files);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    if (event.dataTransfer.files) {
      void uploadFiles(event.dataTransfer.files);
    }
  }

  function removePhoto(index: number) {
    setPhotos((currentPhotos) =>
      currentPhotos.filter((_, photoIndex) => photoIndex !== index),
    );
  }

  return (
    <form action={createPortfolioGalleryPhotos}>
      <input type="hidden" name="images" value={JSON.stringify(photos)} />
      <input type="hidden" name="returnTo" value={returnTo} />

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <aside className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_22px_70px_rgba(20,20,10,0.07)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
            Destination
          </p>

          <label className="mt-6 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
              Portfolio category
            </span>

            {lockedCategory ? (
              <>
                <input type="hidden" name="categoryId" value={categoryId} />
                <div className="mt-3 rounded-2xl border border-[#242617]/10 bg-white/55 px-4 py-4 text-sm text-[#242617]">
                  {selectedCategory?.name || "Selected category"}
                </div>
              </>
            ) : (
              <select
                name="categoryId"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-white/55 px-4 py-4 text-sm text-[#242617] outline-none focus:border-[#b88a3b]"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="mt-5 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
              Status
            </span>
            <select
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-white/55 px-4 py-4 text-sm text-[#242617] outline-none focus:border-[#b88a3b]"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </label>
        </aside>

        <section className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_22px_70px_rgba(20,20,10,0.07)]">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={[
              "flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-[1.8rem] border border-dashed px-6 py-10 text-center transition",
              dragging
                ? "border-[#b88a3b] bg-[#b88a3b]/10"
                : "border-[#242617]/14 bg-[#f4efe4]/55 hover:border-[#b88a3b]/60 hover:bg-[#f4efe4]/80",
            ].join(" ")}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleInputChange}
            />

            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#242617]/10 text-3xl text-[#242617]/45">
              ↑
            </span>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-[#242617]/45">
              {uploading ? "Uploading..." : "Drop photos or click to upload"}
            </p>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {photos.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((photo, index) => (
                <article
                  key={`${photo.imageSrc}-${index}`}
                  className="overflow-hidden rounded-[1.5rem] border border-[#242617]/10 bg-[#f4efe4]/60"
                >
                  <div
                    className="aspect-[1.25] bg-cover bg-center"
                    style={{ backgroundImage: `url(${photo.imageSrc})` }}
                  />

                  <div className="p-4">
                    <input
                      value={photo.title}
                      onChange={(event) => {
                        const value = event.target.value;
                        setPhotos((currentPhotos) =>
                          currentPhotos.map((currentPhoto, photoIndex) =>
                            photoIndex === index
                              ? { ...currentPhoto, title: value }
                              : currentPhoto,
                          ),
                        );
                      }}
                      className="w-full rounded-xl border border-[#242617]/10 bg-white/45 px-3 py-2 text-xs text-[#242617] outline-none focus:border-[#b88a3b]"
                    />

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="mt-3 cursor-pointer text-[10px] font-bold uppercase tracking-[0.16em] text-[#242617]/40 transition hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col justify-between gap-4 border-t border-[#242617]/8 pt-5 md:flex-row md:items-center">
            <p className="text-xs uppercase tracking-[0.16em] text-[#242617]/42">
              {photos.length} {photos.length === 1 ? "photo" : "photos"} ready
            </p>

            <button
              type="submit"
              disabled={uploading || photos.length === 0}
              className="w-fit cursor-pointer rounded-full bg-[#242617] px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:-translate-y-0.5 hover:bg-[#b88a3b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitLabel}
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}
