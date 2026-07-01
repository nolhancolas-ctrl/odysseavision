import { ClientForm } from "@/components/admin/clients/ClientForm";
import { createClient } from "@/server/actions/clients";

export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
          New client
        </p>
        <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617]">
          Add client
        </h1>
      </div>

      <ClientForm action={createClient} submitLabel="Create client" />
    </div>
  );
}
