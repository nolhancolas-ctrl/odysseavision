import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function AdminStoriesPage() {
  return (
    <AdminPlaceholderPage
      title="Stories"
      eyebrow="Create & manage"
      description="Create, edit and publish travel stories, articles, drafts and blog categories."
      primaryLabel="Add a story"
      mode="content"
    />
  );
}
