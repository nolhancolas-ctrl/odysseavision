import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function AdminAlbumsPage() {
  return (
    <AdminPlaceholderPage
      title="Client albums"
      eyebrow="Create & manage"
      description="Create private albums, upload photos, manage access links, passwords and client album status."
      primaryLabel="Create an album"
      mode="content"
    />
  );
}
