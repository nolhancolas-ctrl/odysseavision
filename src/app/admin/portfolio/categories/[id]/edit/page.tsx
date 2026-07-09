import { notFound } from "next/navigation";
import { PortfolioCategoryForm } from "@/components/admin/portfolio/PortfolioCategoryForm";
import { db } from "@/lib/db";
import { updatePortfolioCategory } from "@/server/actions/portfolio-categories";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPortfolioCategoryPage({ params }: PageProps) {
  const { id } = await params;

  const category = await db.portfolioCategory.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88a3b]">
          Portfolio categories
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.05em] text-[#242617]">
          Edit category
        </h1>
      </header>

      <PortfolioCategoryForm
        category={category}
        action={updatePortfolioCategory.bind(null, category.id)}
        submitLabel="Save category"
      />
    </div>
  );
}
