import { SeoEditor } from "@/components/admin/seo/SeoEditor";
import { getSeoSettings } from "@/lib/content/seo";
import { resetSeoSettings, updateSeoSettings } from "@/server/actions/seo";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const settings = await getSeoSettings();

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b88a3b]">
            Website & design
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase leading-none text-[#242617] md:text-6xl">
            SEO & settings
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Manage global SEO, page metadata, Open Graph previews, Twitter cards,
            robots.txt, sitemap.xml and technical indexing settings.
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

      <SeoEditor
        settings={settings}
        updateAction={updateSeoSettings}
        resetAction={resetSeoSettings}
      />
    </div>
  );
}
