"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FloatingBackButtonProps = {
  href: string;
};

export function FloatingBackButton({ href }: FloatingBackButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 360);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Link
      href={href}
      aria-label="Back"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translate3d(0, 0, 0) scale(1)"
          : "translate3d(0, -76px, 0) scale(0.86)",
        filter: visible ? "blur(0px)" : "blur(2px)",
        transition:
          "opacity 620ms cubic-bezier(0.16, 1, 0.3, 1), transform 720ms cubic-bezier(0.16, 1, 0.3, 1), filter 620ms cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "opacity, transform, filter",
      }}
      className={`fixed right-5 top-5 z-[80] flex h-12 w-12 origin-top-right cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#d5ad68]/25 bg-[#071321] text-[#f4efe4] shadow-[0_18px_60px_rgba(7,19,33,0.28)] backdrop-blur-md hover:border-[#071321] hover:bg-[#f4efe4] hover:text-[#071321] ${
        visible ? "" : "pointer-events-none"
      }`}
    >
      <span className="-mt-[3px] translate-x-[-1px] font-serif text-3xl leading-none">
        &lt;
      </span>
    </Link>
  );
}
