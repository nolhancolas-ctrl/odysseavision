import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function AdminActivityPage() {
  return (
    <AdminPlaceholderPage
      title="Activity"
      eyebrow="Create & manage"
      description="Review the full activity history: publications, new clients, album updates, contact messages and admin actions."
      primaryLabel="Filter activity"
      mode="content"
    />
  );
}
