"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
  updateAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin/auth";

export async function loginAdminAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!(await verifyAdminPassword(password))) {
    redirect("/admin?auth=invalid");
  }

  await setAdminSessionCookie();
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  redirect("/admin");
}

export async function updateAdminPasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < 8) {
    redirect("/admin/settings?auth=too-short");
  }

  if (password !== confirmation) {
    redirect("/admin/settings?auth=mismatch");
  }

  await updateAdminPassword(password);
  redirect("/admin/settings?auth=updated");
}
