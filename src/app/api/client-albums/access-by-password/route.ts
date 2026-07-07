import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getAlbumAccessCookieName,
  getAlbumAccessToken,
  hashAlbumPassword,
} from "@/lib/client-albums/access";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    password?: string;
  };

  const password = String(body.password ?? "").trim();

  if (!password) {
    return NextResponse.json(
      { ok: false, message: "Missing password." },
      { status: 400 },
    );
  }

  const passwordHash = hashAlbumPassword(password);

  const album = await db.clientAlbum.findFirst({
    where: {
      status: "PUBLISHED",
      passwordHash,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      slug: true,
      passwordHash: true,
    },
  });

  if (!album?.passwordHash) {
    return NextResponse.json(
      { ok: false, message: "Gallery not found." },
      { status: 404 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    redirectTo: `/client-albums/${album.slug}`,
  });

  response.cookies.set({
    name: getAlbumAccessCookieName(album.id),
    value: getAlbumAccessToken(album.id, album.passwordHash),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/client-albums/${album.slug}`,
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}
