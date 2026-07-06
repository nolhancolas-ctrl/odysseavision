import {
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = String(body.password ?? "");

  if (!(await verifyAdminPassword(password))) {
    return Response.json({ ok: false });
  }

  await setAdminSessionCookie();

  return Response.json({
    ok: true,
    redirectTo: "/admin",
  });
}
