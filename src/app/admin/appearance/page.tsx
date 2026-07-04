import { AppearanceEditor } from "@/components/admin/appearance/AppearanceEditor";
import { getAppearanceSettings } from "@/lib/content/appearance";
import {
  resetAppearanceSettings,
  updateAppearanceSettings,
} from "@/server/actions/appearance";

export const dynamic = "force-dynamic";

export default async function AdminAppearancePage() {
  const settings = await getAppearanceSettings();

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b88a3b]">
            Website & design
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase leading-none text-[#242617] md:text-6xl">
            Appearance
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Manage the visual identity, typography, color palette, layout tokens,
            header/footer backgrounds and animated splashscreen.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#071321] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#f4efe4] hover:text-[#071321]"
        >
          View public site
        </a>
      </section>

      <AppearanceEditor
        settings={settings}
        updateAction={updateAppearanceSettings}
        resetAction={resetAppearanceSettings}
      />
    </div>
  );
}
