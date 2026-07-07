import Link from "next/link";
import type { Client } from "@prisma/client";

type ClientFormProps = {
  client?: Client | null;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function ClientForm({
  client,
  action,
  submitLabel,
}: ClientFormProps) {
  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              First name
            </label>
            <input
              name="firstName"
              required
              defaultValue={client?.firstName ?? ""}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
              placeholder="Morgane"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              Last name
            </label>
            <input
              name="lastName"
              defaultValue={client?.lastName ?? ""}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
              placeholder="Ocean"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              Email
            </label>
            <input
              type="email"
              name="email"
              defaultValue={client?.email ?? ""}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
              placeholder="client@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              Phone
            </label>
            <input
              name="phone"
              defaultValue={client?.phone ?? ""}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
              placeholder="+33 6 00 00 00 00"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
            Notes
          </label>
          <textarea
            name="notes"
            rows={1}
            defaultValue={client?.notes ?? ""}
            className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm leading-7 text-[#242617] outline-none transition focus:border-[#b88a3b]/70 admin-autogrow-textarea"
            placeholder="Client preferences, access notes, delivery details..."
          />
        </div>
      </div>

      <aside className="space-y-6">
        <div className="space-y-4 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/45">
              Language
            </label>
            <select
              name="language"
              defaultValue={client?.language ?? "en"}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="pt">Portuguese</option>
              <option value="es">Spanish</option>
            </select>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617]/70">
            <input
              type="checkbox"
              name="active"
              defaultChecked={client?.active ?? true}
              className="h-4 w-4 accent-[#b88a3b]"
            />
            Active client
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full bg-[#071008] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b] hover:text-[#071008]"
          >
            {submitLabel}
          </button>

          <Link
            href="/admin/clients"
            className="rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#b88a3b]/60 hover:text-[#b88a3b]"
          >
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
