"use client";

import * as React from "react";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";
import type { Client, ClientAlbum } from "@prisma/client";

type ClientAlbumSettingsFormProps = {
  album: ClientAlbum;
  clients: Client[];
  action: (formData: FormData) => Promise<void>;
  returnTo: string;
};

type SettingsPanel = "global" | "access" | null;

function dateInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

const fieldClass =
  "w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-2.5 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45";

const primaryButtonClass =
  "rounded-full bg-[#242617] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#f4efe4] transition hover:bg-[#b88a3b]";

const secondaryButtonClass =
  "rounded-full border border-[#242617]/10 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/45 transition hover:bg-[#242617] hover:text-[#f4efe4]";

function SettingsModal({
  eyebrow,
  title,
  onClose,
  children,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#071729]/45 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-album-settings-title"
      onClick={onClose}
    >
      <div
        className="my-auto max-h-[90vh] w-[90%] max-w-[50.4rem] overflow-y-auto rounded-[1.8rem] border border-white/60 bg-[#faf7ef] shadow-[0_30px_80px_rgba(5,17,28,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-[#242617]/10 bg-[#faf7ef]/95 px-5 py-4 backdrop-blur-xl md:px-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
              {eyebrow}
            </p>
            <h2
              id="client-album-settings-title"
              className="mt-1.5 font-serif text-3xl tracking-[-0.04em] text-[#242617]"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#071729] text-lg text-white transition hover:bg-[#b88a3b]"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}


type CoverUploadResult = {
  ok?: boolean;
  error?: string;
  message?: string;
  src?: string;
  url?: string;
  path?: string;
};

function ClientAlbumCoverField({
  initialSrc,
  entitySlug,
}: {
  initialSrc: string;
  entitySlug: string;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [src, setSrc] = React.useState(initialSrc);
  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [error, setError] = React.useState("");

  async function uploadCover(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "client-album");
      formData.append("entitySlug", entitySlug || "draft");
      formData.append("slotKey", "cover");

      const response = await fetch("/api/admin/uploads/image", {
        method: "POST",
        body: formData,
      });

      const result = (await response
        .json()
        .catch(() => null)) as CoverUploadResult | null;

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error ||
            result?.message ||
            "The cover image could not be uploaded.",
        );
      }

      const nextSrc = result.src || result.url || result.path || "";

      if (!nextSrc) {
        throw new Error("The uploaded image URL is missing.");
      }

      setSrc(nextSrc);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The cover image could not be uploaded.",
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="sm:col-span-2">
      <label className={labelClass}>Cover image</label>
      <input type="hidden" name="coverSrc" value={src} />

      <div className="space-y-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setDragging(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);

            const file = event.dataTransfer.files?.[0];

            if (file) {
              void uploadCover(file);
            }
          }}
          className={`group relative flex min-h-[190px] w-full cursor-pointer overflow-hidden rounded-[1.5rem] border border-dashed text-left transition ${
            dragging
              ? "border-[#b88a3b] bg-white/75"
              : "border-[#242617]/15 bg-[#f4efe4]/75 hover:border-[#b88a3b]/70 hover:bg-white/60"
          } ${uploading ? "cursor-wait opacity-70" : ""}`}
        >
          {src ? (
            <>
              <img
                src={src}
                alt="Current album cover"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-[#071321]/15 transition group-hover:bg-[#071321]/38" />
              <span className="absolute inset-x-4 bottom-4 rounded-2xl bg-[#071321]/78 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#f4efe4] backdrop-blur-sm">
                {uploading ? "Uploading..." : "Click or drop to replace"}
              </span>
            </>
          ) : (
            <span className="flex min-h-[190px] w-full flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#242617]/12 text-2xl text-[#242617]/45">
                +
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#242617]/48">
                {uploading ? "Uploading..." : "Select a cover image"}
              </span>
              <span className="text-xs text-[#242617]/38">
                Click here or drag an image into this area
              </span>
            </span>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void uploadCover(file);
            }
          }}
        />

        {src ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={src}
              onChange={(event) => setSrc(event.target.value)}
              className={`${fieldClass} min-w-0 flex-1 text-xs`}
              aria-label="Album cover URL"
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                setSrc("");
                setError("");
              }}
              className="h-[58px] cursor-pointer rounded-2xl border border-red-900/15 px-5 text-[10px] font-bold uppercase tracking-[0.15em] text-red-900/55 transition hover:bg-red-900 hover:text-white"
            >
              Remove
            </button>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function GlobalHiddenFields({ album }: { album: ClientAlbum }) {
  return (
    <>
      <input type="hidden" name="title" value={album.title} />
      <input type="hidden" name="slug" value={album.slug} />
      <input type="hidden" name="status" value={album.status} />
      <input type="hidden" name="clientId" value={album.clientId ?? ""} />
      <input
        type="hidden"
        name="shootingDate"
        value={dateInputValue(album.shootingDate)}
      />
      <input type="hidden" name="location" value={album.location ?? ""} />
      <input
        type="hidden"
        name="description"
        value={album.description ?? ""}
      />
      <input type="hidden" name="coverSrc" value={album.coverSrc ?? ""} />
    </>
  );
}

function AccessHiddenFields({ album }: { album: ClientAlbum }) {
  return (
    <>
      <input
        type="hidden"
        name="allowDownload"
        value={album.allowDownload ? "on" : ""}
      />
      <input
        type="hidden"
        name="allowShare"
        value={album.allowShare ? "on" : ""}
      />
      <input
        type="hidden"
        name="externalDownloadUrl"
        value={album.externalDownloadUrl ?? ""}
      />
      <input
        type="hidden"
        name="externalDownloadLabel"
        value={album.externalDownloadLabel ?? ""}
      />
      <input
        type="hidden"
        name="expiresAt"
        value={dateInputValue(album.expiresAt)}
      />
    </>
  );
}

export function ClientAlbumSettingsForm({
  album,
  clients,
  action,
  returnTo,
}: ClientAlbumSettingsFormProps) {
  const [activePanel, setActivePanel] = useState<SettingsPanel>(null);

  const assignedClient = clients.find((client) => client.id === album.clientId);
  const assignedClientName = assignedClient
    ? `${assignedClient.firstName} ${assignedClient.lastName ?? ""}`.trim()
    : "No client";

  useEffect(() => {
    if (!activePanel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePanel(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePanel]);

  return (
    <>
      <section className="flex h-full min-h-[23rem] flex-col rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
            Album details
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#242617]">
            Settings
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#242617]/45">
            Manage the album information, permissions and client delivery.
          </p>
        </div>

        <div className="mt-5 grid flex-1 grid-rows-2 gap-3">
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setActivePanel("global")}
            className="group flex w-full items-center justify-between gap-5 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/60 p-5 text-left transition hover:border-[#b88a3b]/60 hover:bg-[#efe4cf]"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b88a3b]">
                Global settings
              </p>
              <p className="mt-2 truncate font-serif text-xl text-[#242617]">
                {album.title}
              </p>
              <p className="mt-1 truncate text-xs text-[#242617]/45">
                {album.status.toLowerCase()} · {assignedClientName}
                {album.location ? ` · ${album.location}` : ""}
              </p>
            </div>

            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#242617]/10 bg-white/60 text-lg text-[#242617]/50 transition group-hover:bg-[#242617] group-hover:text-white">
              →
            </span>
          </button>

          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setActivePanel("access")}
            className="group flex w-full items-center justify-between gap-5 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/60 p-5 text-left transition hover:border-[#b88a3b]/60 hover:bg-[#efe4cf]"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b88a3b]">
                Access & delivery
              </p>
              <p className="mt-2 font-serif text-xl text-[#242617]">
                {album.passwordHash ? "Password protected" : "Open access"}
              </p>
              <p className="mt-1 truncate text-xs text-[#242617]/45">
                {album.allowDownload ? "Downloads enabled" : "Downloads disabled"}
                {" · "}
                {album.allowShare ? "Sharing enabled" : "Sharing disabled"}
              </p>
            </div>

            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#242617]/10 bg-white/60 text-lg text-[#242617]/50 transition group-hover:bg-[#242617] group-hover:text-white">
              →
            </span>
          </button>
        </div>
      </section>

      {activePanel === "global" ? (
        <SettingsModal
          eyebrow="Album configuration"
          title="Global settings"
          onClose={() => setActivePanel(null)}
        >
          <form action={action} className="p-5 md:p-7">
            <input type="hidden" name="returnTo" value={returnTo} />
            <AccessHiddenFields album={album} />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  name="title"
                  required
                  defaultValue={album.title}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>Slug</label>
                <input
                  name="slug"
                  defaultValue={album.slug}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select
                  name="status"
                  defaultValue={album.status}
                  className={`${fieldClass} cursor-pointer appearance-none`}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                    Client
                  </label>
                  <Link
                    href="/admin/clients/new"
                    className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b88a3b] hover:text-[#242617]"
                  >
                    Add client
                  </Link>
                </div>

                <select
                  name="clientId"
                  defaultValue={album.clientId ?? ""}
                  className={`${fieldClass} cursor-pointer appearance-none`}
                >
                  <option value="">No client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName ?? ""}
                      {client.email ? ` — ${client.email}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Shooting date</label>
                <input
                  type="date"
                  name="shootingDate"
                  defaultValue={dateInputValue(album.shootingDate)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>Location</label>
                <input
                  name="location"
                  defaultValue={album.location ?? ""}
                  className={fieldClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  defaultValue={album.description ?? ""}
                  rows={4}
                  className={`${fieldClass} resize-y`}
                />
              </div>

              <ClientAlbumCoverField
                initialSrc={album.coverSrc ?? ""}
                entitySlug={album.slug || album.id}
              />
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#242617]/10 pt-6">
              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className={secondaryButtonClass}
              >
                Cancel
              </button>
              <button type="submit" className={primaryButtonClass}>
                Save global settings
              </button>
            </div>
          </form>
        </SettingsModal>
      ) : null}

      {activePanel === "access" ? (
        <SettingsModal
          eyebrow="Client delivery"
          title="Access & delivery"
          onClose={() => setActivePanel(null)}
        >
          <form action={action} className="p-5 md:p-7">
            <input type="hidden" name="returnTo" value={returnTo} />
            <GlobalHiddenFields album={album} />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Expires at</label>
                <input
                  type="date"
                  name="expiresAt"
                  defaultValue={dateInputValue(album.expiresAt)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>New password</label>
                <input
                  type="password"
                  name="password"
                  className={fieldClass}
                  placeholder="Leave empty to keep it"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>External download link</label>
                <input
                  type="url"
                  name="externalDownloadUrl"
                  defaultValue={album.externalDownloadUrl ?? ""}
                  className={fieldClass}
                  placeholder="https://..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Download label</label>
                <input
                  name="externalDownloadLabel"
                  defaultValue={album.externalDownloadLabel ?? ""}
                  className={fieldClass}
                  placeholder="Download full gallery"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/60 px-4 py-4 text-sm text-[#242617]/65">
                <input
                  type="checkbox"
                  name="allowDownload"
                  defaultChecked={album.allowDownload}
                  className="h-4 w-4 accent-[#b88a3b]"
                />
                Allow downloads
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/60 px-4 py-4 text-sm text-[#242617]/65">
                <input
                  type="checkbox"
                  name="allowShare"
                  defaultChecked={album.allowShare}
                  className="h-4 w-4 accent-[#b88a3b]"
                />
                Allow sharing
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-red-900/10 bg-red-50/40 px-4 py-4 text-sm text-red-900/55 sm:col-span-2">
                <input
                  type="checkbox"
                  name="clearPassword"
                  className="h-4 w-4 accent-red-800"
                />
                Remove the current password
              </label>
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#242617]/10 pt-6">
              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className={secondaryButtonClass}
              >
                Cancel
              </button>
              <button type="submit" className={primaryButtonClass}>
                Save access settings
              </button>
            </div>
          </form>
        </SettingsModal>
      ) : null}
    </>
  );
}
