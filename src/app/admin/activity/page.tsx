import Link from "next/link";
import { ActivityTimeline } from "@/components/admin/activity/ActivityTimeline";
import { getAdminActivityTimeline } from "@/lib/admin/activity";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const items = await getAdminActivityTimeline();

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Activity
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-[#242617] md:text-6xl">
            Recent activity
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Track recent updates, imports, messages and content changes.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-full bg-[#071321] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4efe4] transition hover:bg-[#142844]"
        >
          Back to dashboard
        </Link>
      </section>

      <ActivityTimeline items={items} />
    </div>
  );
}
