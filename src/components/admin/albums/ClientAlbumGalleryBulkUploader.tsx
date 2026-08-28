"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { compressImageBeforeUpload } from "@/lib/admin/clientImageCompression";
import { createClientAlbumGalleryPhotos } from "@/server/actions/client-album-gallery-photos";

type Watermark = "NONE" | "ANDREW" | "MORGANE";

const DUPLICATE_IMAGE_ERROR = "Fichier double déjà présent sur cette page.";

type PendingPhoto = {
  id: string;
  imageSrc: string;
  title: string;
  originalName: string;
  watermark: Watermark;
};

type ClientAlbumGalleryBulkUploaderProps = {
  existingImageUrls?: string[];
  albumId: string;
  albumSlug: string;
  returnTo: string;
};

type UploadResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  src?: string;
  path?: string;
  url?: string;
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

function pendingId() {
  return `pending-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ClientAlbumGalleryBulkUploader({
  existingImageUrls = [],
  albumId,
  albumSlug,
  returnTo,
}: ClientAlbumGalleryBulkUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const photosPayload = useMemo(
    () =>
      JSON.stringify(
        photos.map(({ imageSrc, title, originalName, watermark }) => ({
          imageSrc,
          title,
          originalName,
          watermark,
        })),
      ),
    [photos],
  );

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) return;

    setUploading(true);
    setError("");

    const knownImageUrls = new Set([
      ...existingImageUrls,
      ...photos.map((photo) => photo.imageSrc),
    ]);

    for (const [index, originalFile] of files.entries()) {
      setProgress(`${index + 1} / ${files.length}`);

      try {
        const preparedFile = await compressImageBeforeUpload(originalFile);
        const formData = new FormData();

        formData.append("file", preparedFile);
        formData.append("context", "client-album");
        formData.append("entitySlug", albumSlug);
        formData.append(
          "slotKey",
          `gallery-${Date.now()}-${index}-${slugify(originalFile.name)}`,
        );

        const response = await fetch("/api/admin/uploads/image", {
          method: "POST",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const responseBody = await response.text();
        let result: UploadResponse | null = null;

        if (responseBody) {
          try {
            result = JSON.parse(responseBody) as UploadResponse;
          } catch {
            result = null;
          }
        }

        if (!response.ok || result?.ok === false) {
          const responsePreview = responseBody
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 180);

          throw new Error(
            result?.error ||
              result?.message ||
              `HTTP ${response.status}${
                response.statusText ? ` ${response.statusText}` : ""
              }${
                responsePreview ? ` — ${responsePreview}` : ""
              } · file ${(preparedFile.size / 1_000_000).toFixed(1)} MB`,
          );
        }

        const imageSrc = result?.src || result?.url || result?.path || "";

        if (!imageSrc) {
          throw new Error(
            `Upload returned no image URL (HTTP ${response.status}).`,
          );
        }

        if (knownImageUrls.has(imageSrc)) {
          throw new Error(DUPLICATE_IMAGE_ERROR);
        }

        knownImageUrls.add(imageSrc);

        const pendingPhoto: PendingPhoto = {
          id: pendingId(),
          imageSrc,
          title: titleFromFileName(originalFile.name),
          originalName: originalFile.name,
          watermark: "NONE",
        };

        setPhotos((current) => [...current, pendingPhoto]);
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Upload failed.";

        setError(
          message === DUPLICATE_IMAGE_ERROR
            ? DUPLICATE_IMAGE_ERROR
            : `${originalFile.name}: ${message}`,
        );
      }
    }

    setUploading(false);
    setProgress("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function updatePhoto(id: string, patch: Partial<PendingPhoto>) {
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === id ? { ...photo, ...patch } : photo,
      ),
    );
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      void uploadFiles(event.target.files);
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    void uploadFiles(event.dataTransfer.files);
  }

  return (
    <>
      <section className="h-full rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
              Add to gallery
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#242617]">
              Upload photos
            </h2>
          </div>

          {uploading ? (
            <span className="rounded-full bg-[#071008] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f4efe4]">
              Uploading {progress}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-72 w-full cursor-pointer flex-col items-center justify-center rounded-[1.8rem] border border-dashed px-6 text-center transition ${
            dragging
              ? "border-[#b88a3b] bg-[#b88a3b]/10"
              : "border-[#242617]/15 bg-[#f4efe4]/35 hover:border-[#b88a3b]"
          }`}
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#242617]/10 text-4xl font-light text-[#242617]/40">
            ↑
          </span>
          <span className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#242617]/45">
            Drop photos or click to upload
          </span>
          <span className="mt-3 text-xs text-[#242617]/35">
            Multiple images · automatic WebP optimization
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      {photos.length > 0 ? (
        <form
          action={createClientAlbumGalleryPhotos}
          className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_22px_70px_rgba(20,20,10,0.07)] xl:col-span-2"
        >
          <input type="hidden" name="albumId" value={albumId} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="images" value={photosPayload} />

          <div className="flex flex-col justify-between gap-4 border-b border-[#242617]/10 px-6 py-5 md:flex-row md:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
                Pending upload
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#242617]">
                Photos ready to save
              </h2>
            </div>

            <p className="text-xs uppercase tracking-[0.16em] text-[#242617]/40">
              {photos.length} photo{photos.length > 1 ? "s" : ""} ready
            </p>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {photos.map((photo) => {
              const watermarkEnabled = photo.watermark !== "NONE";

              return (
                <article
                  key={photo.id}
                  className="overflow-hidden rounded-[1.6rem] border border-[#242617]/10 bg-[#f8f4eb]/80"
                >
                  <img
                    src={photo.imageSrc}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                  />

                  <div className="space-y-4 p-5">
                    <div>
                      <input
                        value={photo.title}
                        aria-label={`Title for ${photo.originalName}`}
                        onChange={(event) =>
                          updatePhoto(photo.id, {
                            title: event.target.value,
                          })
                        }
                        className="w-full border-0 bg-transparent font-serif text-xl text-[#242617] outline-none"
                      />
                      <p className="mt-1 truncate text-xs text-[#242617]/35">
                        {photo.originalName}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#242617]/10 bg-white/55 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#242617]/40">
                            Watermark
                          </p>
                          <p className="mt-1 text-xs text-[#242617]/40">
                            {watermarkEnabled
                              ? photo.watermark === "ANDREW"
                                ? "Andrew"
                                : "Morgane"
                              : "None"}
                          </p>
                        </div>

                        <button
                          type="button"
                          aria-label="Toggle watermark"
                          onClick={() =>
                            updatePhoto(photo.id, {
                              watermark: watermarkEnabled
                                ? "NONE"
                                : "ANDREW",
                            })
                          }
                          className={`relative h-7 w-12 cursor-pointer rounded-full transition ${
                            watermarkEnabled
                              ? "bg-[#b88a3b]"
                              : "bg-[#242617]/10"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                              watermarkEnabled ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      {watermarkEnabled ? (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {(["ANDREW", "MORGANE"] as const).map((owner) => (
                            <button
                              key={owner}
                              type="button"
                              onClick={() =>
                                updatePhoto(photo.id, { watermark: owner })
                              }
                              className={`cursor-pointer rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition ${
                                photo.watermark === owner
                                  ? "border-[#242617] bg-[#242617] text-[#f4efe4]"
                                  : "border-[#242617]/10 text-[#242617]/45 hover:border-[#b88a3b]"
                              }`}
                            >
                              {owner === "ANDREW" ? "Andrew" : "Morgane"}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.16em] text-red-900/45 transition hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex justify-end border-t border-[#242617]/10 px-6 py-5">
            <button
              type="submit"
              disabled={uploading || photos.length === 0}
              className="min-w-52 cursor-pointer rounded-full bg-[#242617] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#f4efe4] transition hover:bg-[#b88a3b] disabled:cursor-not-allowed disabled:opacity-35"
            >
              Add {photos.length} photo{photos.length > 1 ? "s" : ""}
            </button>
          </div>
        </form>
      ) : null}
    </>
  );
}
