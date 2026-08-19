import { NextResponse } from "next/server";
import { getSeoSettings } from "@/lib/content/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSeoSettings();

  return NextResponse.json(settings.watermarks);
}
