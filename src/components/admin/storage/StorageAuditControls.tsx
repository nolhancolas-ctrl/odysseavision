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

function ResponsiveControlLabel({
  full,
  compact,
}: {
  full: string;
  compact: string;
}) {
  return (
    <>
      <span className="hidden max-w-full truncate align-middle leading-none xl:inline-block">
        {full}
      </span>
      <span className="inline-block max-w-full truncate align-middle leading-none xl:hidden">
        {compact}
      </span>
    </>
  );
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

  const [fullAuditRunning, setFullAuditRunning] = useState(false);
  const [allRemaining, setAllRemaining] = useState(initialAllRemaining);
  const [allAnalyzed, setAllAnalyzed] = useState(0);

  const [optimizing, setOptimizing] = useState(false);
  const [optimizable, setOptimizable] = useState(initialOptimizable);
  const [optimizedInRun, setOptimizedInRun] = useState(0);
  const [optimizationError, setOptimizationError] = useState("");
  const [optimizationIssueOpen, setOptimizationIssueOpen] =
    useState(false);
  const [toasts, setToasts] = useState<OptimizationToast[]>([]);
  const [errorToast, setErrorToast] = useState("");

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
    if (!errorToast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setErrorToast("");
    }, 5200);

    return () => window.clearTimeout(timeout);
  }, [errorToast]);

  useEffect(() => {
    if (!autoRefreshRecent || recentRunStarted.current) {
      return;
    }

    recentRunStarted.current = true;
    let active = true;

    async function refreshRecentUploads() {
      setAnalyzed(0);

      try {
        await refreshRecentBlobImageAudit();

        let completed = 0;
        let hasVisibleWork = false;

        while (active) {
          const result = await analyzeAllUnverifiedBlobImages();

          if (result.analyzed === 0) {
            setRemaining(0);
            break;
          }

          if (!hasVisibleWork) {
            hasVisibleWork = true;
            setRunning(true);
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
      } catch {
        if (active) {
          setErrorToast(
            "The recent-upload audit could not be completed. Please contact Nolhan.",
          );

          router.replace("/admin/storage-audit", {
            scroll: false,
          });
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
    setAnalyzed(0);

    let nextRemaining = remaining;
    let completed = 0;

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
    } catch {
      setErrorToast(
        "The heavy analysis could not be completed. Please contact Nolhan.",
      );
    } finally {
      setRunning(false);
    }
  }

  async function analyzeAllWaiting() {
    setFullAuditRunning(true);
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
    } catch {
      setErrorToast(
        "The full analysis could not be completed. Please contact Nolhan.",
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
      return `${optimizable} ${
        optimizable === 1 ? "file is" : "files are"
      } currently waiting for optimization. Optimization writes are protected by the server configuration. Set BLOB_OPTIMIZATION_WRITE_ENABLED=true in the deployment environment, then restart the application to authorize Blob replacements.`;
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
      <div className="grid w-full grid-cols-[repeat(2,minmax(0,220px))] items-center justify-center gap-3 rounded-[28px] border border-[#11170f]/10 bg-white/35 p-3 md:grid-cols-[minmax(190px,1fr)_repeat(2,minmax(0,220px))] xl:grid-cols-[minmax(190px,1fr)_repeat(4,minmax(0,220px))]">
        <div className="col-span-2 w-full px-2 text-left md:col-span-1 md:row-span-2 md:self-center xl:row-span-1">
          <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.16em] text-[#11170f]/55">
            Storage maintenance
          </p>
          <p className="mt-1 whitespace-nowrap text-xs text-[#11170f]/38">
            Audit first, then optimize.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleSelectionMode}
          aria-pressed={selectionMode}
          className={`inline-flex h-10 w-full min-w-0 items-center justify-center whitespace-nowrap rounded-full border px-3 text-[9px] font-semibold uppercase tracking-[0.1em] transition-all duration-300 ease-out sm:px-4 xl:px-5 xl:text-[10px] xl:tracking-[0.14em] ${
            selectionMode
              ? "border-[#071321] bg-[#071321] text-[#f4efe4]"
              : "border-[#b88a3b]/35 bg-[#b88a3b]/10 text-[#7b5a22] hover:bg-[#b88a3b]/20"
          }`}
        >
          <ResponsiveControlLabel
            full={
              selectionMode
                ? "Exit selection"
                : "Multiple selection"
            }
            compact={
              selectionMode
                ? "Exit selection"
                : "Multi-select"
            }
          />
        </button>

        <div className="w-full min-w-0">
          {remaining === 0 && !running ? (
            <span className="flex h-10 w-full min-w-0 items-center justify-center whitespace-nowrap rounded-full bg-[#d9ead5] px-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#286235] sm:px-4 xl:tracking-[0.12em]">
              <ResponsiveControlLabel
                full="Heavy analysis complete"
                compact="Heavy complete"
              />
            </span>
          ) : (
            <button
              type="button"
              disabled={running || fullAuditRunning || optimizing}
              onClick={analyzeUnverified}
              className="relative isolate inline-flex h-10 w-full min-w-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-[#071321] px-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#f4efe4] transition-colors hover:bg-[#132b44] disabled:cursor-wait disabled:opacity-65 disabled:hover:bg-[#071321] sm:px-4 xl:tracking-[0.12em]"
            >
              {running ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 z-0 bg-[#b88a3b]/75 transition-[width] duration-300 ease-out"
                  style={{ width: `${analysisProgress}%` }}
                />
              ) : null}

              <span className="relative z-10 flex h-full w-full items-center justify-center leading-none">
                <ResponsiveControlLabel
                  full={
                    running
                      ? `Analyzing ${analyzed} / ${analysisTotal}`
                      : `Analyze unverified · ${remaining}`
                  }
                  compact={
                    running
                      ? `Analysis ${analyzed} / ${analysisTotal}`
                      : `Analyze · ${remaining}`
                  }
                />
              </span>
            </button>
          )}
        </div>

      <div className="w-full min-w-0">
        <button
          type="button"
          disabled={fullAuditRunning || running || optimizing}
          aria-busy={fullAuditRunning}
          onClick={analyzeAllWaiting}
          className={`relative isolate inline-flex h-10 w-full min-w-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-3 text-[9px] font-semibold uppercase tracking-[0.1em] transition-colors disabled:cursor-wait sm:px-4 xl:tracking-[0.12em] ${
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

          <span className="relative z-10 flex h-full w-full items-center justify-center leading-none">
            <ResponsiveControlLabel
              full={
                fullAuditRunning
                  ? allAnalyzed === 0
                    ? "Preparing full analysis"
                    : `Analyzing all ${allAnalyzed} / ${fullAuditTotal}`
                  : initialAllRemaining === 0
                    ? "Re-run full analysis"
                    : `Run full analysis · ${initialAllRemaining}`
              }
              compact={
                fullAuditRunning
                  ? allAnalyzed === 0
                    ? "Preparing analysis"
                    : `Full ${allAnalyzed} / ${fullAuditTotal}`
                  : initialAllRemaining === 0
                    ? "Re-run analysis"
                    : `Full analysis · ${initialAllRemaining}`
              }
            />
          </span>
        </button>

      </div>

          <div className="w-full min-w-0">
            <button
              type="button"
              aria-busy={optimizing}
              onClick={optimizeEverything}
              className={`relative isolate inline-flex h-10 w-full min-w-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-full border py-0 pl-3 pr-8 text-[9px] font-semibold uppercase tracking-[0.08em] transition-colors sm:pl-4 sm:pr-8 xl:tracking-[0.09em] ${
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

              <span className="relative z-10 flex h-full w-full items-center justify-center leading-none">
                <ResponsiveControlLabel
                  full={
                    optimizing
                      ? `Optimizing ${optimizedInRun} / ${optimizationTotal}`
                      : !optimizationEnabled && optimizable > 0
                        ? "Optimization unavailable"
                        : optimizable > 0
                          ? `Optimize everything · ${optimizable}`
                          : "Optimization complete"
                  }
                  compact={
                    optimizing
                      ? `Optimize ${optimizedInRun} / ${optimizationTotal}`
                      : !optimizationEnabled && optimizable > 0
                        ? "Unavailable"
                        : optimizable > 0
                          ? `Optimize · ${optimizable}`
                          : "Optimized"
                  }
                />
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

      {errorToast ? (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 right-6 z-[130] w-[min(380px,calc(100vw-2rem))] rounded-[22px] border border-[#b14c42]/35 bg-[#fff4ef] p-5 shadow-[0_20px_60px_rgba(77,36,30,0.24)]"
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#9b443a]">
            Action failed
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#6f332d]">
            {errorToast}
          </p>
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
