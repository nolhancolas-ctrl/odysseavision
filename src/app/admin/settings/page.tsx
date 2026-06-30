import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholderPage
      title="Settings"
      eyebrow="Configuration"
      description="Prepare authentication, the secret password, admin roles and technical platform settings."
      primaryLabel="Configure access"
      mode="site"
    />
  );
}
