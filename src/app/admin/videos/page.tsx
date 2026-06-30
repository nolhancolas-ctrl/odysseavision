import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function AdminVideosPage() {
  return (
    <AdminPlaceholderPage
      title="Videos"
      eyebrow="Create & manage"
      description="Add Vimeo films, manage thumbnails, descriptions, categories and featured videos."
      primaryLabel="Add a video"
      mode="content"
    />
  );
}
