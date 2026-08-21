import Link from "next/link";
import {
  getRecentBlobImageAudit,
  type BlobImageAuditRow,
} from "@/lib/admin/blobImageAudit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 MB";
  }

  const megabytes = bytes / 1_000_000;
  return megabytes < 1000
    ? `${megabytes.toFixed(megabytes >= 100 ? 0 : 1)} MB`
    : `${(megabytes / 1000).toFixed(2)} GB`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
}

function getStatusClasses(status: BlobImageAuditRow["status"]) {
  if (status === "optimizable") {
    return "bg-[#eadfc8] text-[#84652d]";
  }

  if (status === "optimized") {
    return "bg-[#d9ead5] text-[#286235]";
  }

  if (status === "failed") {
    return "bg-[#e8d6d1] text-[#8a3d2f]";
  }

  return "bg-[#e6e1d7] text-[#5f5a4f]";
}

function getStatusLabel(status: BlobImageAuditRow["status"]) {
  if (status === "optimizable") return "Optimize";
  if (status === "optimized") return "Optimized";
  if (status === "review") return "Review";
  if (status === "skipped") return "Skipped";
  return "Failed";
}

export default async function StorageAuditPage() {
  const audit = await getRecentBlobImageAudit(15);

  return (
    <div className="space-y-7">
      <section className="max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
          Read-only diagnostic
        </p>

        <h1 className="mt-3 font-serif text-4xl leading-none tracking-[-0.04em] text-[#11170f] md:text-6xl">
          Recent Blob audit
        </h1>

        <p className="mt-5 max-w-3xl text-sm leading-6 text-[#11170f]/55">
          The 15 latest files are downloaded and simulated against the current
          2200px, WebP quality 82 policy. Nothing is uploaded, replaced, deleted
          or written to the database.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/storage-audit"
            className="rounded-full bg-[#071321] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f4efe4]"
          >
            Run audit again
          </Link>

          <Link
            href="/admin"
            className="rounded-full border border-[#11170f]/12 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#11170f]/55"
          >
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total storage", formatBytes(audit.storage.totalBytes)],
          ["Unused storage", formatBytes(audit.storage.orphanedBytes)],
          ["Recent files checked", String(audit.sample.count)],
          ["Projected saving", formatBytes(audit.sample.projectedSavingBytes)],
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
            {audit.sample.optimizableCount} potentially optimizable ·{" "}
            {audit.sample.unusedCount} unused · {audit.sample.failedCount} failed
          </p>
          <p className="mt-1 text-xs text-[#11170f]/42">
            Generated {formatDate(audit.generatedAt)}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-left">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#11170f]/38">
                <th className="px-5 py-4">File</th>
                <th className="px-4 py-4">Stored</th>
                <th className="px-4 py-4">Image</th>
                <th className="px-4 py-4">Projected</th>
                <th className="px-4 py-4">Usage</th>
                <th className="px-5 py-4">Assessment</th>
              </tr>
            </thead>
            <tbody>
              {audit.rows.map((row) => (
                <tr
                  key={`${row.pathname}-${row.uploadedAt || "unknown"}`}
                  className="border-t border-[#11170f]/8 align-top text-xs text-[#11170f]/62"
                >
                  <td className="max-w-[300px] px-5 py-4">
                    <p className="break-all font-medium text-[#11170f]">
                      {row.pathname}
                    </p>
                    <p className="mt-1 text-[10px] text-[#11170f]/38">
                      {formatDate(row.uploadedAt)}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {formatBytes(row.size)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <p>{row.format || row.contentType || "Unknown"}</p>
                    <p className="mt-1 text-[10px] text-[#11170f]/38">
                      {row.width && row.height
                        ? `${row.width} × ${row.height}px`
                        : "Dimensions unavailable"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {row.projectedSize === null ? (
                      "—"
                    ) : (
                      <>
                        <p>{formatBytes(row.projectedSize)}</p>
                        <p className="mt-1 text-[10px] text-[#11170f]/38">
                          {row.projectedSavingPercent.toFixed(0)}% smaller
                        </p>
                      </>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {row.referenced ? "Referenced" : "Unused"}
                  </td>
                  <td className="max-w-[260px] px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${getStatusClasses(row.status)}`}
                    >
                      {getStatusLabel(row.status)}
                    </span>
                    <p className="mt-2 leading-5">{row.note}</p>
                    {row.policyIssues.length > 0 ? (
                      <p className="mt-1 text-[10px] text-[#84652d]">
                        {row.policyIssues.join(" · ")}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
