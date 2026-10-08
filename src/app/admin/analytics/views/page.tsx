import Link from "next/link";
import { ViewsLineChart } from "@/components/admin/analytics/ViewsLineChart";
import { getViewInsightData } from "@/lib/admin/insights";

export const dynamic = "force-dynamic";

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="min-w-0 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#242617]/45">
        {label}
      </p>
      <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
        {value}
      </p>
      <p className="mt-3 text-sm text-[#2b6b3c]">
        {detail}
      </p>
    </article>
  );
}

export default async function ViewsAnalyticsPage() {
  const data = await getViewInsightData();

  return (
    <div className="w-full min-w-0 max-w-full space-y-7">
      <section className="flex min-w-0 flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Analytics
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-[#242617] md:text-6xl">
            Views
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Follow public page visits, recent traffic and
            the most visited pages.
          </p>
        </div>

        <Link
          href="/admin"
          className="shrink-0 rounded-full bg-[#071321] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4efe4] transition hover:bg-[#142844]"
        >
          Back to dashboard
        </Link>
      </section>

      <section className="grid min-w-0 gap-4 md:grid-cols-3">
        <MetricCard
          label="Total views"
          value={data.total}
          detail="All recorded visits"
        />
        <MetricCard
          label="Today"
          value={data.today}
          detail="Visits since midnight"
        />
        <MetricCard
          label="Tracked pages"
          value={data.topPaths.length}
          detail="With at least one visit"
        />
      </section>

      <ViewsLineChart points={data.series} />

      <section className="grid min-w-0 max-w-full gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="min-w-0 overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <h2 className="font-serif text-3xl text-[#242617]">
            Top pages
          </h2>

          <div className="mt-5 min-w-0 space-y-3">
            {data.topPaths.length > 0 ? (
              data.topPaths.map((item) => (
                <div
                  key={item.path}
                  className="flex min-w-0 items-center justify-between gap-4 rounded-3xl border border-[#242617]/8 bg-[#f4efe4]/55 px-4 py-3"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-[#242617]/70">
                    {item.path}
                  </span>
                  <span className="shrink-0 rounded-full bg-[#d9ead5] px-3 py-1 text-xs font-semibold text-[#286235]">
                    {item.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#242617]/45">
                No page data yet.
              </p>
            )}
          </div>
        </article>

        <article className="min-w-0 max-w-full overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <h2 className="font-serif text-3xl text-[#242617]">
            Recent views
          </h2>

          <div className="mt-5 min-w-0 max-w-full space-y-3 overflow-hidden">
            {data.recentViews.length > 0 ? (
              data.recentViews.map((view, index) => (
                <div
                  key={`${view.path}-${view.date}-${index}`}
                  className="min-w-0 max-w-full overflow-hidden rounded-3xl border border-[#242617]/8 bg-[#f4efe4]/55 p-4"
                >
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#242617]">
                      {view.path}
                    </p>
                    <p className="shrink-0 whitespace-nowrap text-[11px] uppercase tracking-[0.16em] text-[#242617]/38">
                      {view.date}
                    </p>
                  </div>
                  <p className="mt-2 block max-w-full truncate text-xs text-[#242617]/45">
                    {view.referrer}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#242617]/45">
                No recent views yet.
              </p>
            )}
          </div>
        </article>
      </section>

      {!data.available ? (
        <p className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 text-sm text-[#242617]/55">
          Page view tracking is not available yet.
        </p>
      ) : null}
    </div>
  );
}
