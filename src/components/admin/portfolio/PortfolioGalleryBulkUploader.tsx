"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortfolioGalleryPhotos } from "@/server/actions/portfolio-gallery-photos";

type PortfolioCategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type PhotoWatermark = "NONE" | "ANDREW" | "MORGANE";

const DUPLICATE_IMAGE_ERROR = "Fichier double déjà présent sur cette page.";

type UploadedPhoto = {
  imageSrc: string;
  title: string;
  originalName: string;
  watermark: PhotoWatermark;
};

type PortfolioGalleryBulkUploaderProps = {
  existingImageUrls?: string[];
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

const ACCEPTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const PORTFOLIO_TARGET_MAX_BYTES = 1.8 * 1024 * 1024;

const PORTFOLIO_COMPRESSION_ATTEMPTS = [
  { maxSize: 2200, quality: 0.80 },
  { maxSize: 2000, quality: 0.76 },
  { maxSize: 1800, quality: 0.72 },
  { maxSize: 1600, quality: 0.68 },
  { maxSize: 1400, quality: 0.64 },
];

function isAcceptedImageFile(file: File) {
  return ACCEPTED_IMAGE_MIME_TYPES.has(file.type);
}

function getUnsupportedFormatMessage(fileName?: string) {
  return `${
    fileName ? `${fileName}: ` : ""
  }Unsupported file format. Please upload JPG, PNG, WEBP, GIF or SVG.`;
}

async function loadImageFromFile(file: File) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read this image file."));
      img.src = imageUrl;
    });

    return {
      image,
      dispose: () => URL.revokeObjectURL(imageUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(imageUrl);
    throw error;
  }
}

async function compressImageToWebp(file: File) {
  if (!isAcceptedImageFile(file)) {
    throw new Error(getUnsupportedFormatMessage(file.name));
  }

  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    if (file.size > PORTFOLIO_TARGET_MAX_BYTES) {
      throw new Error(
        `${file.name}: Image is too large. Please upload a lighter JPG, PNG or WEBP file.`,
      );
    }

    return file;
  }

  const { image, dispose } = await loadImageFromFile(file);

  try {
    let bestFile = file;

    for (const attempt of PORTFOLIO_COMPRESSION_ATTEMPTS) {
      const scale = Math.min(
        1,
        attempt.maxSize / Math.max(image.width, image.height),
      );

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext("2d");

      if (!context) {
        continue;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", attempt.quality);
      });

      if (!blob) {
        continue;
      }

      const name = file.name.replace(/\.[a-z0-9]+$/i, ".webp");
      const compressedFile = new File([blob], name, {
        type: "image/webp",
        lastModified: Date.now(),
      });

      if (compressedFile.size < bestFile.size) {
        bestFile = compressedFile;
      }

      if (compressedFile.size <= PORTFOLIO_TARGET_MAX_BYTES) {
        return compressedFile;
      }
    }

    if (bestFile.size > PORTFOLIO_TARGET_MAX_BYTES) {
      throw new Error(
        `${file.name}: Image is still too large after compression. Please export a smaller JPG or PNG.`,
      );
    }

    return bestFile;
  } finally {
    dispose();
  }
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

function getWatermarkEnabled(watermark: PhotoWatermark) {
  return watermark === "ANDREW" || watermark === "MORGANE";
}

function watermarkOwnerLabel(watermark: PhotoWatermark) {
  if (watermark === "MORGANE") return "Morgane";
  if (watermark === "ANDREW") return "Andrew";
  return "None";
}

function StatusDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const options = [
    {
      value: "PUBLISHED",
      label: "Published",
      description: "Visible on the public portfolio.",
    },
    {
      value: "DRAFT",
      label: "Draft",
      description: "Hidden until ready.",
    },
  ];

  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative mt-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={[
          "flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-5 rounded-2xl border bg-white/55 px-4 py-3 text-left transition",
          open
            ? "border-[#b88a3b]/70 shadow-[0_12px_30px_rgba(36,38,23,0.08)]"
            : "border-[#242617]/10 hover:border-[#b88a3b]/55",
        ].join(" ")}
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
          className={[
            "h-2.5 w-2.5 shrink-0 border-r border-t border-[#242617]/55 transition-transform duration-200",
            open ? "-translate-y-0.5 rotate-[135deg]" : "rotate-[45deg]",
          ].join(" ")}
        />
      </button>

      <div
        className={[
          "absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#242617]/12 bg-[#f4efe4] p-1 shadow-[0_18px_45px_rgba(36,38,23,0.16)] transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        ].join(" ")}
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={[
                "block w-full cursor-pointer rounded-xl px-4 py-3 text-left transition",
                isSelected
                  ? "bg-[#242617] text-[#f4efe4]"
                  : "text-[#242617]/60 hover:bg-[#e8dfcf] hover:text-[#242617]",
              ].join(" ")}
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em]">
                {option.label}
              </span>
              <span
                className={[
                  "mt-1 block text-xs leading-5",
                  isSelected ? "text-[#f4efe4]/62" : "text-[#242617]/42",
                ].join(" ")}
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


export function PortfolioGalleryBulkUploader({
  existingImageUrls = [],
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
      const knownImageUrls = new Set([
        ...existingImageUrls,
        ...photos.map((photo) => photo.imageSrc),
      ]);

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

        if (knownImageUrls.has(imageSrc)) {
          throw new Error(DUPLICATE_IMAGE_ERROR);
        }

        knownImageUrls.add(imageSrc);

        uploadedPhotos.push({
          imageSrc,
          title: titleFromFileName(file.name),
          originalName: file.name,
          watermark: "NONE",
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

  function updatePhoto(index: number, patch: Partial<UploadedPhoto>) {
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo, photoIndex) =>
        photoIndex === index ? { ...photo, ...patch } : photo,
      ),
    );
  }

  function removePhoto(index: number) {
    setPhotos((currentPhotos) =>
      currentPhotos.filter((_, photoIndex) => photoIndex !== index),
    );
  }

  return (
    <form
      id="portfolio-gallery-upload-form"
      action={createPortfolioGalleryPhotos}
      className="contents"
    >
      <input type="hidden" name="images" value={JSON.stringify(photos)} />
      <input type="hidden" name="returnTo" value={returnTo} />

      {lockedCategory ? (
        <input type="hidden" name="categoryId" value={categoryId} />
      ) : (
        <label className="block rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_22px_70px_rgba(20,20,10,0.07)]">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
            Portfolio category
          </span>
          <select
            name="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="mt-3 h-[58px] w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 text-sm text-[#242617] outline-none focus:border-[#b88a3b]"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <section className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_22px_70px_rgba(20,20,10,0.07)] xl:col-start-2">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={[
            "flex min-h-[252px] cursor-pointer flex-col items-center justify-center rounded-[1.8rem] border border-dashed px-6 py-10 text-center transition",
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
      </section>

      {photos.length > 0 ? (
        <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_22px_70px_rgba(20,20,10,0.07)] xl:col-span-2">
          <div className="flex flex-col justify-between gap-4 border-b border-[#242617]/10 p-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
                Pending upload
              </p>

              <h3 className="mt-2 font-serif text-3xl leading-none tracking-[-0.04em] text-[#242617]">
                Photos ready to save
              </h3>
            </div>

            <p className="text-xs uppercase tracking-[0.16em] text-[#242617]/42">
              {photos.length} {photos.length === 1 ? "photo" : "photos"} ready
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,320px))] justify-start gap-5 p-6">
            {photos.map((photo, index) => {
              const watermarkEnabled = getWatermarkEnabled(photo.watermark);

              return (
                <article
                  key={`${photo.imageSrc}-${index}`}
                  className="overflow-hidden rounded-[1.5rem] border border-[#242617]/10 bg-[#f4efe4]/60"
                >
                  <div
                    className="aspect-[4/3] bg-cover bg-center"
                    style={{ backgroundImage: `url(${photo.imageSrc})` }}
                  />

                  <div className="space-y-4 p-4">
                    <div>
                      <p className="truncate text-sm font-semibold text-[#242617]">
                        {photo.title || "Untitled photo"}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#242617]/38">
                        {photo.originalName}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#242617]/10 bg-white/45 p-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/45">
                            Watermark
                          </p>
                          <p className="mt-1 text-xs text-[#242617]/40">
                            {watermarkOwnerLabel(photo.watermark)}
                          </p>
                        </div>

                        <button
                          type="button"
                          aria-pressed={watermarkEnabled}
                          onClick={() =>
                            updatePhoto(index, {
                              watermark: watermarkEnabled ? "NONE" : "ANDREW",
                            })
                          }
                          className={[
                            "relative h-8 w-14 rounded-full border transition",
                            watermarkEnabled
                              ? "border-[#b88a3b]/40 bg-[#242617]"
                              : "border-[#242617]/12 bg-[#e8dfcf]",
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
                          {(["ANDREW", "MORGANE"] as const).map((owner) => {
                            const selected = photo.watermark === owner;

                            return (
                              <button
                                key={owner}
                                type="button"
                                onClick={() =>
                                  updatePhoto(index, { watermark: owner })
                                }
                                className={[
                                  "rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition",
                                  selected
                                    ? "bg-[#242617] text-[#f4efe4]"
                                    : "text-[#242617]/45 hover:text-[#242617]",
                                ].join(" ")}
                              >
                                {owner === "ANDREW" ? "Andrew" : "Morgane"}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#242617]/40 transition hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex justify-end border-t border-[#242617]/8 p-6">
            <button
              type="submit"
              disabled={uploading || photos.length === 0}
              className="w-fit cursor-pointer rounded-full bg-[#242617] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:-translate-y-0.5 hover:bg-[#b88a3b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitLabel}
            </button>
          </div>
        </section>
      ) : null}
    </form>
  );
}
