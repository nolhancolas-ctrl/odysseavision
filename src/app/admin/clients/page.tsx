import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function AdminClientsPage() {
  return (
    <AdminPlaceholderPage
      title="Clients"
      eyebrow="Create & manage"
      description="Manage clients, emails, private access, internal notes and associated albums."
      primaryLabel="Add a client"
      mode="content"
    />
  );
}
