"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function StorageAuditQuickNav() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateVisibility = () => {
      setVisible(window.scrollY > 420);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed right-5 top-40 z-[80] flex h-12 w-12 items-center justify-center rounded-full border border-[#d5ad68]/35 bg-[#071321] text-3xl leading-none text-[#f4efe4] shadow-[0_20px_60px_rgba(7,19,33,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#142844] lg:right-8 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-5 opacity-0"
      }`}
    >
      <span
        aria-hidden="true"
        className="block -mt-1 rotate-90"
      >
        ‹
      </span>
    </button>,
    document.body,
  );
}
