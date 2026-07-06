import type { ReactNode } from "react";
import { AdminLogin } from "@/components/admin/auth/AdminLogin";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <AdminLogin />;
  }

  return <AdminShell>{children}</AdminShell>;
}
