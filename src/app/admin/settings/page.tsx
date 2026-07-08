import { getAdminAuthStatus } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import {
  updateGlobalSiteInfoAction,
  updateSmtpSettingsAction,
} from "@/server/actions/admin-settings";
import {
  logoutAdminAction,
  updateAdminPasswordAction,
} from "@/server/actions/adminAuth";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  auth?: string;
  smtp?: string;
  site?: string;
}>;

type SmtpSettings = {
  host?: string;
  port?: string;
  secure?: boolean;
  user?: string;
  password?: string;
  from?: string;
  enabled?: boolean;
};

type GlobalSiteInfo = {
  siteName?: string;
  publicUrl?: string;
  contactEmail?: string;
  businessName?: string;
  location?: string;
};

async function getJsonSetting<T extends Record<string, unknown>>(
  key: string,
  fallback: T,
): Promise<T> {
  const setting = await db.siteSetting.findUnique({
    where: { key },
  });

  if (!setting?.value || typeof setting.value !== "object") {
    return fallback;
  }

  return {
    ...fallback,
    ...(setting.value as T),
  };
}

function getMessage(params: Awaited<SearchParams>) {
  if (params.auth === "updated") return "Private password updated.";
  if (params.auth === "mismatch") return "Passwords do not match.";
  if (params.auth === "too-short") {
    return "Password must contain at least 8 characters.";
  }

  if (params.smtp === "updated") return "SMTP settings updated.";
  if (params.site === "updated") return "Global site info updated.";

  return "";
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const [status, smtpSettings, globalInfo] = await Promise.all([
    getAdminAuthStatus(),
    getJsonSetting<SmtpSettings>("smtp", {
      host: "",
      port: "465",
      secure: true,
      user: "",
      password: "",
      from: "",
      enabled: false,
    }),
    getJsonSetting<GlobalSiteInfo>("globalSiteInfo", {
      siteName: "Odyssea Vision",
      publicUrl: "",
      contactEmail: "",
      businessName: "Odyssea Vision",
      location: "",
    }),
  ]);

  const params = searchParams ? await searchParams : {};
  const message = getMessage(params);

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
          Manage private access, SMTP delivery and global site information.
        </p>
      </section>

      {message ? (
        <p className="rounded-3xl border border-[#242617]/10 bg-white/45 px-5 py-4 text-sm text-[#242617]/65">
          {message}
        </p>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-5">
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

          <article className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
              SMTP
            </p>

            <h2 className="mt-3 font-serif text-3xl text-[#242617]">
              Email delivery
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#242617]/55">
              Configure this later when your email provider is ready. Leave
              disabled until SMTP credentials are valid.
            </p>

            <form action={updateSmtpSettingsAction} className="mt-6 space-y-4">
              <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm text-[#242617]/65">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={Boolean(smtpSettings.enabled)}
                  className="h-4 w-4 accent-[#b88a3b]"
                />
                Enable SMTP sending
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                    Host
                  </span>
                  <input
                    name="host"
                    defaultValue={smtpSettings.host ?? ""}
                    className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                    placeholder="smtp.gmail.com"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                    Port
                  </span>
                  <input
                    name="port"
                    defaultValue={smtpSettings.port ?? "465"}
                    className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                    placeholder="465"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm text-[#242617]/65">
                <input
                  type="checkbox"
                  name="secure"
                  defaultChecked={smtpSettings.secure !== false}
                  className="h-4 w-4 accent-[#b88a3b]"
                />
                Secure connection
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                  User
                </span>
                <input
                  name="user"
                  defaultValue={smtpSettings.user ?? ""}
                  className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                  placeholder="hello@example.com"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                  placeholder={
                    smtpSettings.password ? "Leave empty to keep current password" : "SMTP password"
                  }
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                  From
                </span>
                <input
                  name="from"
                  defaultValue={smtpSettings.from ?? ""}
                  className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                  placeholder="Odyssea Vision <hello@example.com>"
                />
              </label>

              <button
                type="submit"
                className="cursor-pointer rounded-full bg-[#071321] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:-translate-y-0.5 hover:bg-[#142844]"
              >
                Save SMTP
              </button>
            </form>
          </article>
        </div>

        <aside className="space-y-5">
          <article className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
              Site info
            </p>

            <h2 className="mt-3 font-serif text-3xl text-[#242617]">
              Global details
            </h2>

            <form action={updateGlobalSiteInfoAction} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                  Site name
                </span>
                <input
                  name="siteName"
                  defaultValue={globalInfo.siteName ?? "Odyssea Vision"}
                  className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                  Public URL
                </span>
                <input
                  name="publicUrl"
                  defaultValue={globalInfo.publicUrl ?? ""}
                  className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                  placeholder="https://odyssea.vision"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                  Contact email
                </span>
                <input
                  name="contactEmail"
                  type="email"
                  defaultValue={globalInfo.contactEmail ?? ""}
                  className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                  placeholder="hello@example.com"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                  Business name
                </span>
                <input
                  name="businessName"
                  defaultValue={globalInfo.businessName ?? "Odyssea Vision"}
                  className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
                  Location
                </span>
                <input
                  name="location"
                  defaultValue={globalInfo.location ?? ""}
                  className="mt-3 w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/70 px-5 py-4 text-sm outline-none transition focus:border-[#b88a3b]/70 focus:bg-white"
                  placeholder="France"
                />
              </label>

              <button
                type="submit"
                className="cursor-pointer rounded-full bg-[#071321] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:-translate-y-0.5 hover:bg-[#142844]"
              >
                Save site info
              </button>
            </form>
          </article>

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
