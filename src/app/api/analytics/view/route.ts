import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function cleanPath(value: unknown) {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();

  if (!trimmed.startsWith("/")) return "";
  if (trimmed.startsWith("/admin")) return "";
  if (trimmed.startsWith("/api")) return "";

  return trimmed.slice(0, 300);
}

function analyticsResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  try {
    if (await isAdminAuthenticated()) {
      return analyticsResponse({
        ok: true,
        tracked: false,
        reason: "admin-session",
      });
    }

    const body = await request.json().catch(() => ({}));
    const path = cleanPath(body.path);

    if (!path) {
      return analyticsResponse({
        ok: false,
        tracked: false,
      });
    }

    await db.pageView.create({
      data: {
        path,
        referrer:
          request.headers
            .get("referer")
            ?.slice(0, 500) ?? null,
        userAgent:
          request.headers
            .get("user-agent")
            ?.slice(0, 500) ?? null,
      },
    });

    return analyticsResponse({
      ok: true,
      tracked: true,
    });
  } catch {
    return analyticsResponse(
      {
        ok: false,
        tracked: false,
      },
      500,
    );
  }
}
