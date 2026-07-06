import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const path = cleanPath(body.path);

    if (!path) {
      return NextResponse.json({ ok: false });
    }

    await db.pageView.create({
      data: {
        path,
        referrer: request.headers.get("referer")?.slice(0, 500) ?? null,
        userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
      },
    });

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
