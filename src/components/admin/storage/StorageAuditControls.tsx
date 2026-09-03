"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  analyzeAllUnverifiedBlobImages,
  analyzeNextBlobImages,
  optimizeNextDetectedBlob,
  refreshRecentBlobImageAudit,
  restartFullBlobImageAnalysis,
} from "@/server/actions/storageAudit";
import { useStorageAuditSelection } from "@/components/admin/storage/StorageAuditSelectionContext";

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
  autoRefreshRecent,
  initialRemaining,
  initialAllRemaining,
  initialOptimizable,
  optimizationEnabled,
  optimizationTarget,
}: {
  autoRefreshRecent: boolean;
  initialRemaining: number;
  initialAllRemaining: number;
  initialOptimizable: number;
  optimizationEnabled: boolean;
  optimizationTarget: string | null;
}) {
  const router = useRouter();
  const {
    selectionMode,
    toggleSelectionMode,
  } = useStorageAuditSelection();
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const recentRunStarted = useRef(false);

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
  const [optimizationIssueOpen, setOptimizationIssueOpen] =
    useState(false);
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

  useEffect(() => {
    if (!autoRefreshRecent || recentRunStarted.current) {
      return;
    }

    recentRunStarted.current = true;
    let active = true;

    async function refreshRecentUploads() {
      setRunning(true);
      setAnalysisError("");
      setAnalyzed(0);

      try {
        await refreshRecentBlobImageAudit();

        let completed = 0;

        while (active) {
          const result = await analyzeAllUnverifiedBlobImages();

          if (result.analyzed === 0) {
            setRemaining(0);
            break;
          }

          completed += result.analyzed;
          setAnalyzed(completed);
          setRemaining(result.remaining);

          if (result.remaining === 0) {
            break;
          }
        }

        if (active) {
          router.replace("/admin/storage-audit", {
            scroll: false,
          });
          router.refresh();
        }
      } catch (caught) {
        if (active) {
          setAnalysisError(
            caught instanceof Error
              ? caught.message
              : "Recent upload audit failed.",
          );
        }
      } finally {
        if (active) {
          setRunning(false);
        }
      }
    }

    void refreshRecentUploads();

    return () => {
      active = false;
    };
  }, [autoRefreshRecent, router]);

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
    setAllAnalyzed(0);
    setAllRemaining(1);

    let completed = 0;

    try {
      await restartFullBlobImageAnalysis();

      while (true) {
        const result = await analyzeAllUnverifiedBlobImages();

        if (result.analyzed === 0) {
          setAllRemaining(0);
          break;
        }

        completed += result.analyzed;
        setAllAnalyzed(completed);
        setAllRemaining(result.remaining);

        if (result.remaining === 0) {
          break;
        }
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

  function getOptimizationIssue() {
    if (optimizing) {
      return "An optimization is already in progress. Please wait until it finishes.";
    }

    if (!optimizationEnabled) {
      return "Optimization writes are protected by the server configuration. Set BLOB_OPTIMIZATION_WRITE_ENABLED=true in the deployment environment, then restart the application to authorize Blob replacements.";
    }

    if (running) {
      return "Heavy analysis is currently running. Optimization will become available when that analysis finishes.";
    }

    if (fullAuditRunning) {
      return "Full analysis is currently running. Optimization will become available when that analysis finishes.";
    }

    if (optimizable === 0) {
      return "No files currently require optimization. The registry is already up to date.";
    }

    return null;
  }

  async function optimizeEverything() {
    const issue = getOptimizationIssue();

    if (issue) {
      setOptimizationIssueOpen(true);
      return;
    }

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
      setOptimizationIssueOpen(true);
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

        <button
          type="button"
          onClick={toggleSelectionMode}
          aria-pressed={selectionMode}
          className={`inline-flex h-10 items-center justify-center rounded-full border px-5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ease-out ${
            selectionMode
              ? "border-[#071321] bg-[#071321] text-[#f4efe4]"
              : "border-[#b88a3b]/35 bg-[#b88a3b]/10 text-[#7b5a22] hover:bg-[#b88a3b]/20"
          }`}
        >
          {selectionMode
            ? "Exit selection"
            : "Multiple selection"}
        </button>

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

      <div className="w-[220px] max-w-full">
        <button
          type="button"
          disabled={fullAuditRunning || running || optimizing}
          aria-busy={fullAuditRunning}
          onClick={analyzeAllWaiting}
          className={`relative isolate inline-flex h-10 w-full items-center justify-center overflow-hidden rounded-full px-4 text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-wait ${
            fullAuditRunning
              ? "bg-[#071321] text-[#f4efe4]"
              : "bg-[#d9ead5] text-[#286235] hover:bg-[#cce3c7]"
          }`}
        >
          {fullAuditRunning ? (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 bg-[#b88a3b]/75 transition-[width] duration-300 ease-out"
              style={{ width: `${fullAuditProgress}%` }}
            />
          ) : null}

          <span className="relative z-10">
            {fullAuditRunning
              ? allAnalyzed === 0
                ? "Preparing full analysis"
                : `Analyzing all ${allAnalyzed} / ${fullAuditTotal}`
              : initialAllRemaining === 0
                ? "Re-run full analysis"
                : `Run full analysis · ${initialAllRemaining}`}
          </span>
        </button>

        {fullAuditError ? (
          <p className="mt-2 line-clamp-2 text-xs text-[#8a3d2f]">
            {fullAuditError}
          </p>
        ) : null}
      </div>

          <div className="w-[220px] max-w-full">
            <button
              type="button"
              aria-busy={optimizing}
              onClick={optimizeEverything}
              className={`relative isolate inline-flex h-10 w-full items-center justify-center overflow-hidden rounded-full border px-4 text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                optimizing
                  ? "border-[#071321] bg-[#071321] text-[#f4efe4]"
                  : !optimizationEnabled && optimizable > 0
                    ? "border-[#a4473d]/35 bg-[#a4473d]/10 text-[#8a3d2f] hover:bg-[#a4473d]/15"
                    : "border-[#b88a3b]/25 bg-[#b88a3b]/10 text-[#8a6b36] hover:bg-[#b88a3b]/20"
              }`}
            >
              {optimizing ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 bg-[#b88a3b]/75 transition-[width] duration-300 ease-out"
                  style={{ width: `${optimizationProgress}%` }}
                />
              ) : null}

              <span className="relative z-10">
                {optimizing
                  ? `Optimizing ${optimizedInRun} / ${optimizationTotal}`
                  : !optimizationEnabled && optimizable > 0
                    ? `Optimization unavailable · ${optimizable}`
                    : optimizable > 0
                      ? `Optimize everything · ${optimizable}`
                      : "Optimization complete"}
              </span>

              {!optimizing &&
              ((!optimizationEnabled && optimizable > 0) ||
                Boolean(optimizationError)) ? (
                <span
                  aria-hidden="true"
                  className="absolute right-3 top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-[#a4473d] text-[9px] text-white"
                >
                  !
                </span>
              ) : null}
            </button>
          </div>

      </div>

        {optimizationIssueOpen ? (
          <div
            role="presentation"
            className="fixed inset-0 z-[140] flex items-center justify-center bg-[#071321]/45 p-5 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setOptimizationIssueOpen(false);
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="optimization-issue-title"
              className="w-full max-w-[520px] overflow-hidden rounded-[32px] border border-[#11170f]/10 bg-[#f4efe4] shadow-2xl"
            >
              <div className="flex items-start justify-between gap-5 border-b border-[#11170f]/10 px-7 py-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b88a3b]">
                    Storage optimization
                  </p>
                  <h2
                    id="optimization-issue-title"
                    className="mt-2 font-serif text-3xl leading-none text-[#11170f]"
                  >
                    Optimization unavailable
                  </h2>
                </div>

                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOptimizationIssueOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071321] text-xl text-[#f4efe4]"
                >
                  ×
                </button>
              </div>

              <div className="px-7 py-7">
                <p className="text-sm leading-7 text-[#11170f]/65">
                  {optimizationError ||
                    getOptimizationIssue() ||
                    "Optimization cannot start at the moment."}
                </p>

                <div className="mt-7 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOptimizationIssueOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[#071321] px-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f4efe4]"
                  >
                    Understood
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : null}

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
