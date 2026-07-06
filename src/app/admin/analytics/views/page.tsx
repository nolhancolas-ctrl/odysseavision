import Link from "next/link";
import { getViewInsightData, type ChartPoint } from "@/lib/admin/insights";

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
    <article className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#242617]/45">
        {label}
      </p>
      <p className="mt-3 font-serif text-5xl leading-none text-[#242617]">
        {value}
      </p>
      <p className="mt-3 text-sm text-[#2b6b3c]">{detail}</p>
    </article>
  );
}

function LineChart({ points }: { points: ChartPoint[] }) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const width = 640;
  const height = 220;
  const padding = 28;

  const coordinates = points.map((point, index) => {
    const x =
      points.length === 1
        ? width / 2
        : padding + (index / (points.length - 1)) * (width - padding * 2);
    const y = height - padding - (point.value / max) * (height - padding * 2);

    return { ...point, x, y };
  });

  const polyline = coordinates.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Traffic
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#242617]">
            Views over time
          </h2>
        </div>
        <span className="rounded-full border border-[#242617]/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#242617]/45">
          Last 30 days
        </span>
      </div>

      {points.length > 0 ? (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mt-6 h-[260px] w-full overflow-visible"
          role="img"
          aria-label="Views chart"
        >
          <path
            d={`M ${padding} ${height - padding} H ${width - padding}`}
            fill="none"
            stroke="currentColor"
            className="text-[#242617]/10"
          />
          <polyline
            points={polyline}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#b88a3b]"
          />
          {coordinates.map((point) => (
            <g key={point.title}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="currentColor"
                className="text-[#071321]"
              />
              <text
                x={point.x}
                y={height - 4}
                textAnchor="middle"
                className="fill-[#242617]/45 text-[10px] uppercase tracking-[0.12em]"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      ) : (
        <p className="mt-8 rounded-3xl border border-[#242617]/10 bg-[#f4efe4]/60 p-6 text-sm text-[#242617]/50">
          No views recorded yet.
        </p>
      )}
    </div>
  );
}

export default async function ViewsAnalyticsPage() {
  const data = await getViewInsightData();

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Analytics
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] text-[#242617] md:text-6xl">
            Views
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Follow public page visits, recent traffic and the most visited pages.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-full bg-[#071321] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4efe4] transition hover:bg-[#142844]"
        >
          Back to dashboard
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total views" value={data.total} detail="All recorded visits" />
        <MetricCard label="Today" value={data.today} detail="Visits since midnight" />
        <MetricCard
          label="Tracked pages"
          value={data.topPaths.length}
          detail="With at least one visit"
        />
      </section>

      <LineChart points={data.series} />

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <h2 className="font-serif text-3xl text-[#242617]">Top pages</h2>

          <div className="mt-5 space-y-3">
            {data.topPaths.length > 0 ? (
              data.topPaths.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-[#242617]/8 bg-[#f4efe4]/55 px-4 py-3"
                >
                  <span className="min-w-0 truncate text-sm text-[#242617]/70">
                    {item.path}
                  </span>
                  <span className="rounded-full bg-[#d9ead5] px-3 py-1 text-xs font-semibold text-[#286235]">
                    {item.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#242617]/45">No page data yet.</p>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <h2 className="font-serif text-3xl text-[#242617]">Recent views</h2>

          <div className="mt-5 space-y-3">
            {data.recentViews.length > 0 ? (
              data.recentViews.map((view, index) => (
                <div
                  key={`${view.path}-${view.date}-${index}`}
                  className="rounded-3xl border border-[#242617]/8 bg-[#f4efe4]/55 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="min-w-0 truncate text-sm font-semibold text-[#242617]">
                      {view.path}
                    </p>
                    <p className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-[#242617]/38">
                      {view.date}
                    </p>
                  </div>
                  <p className="mt-2 truncate text-xs text-[#242617]/45">
                    {view.referrer}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#242617]/45">No recent views yet.</p>
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
