"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  analyzeAllUnverifiedBlobImages,
  analyzeNextBlobImages,
  optimizeNextDetectedBlob,
} from "@/server/actions/storageAudit";

type OptimizationToast = {
  id: string;
  pathname: string;
  savedBytes: number;
  phase: "entering" | "visible" | "leaving";
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function shortenPath(pathname: string) {
  const maximumLength = 48;

  if (pathname.length <= maximumLength) {
    return pathname;
  }

  return `${pathname.slice(0, maximumLength - 3)}...`;
}

export function StorageAuditControls({
  initialRemaining,
  initialAllRemaining,
  initialOptimizable,
  optimizationEnabled,
  optimizationTarget,
}: {
  initialRemaining: number;
  initialAllRemaining: number;
  initialOptimizable: number;
  optimizationEnabled: boolean;
  optimizationTarget: string | null;
}) {
  const router = useRouter();
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [analyzed, setAnalyzed] = useState(0);
  const [analysisError, setAnalysisError] = useState("");

  const [fullAuditRunning, setFullAuditRunning] = useState(false);
  const [allRemaining, setAllRemaining] = useState(initialAllRemaining);
  const [allAnalyzed, setAllAnalyzed] = useState(0);
  const [fullAuditError, setFullAuditError] = useState("");

  const [optimizing, setOptimizing] = useState(false);
  const [optimizable, setOptimizable] = useState(initialOptimizable);
  const [optimizedInRun, setOptimizedInRun] = useState(0);
  const [optimizationError, setOptimizationError] = useState("");
  const [toasts, setToasts] = useState<OptimizationToast[]>([]);

  useEffect(() => {
    if (!running) {
      setRemaining(initialRemaining);
      setAnalyzed(0);
    }
  }, [initialRemaining, running]);

  useEffect(() => {
    if (!fullAuditRunning) {
      setAllRemaining(initialAllRemaining);
      setAllAnalyzed(0);
    }
  }, [initialAllRemaining, fullAuditRunning]);

  useEffect(() => {
    if (!optimizing) {
      setOptimizable(initialOptimizable);
      setOptimizedInRun(0);
    }
  }, [initialOptimizable, optimizing]);

  useEffect(() => {
    return () => {
      for (const timer of timers.current) {
        clearTimeout(timer);
      }
    };
  }, []);

  function showOptimizationToast(pathname: string, savedBytes: number) {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts((current) => [
      ...current.slice(-7),
      {
        id,
        pathname,
        savedBytes,
        phase: "entering",
      },
    ]);

    timers.current.push(
      setTimeout(() => {
        setToasts((current) =>
          current.map((toast) =>
            toast.id === id
              ? { ...toast, phase: "visible" }
              : toast,
          ),
        );
      }, 30),
    );

    timers.current.push(
      setTimeout(() => {
        setToasts((current) =>
          current.map((toast) =>
            toast.id === id
              ? { ...toast, phase: "leaving" }
              : toast,
          ),
        );
      }, 4_500),
    );

    timers.current.push(
      setTimeout(() => {
        setToasts((current) =>
          current.filter((toast) => toast.id !== id),
        );
      }, 5_100),
    );
  }

  async function analyzeUnverified() {
    setRunning(true);
    setAnalysisError("");

    let nextRemaining = remaining;
    let completed = analyzed;

    try {
      while (nextRemaining > 0) {
        const result = await analyzeNextBlobImages();

        if (result.analyzed === 0) break;

        completed += result.analyzed;
        nextRemaining = result.remaining;
        setAnalyzed(completed);
        setRemaining(nextRemaining);
      }

      router.refresh();
    } catch (caught) {
      setAnalysisError(
        caught instanceof Error ? caught.message : "Image analysis failed.",
      );
    } finally {
      setRunning(false);
    }
  }

  async function analyzeAllWaiting() {
    setFullAuditRunning(true);
    setFullAuditError("");

    let nextRemaining = allRemaining;
    let completed = allAnalyzed;

    try {
      while (nextRemaining > 0) {
        const result = await analyzeAllUnverifiedBlobImages();

        if (result.analyzed === 0) break;

        completed += result.analyzed;
        nextRemaining = result.remaining;

        setAllAnalyzed(completed);
        setAllRemaining(nextRemaining);
      }

      router.refresh();
    } catch (caught) {
      setFullAuditError(
        caught instanceof Error
          ? caught.message
          : "Full image analysis failed.",
      );
    } finally {
      setFullAuditRunning(false);
    }
  }

  async function optimizeEverything() {
    if (!optimizationEnabled || optimizable === 0) return;

    const confirmed = window.confirm(
      `Optimize all ${optimizable} detected files?

Starting with:
${optimizationTarget || "Unknown file"}

Each file will be replaced individually. Its database references will be verified before the old Blob is deleted.`,
    );

    if (!confirmed) return;

    setOptimizing(true);
    setOptimizationError("");
    setOptimizedInRun(0);

    const total = optimizable;
    let completed = 0;
    let nextRemaining = optimizable;

    try {
      while (nextRemaining > 0) {
        const result = await optimizeNextDetectedBlob();

        if (result.optimized === 0 || !result.pathname) {
          break;
        }

        completed += result.optimized;
        nextRemaining = result.remaining;

        setOptimizedInRun(completed);
        setOptimizable(nextRemaining);
        showOptimizationToast(result.pathname, result.savedBytes);
      }

      router.refresh();
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Blob optimization stopped safely.";

      setOptimizationError(message);
    } finally {
      setOptimizing(false);
    }
  }

  const analysisTotal = analyzed + remaining;
  const analysisProgress =
    analysisTotal > 0
      ? Math.round((analyzed / analysisTotal) * 100)
      : 100;

  const fullAuditTotal = allAnalyzed + allRemaining;
  const fullAuditProgress =
    fullAuditTotal > 0
      ? Math.round((allAnalyzed / fullAuditTotal) * 100)
      : 100;

  const optimizationTotal = optimizedInRun + optimizable;
  const optimizationProgress =
    optimizationTotal > 0
      ? Math.round((optimizedInRun / optimizationTotal) * 100)
      : 100;

  return (
    <>
      <div className="flex w-full flex-wrap items-center gap-3 rounded-[28px] border border-[#11170f]/10 bg-white/35 p-3">
        <div className="mr-auto min-w-[190px] px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#11170f]/55">
            Storage maintenance
          </p>
          <p className="mt-1 text-xs text-[#11170f]/38">
            Audit first, then optimize.
          </p>
        </div>
        <div
          className={
            initialRemaining === 0 && !running
              ? "w-auto max-w-full"
              : "w-[280px] max-w-full"
          }
        >
          {initialRemaining === 0 && !running ? (
            <span className="inline-flex h-10 items-center justify-center rounded-full bg-[#d9ead5] px-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#286235]">
              Heavy analysis complete
            </span>
          ) : (
            <>
              <button
                type="button"
                disabled={running || fullAuditRunning || optimizing}
                onClick={analyzeUnverified}
                className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[#071321] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f4efe4] transition-colors hover:bg-[#132b44] disabled:cursor-wait disabled:opacity-65 disabled:hover:bg-[#071321]"
              >
                {running
                  ? `Analyzing ${analyzed} / ${analysisTotal}`
                  : `Analyze unverified · ${remaining}`}
              </button>

              {running ? (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#11170f]/10">
                  <div
                    className="h-full rounded-full bg-[#b88a3b] transition-[width]"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              ) : null}
            </>
          )}

          {analysisError ? (
            <p className="mt-2 text-xs text-[#8a3d2f]">
              {analysisError}
            </p>
          ) : null}
        </div>

        <div
          className={
            initialAllRemaining === 0 && !fullAuditRunning
              ? "w-auto max-w-full"
              : "w-[280px] max-w-full"
          }
        >
          {initialAllRemaining === 0 && !fullAuditRunning ? (
            <span className="inline-flex h-10 items-center justify-center rounded-full bg-[#d9ead5] px-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#286235]">
              Full analysis complete
            </span>
          ) : (
            <>
              <button
                type="button"
                disabled={fullAuditRunning || running || optimizing}
                onClick={analyzeAllWaiting}
                className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[#071321] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f4efe4] transition-colors hover:bg-[#132b44] disabled:cursor-wait disabled:opacity-65 disabled:hover:bg-[#071321]"
              >
                {fullAuditRunning
                  ? `Analyzing all ${allAnalyzed} / ${fullAuditTotal}`
                  : `Analyze all waiting · ${allRemaining}`}
              </button>

              {fullAuditRunning ? (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#11170f]/10">
                  <div
                    className="h-full rounded-full bg-[#b88a3b] transition-[width]"
                    style={{ width: `${fullAuditProgress}%` }}
                  />
                </div>
              ) : null}
            </>
          )}

          {fullAuditError ? (
            <p className="mt-2 line-clamp-2 text-xs text-[#8a3d2f]">
              {fullAuditError}
            </p>
          ) : null}
        </div>

        <div
          className={
            optimizable === 0 && !optimizing
              ? "w-auto max-w-full"
              : "w-[280px] max-w-full"
          }
        >
          <button
            type="button"
            disabled={
              !optimizationEnabled ||
              optimizing ||
              running ||
              fullAuditRunning ||
              optimizable === 0
            }
            onClick={optimizeEverything}
            className={
              optimizable === 0 && !optimizing
                ? "inline-flex h-10 items-center justify-center rounded-full border border-[#b88a3b]/25 bg-[#b88a3b]/10 px-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8a6b36]"
                : "inline-flex h-[52px] w-full items-center justify-center rounded-full border border-[#b88a3b]/40 bg-[#b88a3b]/10 px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b5a22] transition-colors hover:bg-[#b88a3b]/20 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[#b88a3b]/10"
            }
          >
            {optimizing
              ? `Optimizing ${optimizedInRun} / ${optimizationTotal}`
              : optimizable > 0
                ? `Optimize everything · ${optimizable}`
                : "Optimization complete"}
          </button>

          {optimizing ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#11170f]/10">
              <div
                className="h-full rounded-full bg-[#b88a3b] transition-[width]"
                style={{ width: `${optimizationProgress}%` }}
              />
            </div>
          ) : null}

          {optimizable > 0 && !optimizationEnabled ? (
            <p className="mt-2 text-[10px] text-[#11170f]/40">
              Write protection is enabled.
            </p>
          ) : null}

          {optimizationError ? (
            <p className="mt-2 line-clamp-2 text-xs text-[#8a3d2f]">
              {optimizationError}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="pointer-events-none fixed bottom-5 right-5 z-[100] h-[50vh] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden"
        aria-live="polite"
        aria-label="Optimization notifications"
      >
        {toasts.map((toast, index) => {
          const fromBottom = toasts.length - 1 - index;
          const verticalOffset = fromBottom * 82;
          const enteringOffset =
            toast.phase === "entering" ? 20 : 0;
          const horizontalOffset =
            toast.phase === "leaving" ? 24 : 0;

          return (
            <article
              key={toast.id}
              className="absolute bottom-0 left-0 h-[72px] w-full overflow-hidden rounded-2xl border border-[#b88a3b]/35 bg-[#f3e7cf] px-4 py-3"
              style={{
                opacity:
                  toast.phase === "entering" ||
                  toast.phase === "leaving"
                    ? 0
                    : 1,
                transform: `translate3d(${horizontalOffset}px, ${
                  -verticalOffset + enteringOffset
                }px, 0)`,
                transition:
                  "transform 360ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms ease",
              }}
            >
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7b5a22]">
                One file optimized: {shortenPath(toast.pathname)}
              </p>
              <p className="mt-2 text-xs text-[#7b5a22]/70">
                {formatBytes(toast.savedBytes)} saved
              </p>
            </article>
          );
        })}
      </div>
    </>
  );
}
