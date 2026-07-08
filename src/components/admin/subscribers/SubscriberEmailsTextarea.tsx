"use client";

import { useRef } from "react";

export function SubscriberEmailsTextarea() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function resize() {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(190, textarea.scrollHeight)}px`;
  }

  return (
    <textarea
      ref={textareaRef}
      name="csvText"
      rows={1}
      onInput={resize}
      placeholder={"hello@example.com\nteam@example.com\nclient@example.com"}
      className="min-h-[190px] w-full resize-none overflow-hidden rounded-[1.75rem] border border-[#242617]/10 bg-white/35 px-6 py-5 text-sm leading-7 text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b] focus:bg-white/55"
    />
  );
}
