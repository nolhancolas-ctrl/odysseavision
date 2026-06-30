import Link from "next/link";

type AdminPlaceholderPageProps = {
  title: string;
  eyebrow: string;
  description: string;
  primaryLabel: string;
  mode: "content" | "site";
};

export function AdminPlaceholderPage({
  title,
  eyebrow,
  description,
  primaryLabel,
  mode,
}: AdminPlaceholderPageProps) {
  const isContent = mode === "content";

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-[#11170f]/10 bg-white/42 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)] md:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a6792e]">
          {eyebrow}
        </p>

        <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <h1 className="font-serif text-5xl leading-none tracking-[-0.045em] md:text-7xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#11170f]/58">
              {description}
            </p>
          </div>

          <button className="rounded-full bg-[#071321] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#142844]">
            {primaryLabel}
          </button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-3xl border border-[#11170f]/10 bg-white/40 p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#11170f]/42">
            Step 01
          </p>
          <h2 className="mt-4 font-serif text-3xl">
            {isContent ? "Content list" : "Page structure"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#11170f]/55">
            This area will show all existing entries with search, filters,
            status, dates and quick actions.
          </p>
        </article>

        <article className="rounded-3xl border border-[#11170f]/10 bg-white/40 p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#11170f]/42">
            Step 02
          </p>
          <h2 className="mt-4 font-serif text-3xl">
            {isContent ? "Create and edit" : "Edit texts and images"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#11170f]/55">
            We will connect a clean form with drafts, publication, images,
            categories and preview.
          </p>
        </article>

        <article className="rounded-3xl border border-[#11170f]/10 bg-white/40 p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#11170f]/42">
            Step 03
          </p>
          <h2 className="mt-4 font-serif text-3xl">
            {isContent ? "Publication" : "Preview"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#11170f]/55">
            Nothing should go live by accident. Every entry will have a status
            and a proper preview flow.
          </p>
        </article>
      </section>

      <Link
        href="/admin"
        className="inline-flex rounded-full border border-[#11170f]/12 px-5 py-3 text-xs uppercase tracking-[0.18em] text-[#11170f]/50 transition hover:bg-[#071321] hover:text-[#f4efe4]"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
