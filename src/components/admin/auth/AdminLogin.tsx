"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";

export function AdminLogin() {
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        redirectTo?: string;
      };

      if (response.ok && result.ok) {
        window.location.href = result.redirectTo || "/admin";
        return;
      }

      form.reset();
      setIsShaking(true);
      passwordRef.current?.focus();

      window.setTimeout(() => {
        setIsShaking(false);
      }, 460);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4efe4] px-5 py-8 text-[#242617]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <section
          className={`w-full max-w-xl rounded-[2rem] border border-[#242617]/10 bg-white/45 p-7 shadow-[0_24px_80px_rgba(20,20,10,0.08)] md:p-10 ${
            isShaking ? "ov-login-shake" : ""
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Private access
          </p>

          <h1 className="mt-4 font-serif text-5xl leading-none tracking-[-0.04em] text-[#242617] md:text-6xl">
            Odyssea Vision Admin
          </h1>

          <p className="mt-5 text-sm leading-7 text-[#242617]/55">
            Enter the private password to unlock the admin space.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                Password
              </span>

              <input
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                placeholder="Private password"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-full bg-[#071321] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:-translate-y-0.5 hover:bg-[#142844] disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? "Checking..." : "Unlock admin"}
            </button>
          </form>

          <p className="mt-5 text-xs leading-6 text-[#242617]/38">
            First local password: <strong>odyssea-admin</strong>. Change it from
            Admin settings after login.
          </p>
        </section>
      </div>
    </main>
  );
}
