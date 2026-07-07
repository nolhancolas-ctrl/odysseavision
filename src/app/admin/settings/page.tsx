import { getAdminAuthStatus } from "@/lib/admin/auth";
import {
  logoutAdminAction,
  updateAdminPasswordAction,
} from "@/server/actions/adminAuth";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ auth?: string }>;
}) {
  const status = await getAdminAuthStatus();
  const params = searchParams ? await searchParams : {};
  const message =
    params.auth === "updated"
      ? "Private password updated."
      : params.auth === "mismatch"
        ? "Passwords do not match."
        : params.auth === "too-short"
          ? "Password must contain at least 8 characters."
          : "";

  return (
    <div className="space-y-7">
      <section className="max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
          Private access
        </p>

        <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-[#242617] md:text-6xl">
          Admin settings
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
          Manage the private password used to unlock this admin space. The same
          password can also be typed into a client album access field to open the
          admin.
        </p>
      </section>

      {message ? (
        <p className="rounded-3xl border border-[#242617]/10 bg-white/45 px-5 py-4 text-sm text-[#242617]/65">
          {message}
        </p>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <article className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Password
          </p>

          <h2 className="mt-3 font-serif text-3xl text-[#242617]">
            Update private password
          </h2>

          <form action={updateAdminPasswordAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                New password
              </span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                placeholder="At least 8 characters"
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                Confirm password
              </span>
              <input
                name="confirmation"
                type="password"
                required
                minLength={8}
                className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                placeholder="Repeat password"
              />
            </label>

            <button
              type="submit"
              className="cursor-pointer rounded-full bg-[#071321] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:-translate-y-0.5 hover:bg-[#142844]"
            >
              Save password
            </button>
          </form>
        </article>

        <aside className="space-y-5">
          <article className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
              Status
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-3xl border border-[#242617]/8 bg-[#f4efe4]/55 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#242617]/38">
                  Session
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#286235]">
                  <span className="h-2 w-2 rounded-full bg-[#286235]" />
                  Active
                </p>
              </div>

              <div className="rounded-3xl border border-[#242617]/8 bg-[#f4efe4]/55 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#242617]/38">
                  Last update
                </p>
                <p className="mt-2 text-sm text-[#242617]/65">
                  {status.updatedAt}
                </p>
              </div>

              <div className="rounded-3xl border border-[#242617]/8 bg-[#f4efe4]/55 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#242617]/38">
                  Initial setup
                </p>
                <p className="mt-2 text-sm text-[#242617]/65">
                  {status.defaultPasswordHint}
                </p>
              </div>
            </div>
          </article>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center rounded-[2rem] border border-[#d76b5b]/25 bg-white/45 p-5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#b94a3a] transition hover:bg-[#b94a3a] hover:text-[#f4efe4]"
            >
              Log out
            </button>
          </form>
        </aside>
      </section>
    </div>
  );
}
