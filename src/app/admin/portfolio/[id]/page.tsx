import { notFound } from "next/navigation";
import { PortfolioItemForm } from "@/components/admin/portfolio/PortfolioItemForm";
import { updatePortfolioItem } from "@/server/actions/portfolio";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPortfolioItemPage({ params }: PageProps) {
  const { id } = await params;

  const [item, categories] = await Promise.all([
    db.portfolioItem.findUnique({
      where: { id },
    }),
    db.portfolioCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);

  if (!item) {
    notFound();
  }

  const action = updatePortfolioItem.bind(null, item.id);

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-[#11170f]/10 bg-white/42 p-7 shadow-[0_18px_50px_rgba(20,20,10,0.06)] md:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a6792e]">
          Portfolio
        </p>
        <h1 className="mt-5 font-serif text-5xl leading-none tracking-[-0.045em] md:text-7xl">
          Edit photo
        </h1>
      </section>

      <PortfolioItemForm
        item={item}
        categories={categories}
        action={action}
        submitLabel="Save changes"
      />
    </div>
  );
}
