import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getBlobStorageAudit } from "@/lib/admin/blobCleanup";

export const dynamic = "force-dynamic";

// Vercel Hobby: 1 GB decimal.
const DEFAULT_STORAGE_LIMIT_BYTES = 1_000_000_000;

function getStorageLimit() {
  const configured = Number(
    process.env.BLOB_STORAGE_LIMIT_BYTES,
  );

  if (
    Number.isFinite(configured) &&
    configured > 0
  ) {
    return configured;
  }

  return DEFAULT_STORAGE_LIMIT_BYTES;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized.",
      },
      {
        status: 401,
      },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        ok: false,
        error: "Blob storage is not configured.",
      },
      {
        status: 503,
      },
    );
  }

  try {
    const audit = await getBlobStorageAudit();

    const limitBytes = getStorageLimit();

    const percentage =
      limitBytes > 0
        ? (audit.usedBytes / limitBytes) * 100
        : 0;

    return NextResponse.json(
      {
        ok: true,

        usedBytes: audit.usedBytes,
        limitBytes,

        percentage,

        remainingBytes: Math.max(
          0,
          limitBytes - audit.usedBytes,
        ),

        fileCount: audit.fileCount,

        orphanedCount: audit.orphanedCount,
        orphanedBytes: audit.orphanedBytes,

        reclaimableCount:
          audit.reclaimableCount,

        reclaimableBytes:
          audit.reclaimableBytes,

        checkedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "[admin storage usage]",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Could not read Blob storage usage.",
      },
      {
        status: 500,
      },
    );
  }
}
