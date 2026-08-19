import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PortfolioCategoryPhotosRedirectPage({
  params,
}: PageProps) {
  const { id } = await params;

  redirect(`/admin/portfolio/categories/${id}/edit`);
}
