import { notFound } from "next/navigation";
import { ClientForm } from "@/components/admin/clients/ClientForm";
import { updateClient } from "@/server/actions/clients";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type EditClientPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
          Edit client
        </p>
        <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617]">
          {client.firstName} {client.lastName ?? ""}
        </h1>
      </div>

      <ClientForm
        client={client}
        action={updateClient.bind(null, client.id)}
        submitLabel="Save changes"
      />
    </div>
  );
}
