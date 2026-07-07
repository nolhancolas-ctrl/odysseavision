import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getAlbumAccessCookieName,
  getAlbumAccessToken,
  verifyAlbumPassword,
} from "@/lib/client-albums/access";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    password?: string;
  };

  const slug = String(body.slug ?? "").trim();
  const password = String(body.password ?? "").trim();

  if (!slug) {
    return NextResponse.json(
      { ok: false, message: "Missing album slug." },
      { status: 400 },
    );
  }

  const album = await db.clientAlbum.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!album) {
    return NextResponse.json(
      { ok: false, message: "Album not found." },
      { status: 404 },
    );
  }

  if (!album.passwordHash) {
    return NextResponse.json({ ok: true });
  }

  if (!password || !verifyAlbumPassword(password, album.passwordHash)) {
    return NextResponse.json(
      { ok: false, message: "Invalid password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: getAlbumAccessCookieName(album.id),
    value: getAlbumAccessToken(album.id, album.passwordHash),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/client-albums/${slug}`,
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}
