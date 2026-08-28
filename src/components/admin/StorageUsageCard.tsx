"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type StorageUsage = {
  ok: true;

  usedBytes: number;
  limitBytes: number;

  percentage: number;
  remainingBytes: number;

  fileCount: number;

  orphanedCount: number;
  orphanedBytes: number;

  reclaimableCount: number;
  reclaimableBytes: number;

  checkedAt: string;
};

const AUTO_CLEAN_KEY =
  "ov-storage-cleanup-last-run";

function formatBytes(bytes: number) {
  if (
    !Number.isFinite(bytes) ||
    bytes <= 0
  ) {
    return "0 MB";
  }

  const mb = bytes / 1_000_000;

  if (mb < 1000) {
    return `${mb.toFixed(
      mb >= 100 ? 0 : 1,
    )} MB`;
  }

  return `${(mb / 1000).toFixed(2)} GB`;
}

function getStorageState(
  percentage: number,
) {
  if (percentage >= 90) {
    return {
      label: "Almost full",
      detail:
        "Uploads may fail soon.",
      barClass: "bg-[#9b3e32]",
      textClass: "text-[#8a3d2f]",
    };
  }

  if (percentage >= 70) {
    return {
      label: "Getting full",
      detail:
        "Storage should be monitored.",
      barClass: "bg-[#b88a3b]",
      textClass: "text-[#84652d]",
    };
  }

  return {
    label: "Storage healthy",
    detail:
      "Plenty of space available.",
    barClass: "bg-[#2b6b3c]",
    textClass: "text-[#286235]",
  };
}

export function StorageUsageCard() {
  const [usage, setUsage] =
    useState<StorageUsage | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [cleaning, setCleaning] =
    useState(false);

  const [error, setError] =
    useState("");

  const [cleanupMessage, setCleanupMessage] =
    useState("");

  const refresh = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        "/api/admin/storage",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result =
        await response
          .json()
          .catch(() => null);

      if (
        !response.ok ||
        !result?.ok
      ) {
        throw new Error(
          result?.error ||
            "Could not read storage usage.",
        );
      }

      setUsage(result);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Could not read storage usage.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const cleanUnused =
    useCallback(async () => {
      if (cleaning) {
        return;
      }

      setCleaning(true);
      setCleanupMessage("");

      try {
        const response = await fetch(
          "/api/admin/storage/cleanup",
          {
            method: "POST",
          },
        );

        const result =
          await response
            .json()
            .catch(() => null);

        if (
          !response.ok ||
          !result?.ok
        ) {
          throw new Error(
            result?.error ||
              "Cleanup failed.",
          );
        }

        const deleted =
          Number(result.deleted || 0);

        const deletedBytes =
          Number(
            result.deletedBytes || 0,
          );

        setCleanupMessage(
          deleted > 0
            ? `${deleted} unused file${
                deleted === 1 ? "" : "s"
              } removed · ${formatBytes(
                deletedBytes,
              )} reclaimed`
            : "No old unused files to clean.",
        );

        window.localStorage.setItem(
          AUTO_CLEAN_KEY,
          String(Date.now()),
        );

        await refresh();
      } catch (currentError) {
        setCleanupMessage(
          currentError instanceof Error
            ? currentError.message
            : "Cleanup failed.",
        );
      } finally {
        setCleaning(false);
      }
    }, [cleaning, refresh]);

  useEffect(() => {
    // One inventory when the dashboard opens.
    // Further Blob inventories require an explicit click on Refresh.
    void refresh();
  }, [refresh]);


  if (!usage && loading) {
    return (
      <section className="rounded-3xl border border-[#11170f]/10 bg-white/42 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#11170f]/48">
          Storage
        </p>

        <p className="mt-4 text-sm text-[#11170f]/45">
          Checking Blob storage...
        </p>
      </section>
    );
  }

  if (!usage) {
    return (
      <section className="rounded-3xl border border-red-900/10 bg-white/42 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#11170f]/48">
              Storage
            </p>

            <p className="mt-3 text-sm text-red-900/65">
              {error ||
                "Storage usage unavailable."}
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="cursor-pointer rounded-full border border-[#11170f]/12 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#11170f]/55"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const percentage = Math.max(
    0,
    usage.percentage,
  );

  const visualPercentage = Math.min(
    100,
    percentage,
  );

  const state =
    getStorageState(percentage);

  return (
    <section
      className="rounded-3xl border border-[#11170f]/10 bg-white/42 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]"
      aria-live="polite"
    >
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#11170f]/48">
            Blob storage
          </p>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-serif text-4xl leading-none text-[#11170f]">
              {formatBytes(
                usage.usedBytes,
              )}
            </p>

            <p className="text-sm text-[#11170f]/42">
              of{" "}
              {formatBytes(
                usage.limitBytes,
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p
              className={`text-sm font-semibold ${state.textClass}`}
            >
              {percentage.toFixed(1)}%
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#11170f]/35">
              {usage.fileCount} files
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="cursor-pointer rounded-full border border-[#11170f]/12 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#11170f]/55 transition hover:bg-[#071321] hover:text-[#f4efe4] disabled:opacity-40"
          >
            {loading
              ? "Checking..."
              : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[#11170f]/8">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ${state.barClass}`}
          style={{
            width: `${visualPercentage}%`,
          }}
        />
      </div>

      <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p
            className={`text-sm font-semibold ${state.textClass}`}
          >
            {state.label}
          </p>

          <p className="mt-1 text-xs text-[#11170f]/42">
            {state.detail}
          </p>

          {usage.orphanedCount > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold text-[#84652d]">
                {usage.orphanedCount} unused{" "}
                {usage.orphanedCount === 1
                  ? "file"
                  : "files"}{" "}
                ·{" "}
                {formatBytes(
                  usage.orphanedBytes,
                )}
              </p>

              <p className="mt-1 text-[11px] text-[#11170f]/38">
                {
                  usage.reclaimableCount
                }{" "}
                older than 48h ·{" "}
                {formatBytes(
                  usage.reclaimableBytes,
                )}{" "}
                safely reclaimable
              </p>
            </div>
          ) : (
            <p className="mt-4 text-xs text-[#286235]">
              No unused files detected.
            </p>
          )}

          {cleanupMessage ? (
            <p className="mt-3 text-xs text-[#11170f]/50">
              {cleanupMessage}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-xs text-[#11170f]/38">
            {usage.remainingBytes > 0
              ? `${formatBytes(
                  usage.remainingBytes,
                )} remaining`
              : "Storage quota reached"}
          </p>

          {usage.reclaimableCount >
          0 ? (
            <button
              type="button"
              onClick={cleanUnused}
              disabled={cleaning}
              className="cursor-pointer rounded-full border border-[#84652d]/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#84652d] transition hover:bg-[#84652d] hover:text-white disabled:cursor-wait disabled:opacity-40"
            >
              {cleaning
                ? "Cleaning..."
                : "Clean unused"}
            </button>
          ) : null}

          <Link
            href="/admin/storage-audit"
            className="rounded-full border border-[#11170f]/12 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#11170f]/55 transition hover:bg-[#071321] hover:text-[#f4efe4]"
          >
            Audit recent uploads
          </Link>
        </div>
      </div>
    </section>
  );
}
