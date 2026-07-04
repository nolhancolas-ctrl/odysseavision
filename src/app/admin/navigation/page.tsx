import { NavigationEditor } from "@/components/admin/navigation/NavigationEditor";
import { getNavigationSettings } from "@/lib/content/navigation";
import {
  resetNavigationSettings,
  updateNavigationSettings,
} from "@/server/actions/navigation";

export const dynamic = "force-dynamic";

export default async function AdminNavigationPage() {
  const settings = await getNavigationSettings();

  const visibleHeaderLinks = settings.mainLinks.filter((item) => item.visible);
  const visibleFooterLinks = settings.footerLinks.filter((item) => item.visible);
  const visibleSocialLinks = settings.socialLinks.filter((item) => item.visible);

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b88a3b]">
            Website & design
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase leading-none text-[#242617] md:text-6xl">
            Navigation
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Manage the public header menu, footer navigation, social links and footer text.
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

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#242617]/40">
            Header links
          </p>
          <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
            {visibleHeaderLinks.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#242617]/40">
            Footer links
          </p>
          <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
            {visibleFooterLinks.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#242617]/40">
            Social links
          </p>
          <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
            {visibleSocialLinks.length}
          </p>
        </div>
      </section>

      <NavigationEditor
        settings={settings}
        updateAction={updateNavigationSettings}
        resetAction={resetNavigationSettings}
      />
    </div>
  );
}
