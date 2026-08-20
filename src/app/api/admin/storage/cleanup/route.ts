import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { cleanupAbandonedBlobs } from "@/lib/admin/blobCleanup";

export const dynamic = "force-dynamic";

export async function POST() {
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

  try {
    const result =
      await cleanupAbandonedBlobs(250);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "[admin storage cleanup]",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Could not clean unused storage.",
      },
      {
        status: 500,
      },
    );
  }
}
