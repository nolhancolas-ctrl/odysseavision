"use client";

import {
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { ChartPoint } from "@/lib/admin/insights";

const WIDTH = 1000;
const HEIGHT = 300;
const LEFT = 42;
const RIGHT = 22;
const TOP = 24;
const BOTTOM = 54;
const PLOT_WIDTH = WIDTH - LEFT - RIGHT;
const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM;

const exactDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

function parseDayKey(value: string) {
  const [year, month, day] = value
    .split("-")
    .map((part) => Number(part));

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, 12);
}

function formatExactDate(value: string) {
  const date = parseDayKey(value);
  return date ? exactDateFormatter.format(date) : value;
}

function formatMonth(value: string) {
  const date = parseDayKey(value);
  return date ? monthFormatter.format(date) : value;
}

export function ViewsLineChart({
  points,
}: {
  points: ChartPoint[];
}) {
  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);
  const gradientId = useId().replaceAll(":", "");

  const coordinates = useMemo(() => {
    const maximum = Math.max(
      1,
      ...points.map((point) => point.value),
    );

    return points.map((point, index) => {
      const ratio =
        points.length <= 1
          ? 0.5
          : index / (points.length - 1);

      const x = LEFT + ratio * PLOT_WIDTH;
      const y =
        TOP +
        (1 - point.value / maximum) * PLOT_HEIGHT;

      return {
        ...point,
        index,
        x,
        y,
        xPercent: (x / WIDTH) * 100,
        yPercent: (y / HEIGHT) * 100,
      };
    });
  }, [points]);

  const linePath = useMemo(
    () =>
      coordinates
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
        )
        .join(" "),
    [coordinates],
  );

  const areaPath = coordinates.length
    ? `${linePath} L ${
        coordinates[coordinates.length - 1].x
      } ${HEIGHT - BOTTOM} L ${
        coordinates[0].x
      } ${HEIGHT - BOTTOM} Z`
    : "";

  const monthTicks = useMemo(
    () =>
      coordinates.filter(
        (point, index) =>
          index === 0 ||
          point.title.slice(0, 7) !==
            coordinates[index - 1].title.slice(0, 7),
      ),
    [coordinates],
  );

  const activePoint =
    activeIndex === null
      ? null
      : coordinates[activeIndex] ?? null;

  function selectFromPointer(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (coordinates.length === 0) {
      return;
    }

    const bounds =
      event.currentTarget.getBoundingClientRect();
    const localX =
      ((event.clientX - bounds.left) / bounds.width) *
      WIDTH;
    const ratio = Math.max(
      0,
      Math.min(1, (localX - LEFT) / PLOT_WIDTH),
    );
    const index = Math.round(
      ratio * (coordinates.length - 1),
    );

    setActiveIndex(index);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight"
    ) {
      return;
    }

    event.preventDefault();

    setActiveIndex((current) => {
      const fallback = coordinates.length - 1;
      const base = current ?? fallback;
      const direction =
        event.key === "ArrowRight" ? 1 : -1;

      return Math.max(
        0,
        Math.min(
          coordinates.length - 1,
          base + direction,
        ),
      );
    });
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Traffic
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#242617]">
            Views over time
          </h2>
        </div>

        <span className="rounded-full border border-[#242617]/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#242617]/45">
          Rolling 90 days
        </span>
      </div>

      {coordinates.length > 0 ? (
        <div
          className="relative mt-6 h-[285px] w-full min-w-0 touch-none overflow-hidden rounded-[1.5rem] bg-[#f4efe4]/40 outline-none sm:h-[320px]"
          role="img"
          aria-label="Daily page views over the last 90 days. Use the left and right arrow keys to inspect each day."
          tabIndex={0}
          onPointerMove={selectFromPointer}
          onPointerLeave={() => setActiveIndex(null)}
          onFocus={() =>
            setActiveIndex(coordinates.length - 1)
          }
          onBlur={() => setActiveIndex(null)}
          onKeyDown={handleKeyDown}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#b88a3b"
                  stopOpacity="0.28"
                />
                <stop
                  offset="100%"
                  stopColor="#b88a3b"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map(
              (ratio) => {
                const y =
                  TOP + ratio * PLOT_HEIGHT;

                return (
                  <line
                    key={ratio}
                    x1={LEFT}
                    x2={WIDTH - RIGHT}
                    y1={y}
                    y2={y}
                    stroke="#242617"
                    strokeOpacity="0.09"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              },
            )}

            {areaPath ? (
              <path
                d={areaPath}
                fill={`url(#${gradientId})`}
              />
            ) : null}

            {linePath ? (
              <path
                d={linePath}
                fill="none"
                stroke="#b88a3b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}

            {activePoint ? (
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={TOP}
                y2={HEIGHT - BOTTOM}
                stroke="#071321"
                strokeOpacity="0.22"
                strokeWidth="1"
                strokeDasharray="4 5"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>

          {coordinates
            .filter((point) => point.value > 0)
            .map((point) => (
              <span
                key={point.title}
                className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f4efe4] bg-[#071321] shadow-sm"
                style={{
                  left: `${point.xPercent}%`,
                  top: `${point.yPercent}%`,
                }}
              />
            ))}

          {activePoint ? (
            <>
              <span
                className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#f4efe4] bg-[#071321] shadow-[0_4px_15px_rgba(7,19,33,0.3)]"
                style={{
                  left: `${activePoint.xPercent}%`,
                  top: `${activePoint.yPercent}%`,
                }}
              />

              <div
                className="pointer-events-none absolute z-10 w-48 rounded-2xl bg-[#071321] px-4 py-3 text-[#f4efe4] shadow-[0_14px_35px_rgba(7,19,33,0.28)]"
                style={{
                  left: `clamp(6.5rem, ${activePoint.xPercent}%, calc(100% - 6.5rem))`,
                  top: `${activePoint.yPercent}%`,
                  transform:
                    activePoint.y < 92
                      ? "translate(-50%, 18px)"
                      : "translate(-50%, calc(-100% - 18px))",
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                  {formatExactDate(activePoint.title)}
                </p>
                <p className="mt-1 font-serif text-2xl leading-none">
                  {activePoint.value}{" "}
                  {activePoint.value === 1
                    ? "view"
                    : "views"}
                </p>
              </div>
            </>
          ) : null}

          {monthTicks.map((tick, index) => {
            const isFirst = index === 0;
            const isLast =
              index === monthTicks.length - 1;

            return (
              <span
                key={`${tick.title}-${index}`}
                className="pointer-events-none absolute bottom-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#242617]/45"
                style={{
                  left: `${tick.xPercent}%`,
                  transform: isFirst
                    ? "translateX(0)"
                    : isLast
                      ? "translateX(-100%)"
                      : "translateX(-50%)",
                }}
              >
                {formatMonth(tick.title)}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="mt-8 rounded-3xl border border-[#242617]/10 bg-[#f4efe4]/60 p-6 text-sm text-[#242617]/50">
          No views recorded yet.
        </p>
      )}
    </section>
  );
}
