"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useEffect, useState } from "react";

type ConfirmSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  confirmLabel?: string;
  resetMs?: number;
};

export function ConfirmSubmitButton({
  children,
  confirmLabel = "Are you sure?",
  resetMs = 2800,
  type = "submit",
  onClick,
  ...props
}: ConfirmSubmitButtonProps) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;

    const timeout = window.setTimeout(() => {
      setConfirming(false);
    }, resetMs);

    return () => window.clearTimeout(timeout);
  }, [confirming, resetMs]);

  return (
    <button
      {...props}
      type={type}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (!confirming) {
          event.preventDefault();
          setConfirming(true);
        }
      }}
    >
      {confirming ? confirmLabel : children}
    </button>
  );
}
