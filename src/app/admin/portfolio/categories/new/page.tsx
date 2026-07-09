import { PortfolioCategoryForm } from "@/components/admin/portfolio/PortfolioCategoryForm";
import { createPortfolioCategory } from "@/server/actions/portfolio-categories";

export const dynamic = "force-dynamic";

export default function NewPortfolioCategoryPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
          Portfolio categories
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.05em] text-[#242617]">
          New category
        </h1>
      </header>

      <PortfolioCategoryForm
        action={createPortfolioCategory}
        submitLabel="Create category"
      />
    </div>
  );
}
