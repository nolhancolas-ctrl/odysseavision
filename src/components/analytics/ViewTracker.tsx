"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;
    if (pathname.startsWith("/api")) return;

    const payload = JSON.stringify({ path: pathname });

    if ("sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/view", blob);
      return;
    }

    fetch("/api/analytics/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
