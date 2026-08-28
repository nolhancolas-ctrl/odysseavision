import Link from "next/link";
import {
  getBlobImageAudit,
  type BlobImageAuditRow,
} from "@/lib/admin/blobImageAudit";
import { retryFailedBlobImages } from "@/server/actions/storageAudit";
import { StorageAuditControls } from "@/components/admin/storage/StorageAuditControls";
import { StorageAuditQuickNav } from "@/components/admin/storage/StorageAuditQuickNav";
import { StorageAuditTable } from "@/components/admin/storage/StorageAuditTable";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";

  const megabytes = bytes / 1_000_000;
  return megabytes < 1000
    ? `${megabytes.toFixed(megabytes >= 100 ? 0 : 1)} MB`
    : `${(megabytes / 1000).toFixed(2)} GB`;
}

function formatDate(value: string | null) {
  if (!value) return "Not checked yet";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
}

type StorageAuditPageProps = {
  searchParams?: Promise<{ view?: string; status?: string }>;
};

export default async function StorageAuditPage({
  searchParams,
}: StorageAuditPageProps) {
  const params = (await searchParams) ?? {};
  const showAll = params.view === "all";
  const audit = await getBlobImageAudit();

  const rowsByNewest = [...audit.rows].sort((left, right) => {
    const leftDate = left.uploadedAt ? new Date(left.uploadedAt).getTime() : 0;
    const rightDate = right.uploadedAt ? new Date(right.uploadedAt).getTime() : 0;
    return rightDate - leftDate;
  });

  const rowsByContentHash = new Map<string, BlobImageAuditRow[]>();

  for (const row of audit.rows) {
    if (!row.contentHash) continue;

    const group = rowsByContentHash.get(row.contentHash) ?? [];
    group.push(row);
    rowsByContentHash.set(row.contentHash, group);
  }

  const duplicateGroups = [...rowsByContentHash.entries()].filter(
    ([, rows]) => rows.length > 1,
  );
  const duplicateHashes = new Set(
    duplicateGroups.map(([contentHash]) => contentHash),
  );
  const duplicateRows = audit.rows.filter(
    (row) => Boolean(row.contentHash) && duplicateHashes.has(row.contentHash),
  );
  const duplicateGroupCount = duplicateGroups.length;

  const isUnverified = (row: BlobImageAuditRow) =>
    !row.policyCurrent || ["UNKNOWN", "PENDING"].includes(row.status);

  const needsAttention = (row: BlobImageAuditRow) =>
    isUnverified(row) ||
    row.status === "NEEDS_OPTIMIZATION" ||
    row.status === "FAILED";

  const statusFilter = params.status || "all";

  const matchesStatus = (row: BlobImageAuditRow) => {
    if (statusFilter === "waiting") return isUnverified(row);
    if (statusFilter === "optimized") {
      return row.policyCurrent && row.status === "COMPLIANT";
    }
    if (statusFilter === "optimizable") {
      return row.policyCurrent && row.status === "NEEDS_OPTIMIZATION";
    }
    if (statusFilter === "failed") return row.status === "FAILED";
    if (statusFilter === "unused") return !row.referenced;
    if (statusFilter === "duplicates") {
      return Boolean(row.contentHash) && duplicateHashes.has(row.contentHash);
    }
    if (statusFilter === "all") return true;
    return needsAttention(row);
  };

  const filteredRows = rowsByNewest.filter(matchesStatus);
  const visibleRows =
    showAll || statusFilter === "duplicates"
      ? filteredRows
      : filteredRows.slice(0, 50);
  const analyzableCount = audit.rows.filter(
    (row) => row.size >= 500 * 1024 && isUnverified(row),
  ).length;

  const optimizableRows = audit.rows
    .filter(
      (row) =>
        row.policyCurrent &&
        row.status === "NEEDS_OPTIMIZATION" &&
        row.referenced,
    )
    .sort(
      (left, right) =>
        right.projectedSavingBytes - left.projectedSavingBytes ||
        right.size - left.size,
    );

  const optimizableCount = optimizableRows.length;
  const nextOptimizationTarget = optimizableRows[0] || null;

  const statusOptions = [
    {
      value: "attention",
      label: "Needs attention",
      count: audit.rows.filter(needsAttention).length,
    },
    {
      value: "waiting",
      label: "Unverified",
      count: audit.rows.filter(isUnverified).length,
    },
    {
      value: "optimized",
      label: "Optimized",
      count: audit.rows.filter(
        (row) => row.policyCurrent && row.status === "COMPLIANT",
      ).length,
    },
    {
      value: "optimizable",
      label: "To optimize",
      count: audit.rows.filter(
        (row) => row.policyCurrent && row.status === "NEEDS_OPTIMIZATION",
      ).length,
    },
    {
      value: "failed",
      label: "Failed",
      count: audit.rows.filter((row) => row.status === "FAILED").length,
    },
    {
      value: "unused",
      label: "Unused",
      count: audit.rows.filter((row) => !row.referenced).length,
    },
    {
      value: "duplicates",
      label:
        duplicateGroupCount === 1
          ? "Duplicates · 1 group"
          : `Duplicates · ${duplicateGroupCount} groups`,
      count: duplicateRows.length,
    },
    { value: "all", label: "All", count: audit.rows.length },
  ];

  const getAuditHref = (
    nextStatus: string,
    nextShowAll = showAll,
  ) => {
    const query = new URLSearchParams();

    if (nextShowAll) query.set("view", "all");
    if (nextStatus !== "all") query.set("status", nextStatus);

    const value = query.toString();
    return value ? `/admin/storage-audit?${value}` : "/admin/storage-audit";
  };

  return (
    <div className="space-y-7">
      <StorageAuditQuickNav />
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Persistent diagnostic · policy v{audit.policy.version}
          </p>

          <Link
            href="/admin"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#11170f]/12 px-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#11170f]/50 transition-colors hover:bg-[#11170f]/[0.06] hover:text-[#11170f]"
          >
            Back to dashboard
          </Link>
        </div>

        <h1 className="mt-3 font-serif text-4xl leading-none tracking-[-0.04em] text-[#11170f] md:text-6xl">
          Blob image registry
        </h1>

        <p className="mt-5 max-w-3xl text-sm leading-6 text-[#11170f]/55">
          Every Blob is registered, so large imports cannot fall outside the
          audit. New uploads receive a status immediately. Existing files stay
          in the queue until checked against the {audit.policy.maxDimension}px,
          WebP quality {audit.policy.webpQuality} policy. Analysis only writes
          diagnostic metadata; it never replaces or deletes a Blob.
        </p>

        <div className="mt-6 flex flex-wrap items-start gap-2">
          <StorageAuditControls
            initialRemaining={analyzableCount}
            initialAllRemaining={audit.registry.queuedCount}
            initialOptimizable={optimizableCount}
            optimizationEnabled={
              process.env.BLOB_OPTIMIZATION_WRITE_ENABLED === "true"
            }
            optimizationTarget={nextOptimizationTarget?.pathname ?? null}
          />

          {audit.registry.failedCount > 0 ? (
            <form action={retryFailedBlobImages}>
              <button className="rounded-full border border-[#8a3d2f]/25 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a3d2f]">
                Retry 3 failed
              </button>
            </form>
          ) : null}


        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total storage", formatBytes(audit.storage.totalBytes)],
          ["Unused storage", formatBytes(audit.storage.orphanedBytes)],
          ["Waiting for audit", String(audit.registry.queuedCount)],
          ["Projected saving", formatBytes(audit.registry.projectedSavingBytes)],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-3xl border border-[#11170f]/10 bg-white/42 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#11170f]/42">
              {label}
            </p>
            <p className="mt-3 font-serif text-3xl text-[#11170f]">{value}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#11170f]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="border-b border-[#11170f]/8 px-5 py-4">
          <p className="text-sm font-semibold text-[#11170f]">
            {audit.registry.trackedCount} tracked · {audit.registry.compliantCount}{" "}
            optimized · {audit.registry.optimizableCount} to optimize ·{" "}
            {audit.registry.unusedCount} unused · {audit.registry.failedCount} failed
          </p>
          <p className="mt-1 text-xs text-[#11170f]/42">
            {visibleRows.length} displayed · registry loaded from database{" "}
            {formatDate(audit.generatedAt)}
          </p>

          <nav className="mt-4 flex flex-wrap gap-2" aria-label="Audit status filters">
            {statusOptions.map((option) => {
              const active = statusFilter === option.value;

              return (
                <Link
                  key={option.value}
                  href={getAuditHref(option.value)}
                  className={`rounded-full border px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] transition ${
                    active
                      ? "border-[#071321] bg-[#071321] text-[#f4efe4]"
                      : "border-[#11170f]/10 bg-white/30 text-[#11170f]/50 hover:bg-[#11170f]/5"
                  }`}
                >
                  {option.label} · {option.count}
                </Link>
              );
            })}

          </nav>
        </div>

        <StorageAuditTable
            rows={visibleRows}
            groupDuplicates={statusFilter === "duplicates"}
          />

        <div className="flex justify-center border-t border-[#11170f]/8 px-5 py-5">
          <Link
            href={getAuditHref(statusFilter, !showAll)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#b88a3b]/30 bg-[#b88a3b]/[0.08] px-5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7b5a22] transition-colors hover:bg-[#b88a3b]/[0.16]"
          >
            {showAll ? "View latest 50" : "View all files"}
          </Link>
        </div>
      </section>
    </div>
  );
}
