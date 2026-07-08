"use client";

import { ChangeEvent, useRef, useState } from "react";

export function SubscriberImportFileInput() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name || "");
  }

  return (
    <div>
      <input
        ref={inputRef}
        name="csvFile"
        type="file"
        accept=".csv,text/csv,text/plain"
        className="sr-only"
        onChange={handleChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-[190px] w-full cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[#242617]/14 bg-white/35 px-6 py-8 text-center transition hover:border-[#b88a3b]/60 hover:bg-white/55"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#242617]/10 text-2xl text-[#242617]/45">
          ↑
        </span>

        <span className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#242617]/45">
          CSV file
        </span>

        <span className="mt-2 max-w-xs text-sm leading-6 text-[#242617]/45">
          {fileName || "Choose a CSV file"}
        </span>
      </button>
    </div>
  );
}
