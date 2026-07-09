import Link from "next/link";
import type { PortfolioCategory } from "@prisma/client";

type PortfolioCategoryFormProps = {
  category?: PortfolioCategory | null;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function PortfolioCategoryForm({
  category,
  action,
  submitLabel,
}: PortfolioCategoryFormProps) {
  return (
    <form
      action={action}
      className="max-w-3xl rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_22px_70px_rgba(20,20,10,0.07)]"
    >
      <input type="hidden" name="returnTo" value="/admin/portfolio" />

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
          Category name
        </label>
        <input
          name="name"
          required
          defaultValue={category?.name ?? ""}
          placeholder="Wildlife"
          className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-4 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
          Slug
        </label>
        <input
          name="slug"
          defaultValue={category?.slug ?? ""}
          placeholder="wildlife"
          className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-4 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
        />
        <p className="mt-2 text-xs text-[#242617]/35">
          Leave empty to generate it from the category name.
        </p>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
          Display order
        </label>
        <input
          name="order"
          type="number"
          defaultValue={category?.order ?? 0}
          className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-4 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="submit"
          className="cursor-pointer rounded-full bg-[#242617] px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:-translate-y-0.5 hover:bg-[#b88a3b]"
        >
          {submitLabel}
        </button>

        <Link
          href="/admin/portfolio"
          className="rounded-full border border-[#242617]/10 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#b88a3b] hover:text-[#242617]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
