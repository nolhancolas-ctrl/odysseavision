"use client";

import { useState } from "react";

type ClientAlbumPasswordGateProps = {
  slug: string;
};

export function ClientAlbumPasswordGate({ slug }: ClientAlbumPasswordGateProps) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password.trim()) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    const response = await fetch("/api/client-albums/access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug, password }),
    });

    if (response.ok) {
      window.location.reload();
      return;
    }

    setStatus("error");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-sm">
      <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
        Gallery password
      </label>

      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className="mt-3 w-full rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/60"
      />

      {status === "error" ? (
        <p className="mt-3 text-xs text-white/55">
          Invalid password. Please try again.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 cursor-pointer rounded-full bg-[#f4efe4] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#11190f] transition hover:bg-[#b88a3b] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Opening..." : "Open gallery"}
      </button>
    </form>
  );
}
