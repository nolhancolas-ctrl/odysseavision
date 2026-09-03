"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  deleteUnusedBlobImage,
  deleteUnusedBlobImages,
} from "@/server/actions/storageAudit";
import { useStorageAuditSelection } from "@/components/admin/storage/StorageAuditSelectionContext";

type AuditRow = {
  id: string;
  url: string;
  pathname: string;
  uploadedAt: string | null;
  referenced: boolean;
  usageStatus: "PUBLIC" | "DRAFT" | "UNUSED";
  size: number;
  contentType: string;
  contentHash: string;
  format: string;
  width: number | null;
  height: number | null;
  projectedSize: number | null;
  projectedSavingBytes: number;
  projectedSavingPercent: number;
  policyIssues: string[];
  status: string;
  policyVersion: number;
  policyCurrent: boolean;
  checkedAt: string | null;
  note: string;
};


function SelectionBox({
  checked,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      className={`flex h-6 w-6 items-center justify-center rounded-[7px] border transition-all ${
        checked
          ? "border-[#071321] bg-[#071321] text-white"
          : disabled
            ? "cursor-not-allowed border-[#11170f]/10 bg-[#11170f]/[0.025] text-transparent"
            : "border-[#11170f]/25 bg-white/70 text-transparent hover:border-[#071321]/55"
      }`}
    >
      <svg
        viewBox="0 0 20 13"
        className="h-[11px] w-4"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1.5 6.2 7.2 11 18.5 1.8"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

type StorageAuditTableProps = {
  rows: AuditRow[];
  groupDuplicates?: boolean;
};

type SortKey = "date" | "size" | "name" | "location" | "saving" | "status";
type SortDirection = "asc" | "desc";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "date", label: "Date" },
  { value: "size", label: "File size" },
  { value: "name", label: "File name" },
  { value: "location", label: "Site location" },
  { value: "saving", label: "Potential saving" },
  { value: "status", label: "Status" },
];

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";

  const megabytes = bytes / 1_000_000;
  return megabytes < 1000
    ? `${megabytes.toFixed(megabytes >= 100 ? 0 : 1)} MB`
    : `${(megabytes / 1000).toFixed(2)} GB`;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
}

function getSiteLocation(pathname: string) {
  const separator = pathname.lastIndexOf("/");
  return separator >= 0 ? pathname.slice(0, separator) : "Root";
}

function compactPath(pathname: string) {
  const separator = pathname.lastIndexOf("/");
  const directory = separator >= 0 ? pathname.slice(0, separator + 1) : "";
  const filename = separator >= 0 ? pathname.slice(separator + 1) : pathname;

  if (filename.length <= 38) return pathname;

  return `${directory}${filename.slice(0, 18)}[…]${filename.slice(-15)}`;
}

function usageLabel(row: AuditRow) {
  if (row.usageStatus === "DRAFT") return "Draft";
  if (row.usageStatus === "PUBLIC") return "Referenced";
  return "Unused";
}

function statusLabel(row: AuditRow) {
  if (row.status === "PENDING") return "Checking";
  if (!row.policyCurrent || row.status === "UNKNOWN") return "Waiting";
  if (row.status === "NEEDS_OPTIMIZATION") return "Optimize";
  if (row.status === "COMPLIANT") return "Optimized";
  if (row.status === "SKIPPED") return "Excluded";
  return "Failed";
}

function statusClasses(row: AuditRow) {
  if (!row.policyCurrent || ["UNKNOWN", "PENDING"].includes(row.status)) {
    return "bg-[#e6e1d7] text-[#5f5a4f]";
  }
  if (row.status === "NEEDS_OPTIMIZATION") {
    return "bg-[#eadfc8] text-[#84652d]";
  }
  if (row.status === "COMPLIANT") {
    return "bg-[#d9ead5] text-[#286235]";
  }
  if (row.status === "FAILED") {
    return "bg-[#e8d6d1] text-[#8a3d2f]";
  }
  return "bg-[#e4e7e2] text-[#4f5b50]";
}

export function StorageAuditTable({
  rows,
  groupDuplicates = false,
}: StorageAuditTableProps) {
  const {
    selectionMode,
    setSelectionMode,
  } = useStorageAuditSelection();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteMessage, setBulkDeleteMessage] = useState("");
  const [bulkProgress, setBulkProgress] = useState(0);
  const [selectionSurfaceMounted, setSelectionSurfaceMounted] =
    useState(false);
  const [selectionSurfaceVisible, setSelectionSurfaceVisible] =
    useState(false);
  const [bulkDeleteNotice, setBulkDeleteNotice] = useState<{
    count: number;
  } | null>(null);
  const [bulkNoticeVisible, setBulkNoticeVisible] =
    useState(false);
  const pressTimerRef = useRef<number | null>(null);
  const pressOriginRef = useRef({ x: 0, y: 0 });
  const dragValueRef = useRef<boolean | null>(null);
  const suppressNextClickRef = useRef(false);

  const [selected, setSelected] = useState<AuditRow | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");
  const sortMenuRef = useRef<HTMLDetailsElement>(null);
  const router = useRouter();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [deleteCandidate, setDeleteCandidate] =
    useState<AuditRow | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteNotice, setDeleteNotice] = useState<{
    pathname: string;
    freedBytes: number;
  } | null>(null);
  const [deleteFailureNotice, setDeleteFailureNotice] =
    useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const sortedRows = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;

    const sorted = rows
      .filter((row) => !deletedIds.has(row.id))
      .sort((left, right) => {
        let comparison = 0;

        if (sortKey === "date") {
          const leftDate = left.uploadedAt
            ? new Date(left.uploadedAt).getTime()
            : 0;
          const rightDate = right.uploadedAt
            ? new Date(right.uploadedAt).getTime()
            : 0;
          comparison = leftDate - rightDate;
        } else if (sortKey === "size") {
          comparison = left.size - right.size;
        } else if (sortKey === "name") {
          comparison = left.pathname.localeCompare(right.pathname, "fr");
        } else if (sortKey === "location") {
          comparison = getSiteLocation(left.pathname).localeCompare(
            getSiteLocation(right.pathname),
            "fr",
          );
        } else if (sortKey === "saving") {
          comparison =
            left.projectedSavingBytes - right.projectedSavingBytes;
        } else {
          comparison = statusLabel(left).localeCompare(
            statusLabel(right),
            "fr",
          );
        }

        if (comparison === 0) {
          comparison = left.pathname.localeCompare(right.pathname, "fr");
        }

        return comparison * direction;
      });

    if (!groupDuplicates) {
      return sorted;
    }

    const groupOrder = new Map<string, number>();
    const rowOrder = new Map<string, number>();

    sorted.forEach((row, index) => {
      const groupKey = row.contentHash || row.id;

      if (!groupOrder.has(groupKey)) {
        groupOrder.set(groupKey, groupOrder.size);
      }

      rowOrder.set(row.id, index);
    });

    return [...sorted].sort((left, right) => {
      const leftGroup = groupOrder.get(left.contentHash || left.id) ?? 0;
      const rightGroup = groupOrder.get(right.contentHash || right.id) ?? 0;

      return (
        leftGroup - rightGroup ||
        (rowOrder.get(left.id) ?? 0) - (rowOrder.get(right.id) ?? 0)
      );
    });
  }, [
    deletedIds,
    groupDuplicates,
    rows,
    sortDirection,
    sortKey,
  ]);

  const duplicateMetaByHash = useMemo(() => {
    const groups = new Map<string, AuditRow[]>();

    if (!groupDuplicates) {
      return new Map<
        string,
        {
          index: number;
          count: number;
          redundant: number;
          reclaimableBytes: number;
        }
      >();
    }

    for (const row of sortedRows) {
      if (!row.contentHash) continue;

      const group = groups.get(row.contentHash) ?? [];
      group.push(row);
      groups.set(row.contentHash, group);
    }

    const metadata = new Map<
      string,
      {
        index: number;
        count: number;
        redundant: number;
        reclaimableBytes: number;
      }
    >();

    let index = 1;

    for (const row of sortedRows) {
      if (!row.contentHash || metadata.has(row.contentHash)) continue;

      const group = groups.get(row.contentHash) ?? [];
      if (group.length < 2) continue;

      const totalBytes = group.reduce(
        (total, item) => total + item.size,
        0,
      );
      const keptBytes = Math.max(...group.map((item) => item.size));

      metadata.set(row.contentHash, {
        index,
        count: group.length,
        redundant: group.length - 1,
        reclaimableBytes: Math.max(0, totalBytes - keptBytes),
      });

      index += 1;
    }

    return metadata;
  }, [groupDuplicates, sortedRows]);

  const selectedIndex = selected
    ? sortedRows.findIndex((row) => row.id === selected.id)
    : -1;

  function navigatePreview(direction: -1 | 1) {
    setSelected((current) => {
      if (!current || sortedRows.length < 2) return current;

      const currentIndex = sortedRows.findIndex(
        (row) => row.id === current.id,
      );

      if (currentIndex < 0) return sortedRows[0];

      const nextIndex =
        (currentIndex + direction + sortedRows.length) %
        sortedRows.length;

      return sortedRows[nextIndex];
    });
  }

  function requestDeletion(row: AuditRow) {
    setDeleteError("");
    setDeleteCandidate(row);
  }

  function confirmDeletion() {
    const candidate = deleteCandidate;
    if (!candidate) return;

    setDeleteError("");

    startDeleteTransition(async () => {
      try {
        const result = await deleteUnusedBlobImage(candidate.id);

        if (!result.ok) {
          const message = result.message || "";

          if (!message || /unexpected response/i.test(message)) {
            setDeleteCandidate(null);
            setDeleteError("");
            setDeleteFailureNotice(true);
            return;
          }

          setDeleteError(message);
          return;
        }

        setDeletedIds((current) => {
          const next = new Set(current);
          next.add(candidate.id);
          return next;
        });

        setDeleteCandidate(null);
        setSelected((current) =>
          current?.id === candidate.id ? null : current,
        );
        setDeleteNotice({
          pathname: result.pathname,
          freedBytes: result.freedBytes,
        });

        router.refresh();
      } catch {
        setDeleteCandidate(null);
        setDeleteError("");
        setDeleteFailureNotice(true);
      }
    });
  }

  useEffect(() => {
    if (!selected) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handlePreviewKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigatePreview(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        navigatePreview(1);
      }
    };

    window.addEventListener("keydown", handlePreviewKeyboard);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handlePreviewKeyboard);
    };
  }, [selected, sortedRows]);

  useEffect(() => {
    if (!deleteCandidate) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleDeleteKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        setDeleteCandidate(null);
        setDeleteError("");
      }
    };

    window.addEventListener("keydown", handleDeleteKeyboard);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleDeleteKeyboard);
    };
  }, [deleteCandidate, isDeleting]);

  useEffect(() => {
    if (!deleteNotice) return;

    const timeout = window.setTimeout(() => {
      setDeleteNotice(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [deleteNotice]);

  useEffect(() => {
    if (!deleteFailureNotice) return;

    const timeout = window.setTimeout(() => {
      setDeleteFailureNotice(false);
    }, 5200);

    return () => window.clearTimeout(timeout);
  }, [deleteFailureNotice]);


  const selectableRows = useMemo(
    () =>
      sortedRows.filter(
        (row) => row.usageStatus === "UNUSED",
      ),
    [sortedRows],
  );

  const selectedRows = useMemo(
    () => sortedRows.filter((row) => selectedIds.has(row.id)),
    [selectedIds, sortedRows],
  );

  const selectedBytes = selectedRows.reduce(
    (total, row) => total + row.size,
    0,
  );

  const allSelectableSelected =
    selectableRows.length > 0 &&
    selectableRows.every((row) => selectedIds.has(row.id));

  function setRowSelection(id: string, value: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (value) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }

  function toggleRowSelection(row: AuditRow) {
    if (row.usageStatus !== "UNUSED") return;
    setRowSelection(row.id, !selectedIds.has(row.id));
  }

  function clearPressTimer() {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }

  function beginRowPointer(
    event: ReactPointerEvent<HTMLTableRowElement>,
    row: AuditRow,
  ) {
    if (event.button !== 0 || row.usageStatus !== "UNUSED") {
      return;
    }

    pressOriginRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    if (selectionMode) {
      const nextValue = !selectedIds.has(row.id);
      dragValueRef.current = nextValue;
      suppressNextClickRef.current = true;
      setRowSelection(row.id, nextValue);
      return;
    }

    clearPressTimer();

    pressTimerRef.current = window.setTimeout(() => {
      suppressNextClickRef.current = true;
      setSelected(null);
      setSelectionMode(true);
      setRowSelection(row.id, true);
      pressTimerRef.current = null;
    }, 480);
  }

  function moveRowPointer(
    event: ReactPointerEvent<HTMLTableRowElement>,
  ) {
    if (pressTimerRef.current === null) return;

    const distance =
      Math.abs(event.clientX - pressOriginRef.current.x) +
      Math.abs(event.clientY - pressOriginRef.current.y);

    if (distance > 8) clearPressTimer();
  }

  function enterRowWhileDragging(
    event: ReactPointerEvent<HTMLTableRowElement>,
    row: AuditRow,
  ) {
    if (
      !selectionMode ||
      row.usageStatus !== "UNUSED" ||
      dragValueRef.current === null ||
      event.buttons !== 1
    ) {
      return;
    }

    suppressNextClickRef.current = true;
    setRowSelection(row.id, dragValueRef.current);
  }

  function confirmBulkDeletion() {
    const ids = selectedRows.map((row) => row.id);
    if (ids.length === 0) return;

    setBulkDeleteMessage("");
    setBulkProgress(6);

    startDeleteTransition(async () => {
      try {
        const rawResult = await deleteUnusedBlobImages(ids);
        const result = rawResult as {
          ok?: boolean;
          deletedIds?: string[];
          freedBytes?: number;
          message?: string;
        };

        const removedIds = Array.isArray(result.deletedIds)
          ? result.deletedIds
          : [];

        if (removedIds.length === 0) {
          setBulkProgress(0);
          setBulkDeleteMessage(
            result.message ||
              "No file was deleted. Their references may have changed.",
          );
          return;
        }

        setDeletedIds((current) => {
          const next = new Set(current);
          removedIds.forEach((id) => next.add(id));
          return next;
        });

        setBulkProgress(100);

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 280);
        });

        setSelectedIds(new Set());
        setBulkDeleteOpen(false);
        setBulkDeleteNotice({ count: removedIds.length });
        setBulkNoticeVisible(true);
        setSelectionMode(false);
        router.refresh();
      } catch {
        setBulkProgress(0);
        setBulkDeleteMessage(
          "Bulk deletion failed. Protected files were not deleted.",
        );
      }
    });
  }

  useEffect(() => {
    const finishSelection = () => {
      clearPressTimer();
      dragValueRef.current = null;
    };

    window.addEventListener("pointerup", finishSelection);
    window.addEventListener("pointercancel", finishSelection);

    return () => {
      clearPressTimer();
      window.removeEventListener("pointerup", finishSelection);
      window.removeEventListener("pointercancel", finishSelection);
    };
  }, []);

  useEffect(() => {
    let removalTimer: number | null = null;
    let animationFrame: number | null = null;

    if (selectionMode) {
      setSelected(null);
      setSelectionSurfaceMounted(true);
      setSelectionSurfaceVisible(false);

      animationFrame = window.requestAnimationFrame(() => {
        setSelectionSurfaceVisible(true);
      });
    } else {
      setSelectionSurfaceVisible(false);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      setBulkDeleteMessage("");
      setBulkProgress(0);
      dragValueRef.current = null;

      removalTimer = window.setTimeout(() => {
        setSelectionSurfaceMounted(false);
      }, 340);
    }

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      if (removalTimer !== null) {
        window.clearTimeout(removalTimer);
      }
    };
  }, [selectionMode]);

  useEffect(() => {
    if (!isDeleting) return;

    const interval = window.setInterval(() => {
      setBulkProgress((current) => {
        if (current >= 92) return current;

        const remaining = 92 - current;
        return Math.min(
          92,
          current + Math.max(1, Math.ceil(remaining * 0.12)),
        );
      });
    }, 180);

    return () => window.clearInterval(interval);
  }, [isDeleting]);

  useEffect(() => {
    if (!bulkDeleteNotice) return;

    const hideTimer = window.setTimeout(() => {
      setBulkNoticeVisible(false);
    }, 4200);

    const removeTimer = window.setTimeout(() => {
      setBulkDeleteNotice(null);
    }, 4550);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, [bulkDeleteNotice]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2 border-b border-[#11170f]/8 bg-white/20 px-5 py-3">
        <div
          aria-hidden={!selectionMode}
          className={`mr-auto grid transition-[grid-template-columns,opacity,transform] duration-300 ease-out ${
            selectionMode
              ? "grid-cols-[1fr] translate-x-0 opacity-100"
              : "pointer-events-none grid-cols-[0fr] -translate-x-2 opacity-0"
          }`}
        >
          <span className="min-w-0 overflow-hidden whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7b5a22]">
            Click or drag across unused files
          </span>
        </div>
        <span className="mr-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#11170f]/38">
          Sort by
        </span>

        <details ref={sortMenuRef} className="group relative">
          <summary className="flex h-10 min-w-[210px] cursor-pointer list-none items-center justify-between rounded-full border border-[#b88a3b]/30 bg-[#b88a3b]/[0.07] px-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7b5a22] transition-colors hover:bg-[#b88a3b]/[0.14] [&::-webkit-details-marker]:hidden">
            <span>
              {SORT_OPTIONS.find((option) => option.value === sortKey)?.label}
            </span>
            <span
              aria-hidden="true"
              className="ml-5 text-xs transition-transform group-open:rotate-180"
            >
              ▾
            </span>
          </summary>

          <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[230px] overflow-hidden rounded-[18px] border border-[#11170f]/12 bg-[#f7f2e9] p-1.5 shadow-[0_18px_45px_rgba(7,19,33,0.16)]">
            {SORT_OPTIONS.map((option) => {
              const active = option.value === sortKey;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSortKey(option.value);
                    sortMenuRef.current?.removeAttribute("open");
                  }}
                  className={`flex w-full items-center justify-between rounded-[13px] px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.11em] transition-colors ${
                    active
                      ? "bg-[#071321] text-[#f4efe4]"
                      : "text-[#11170f]/55 hover:bg-[#11170f]/[0.06] hover:text-[#11170f]"
                  }`}
                >
                  <span>{option.label}</span>
                  {active ? <span aria-hidden="true">✓</span> : null}
                </button>
              );
            })}
          </div>
        </details>

        <button
          type="button"
          onClick={() =>
            setSortDirection((current) =>
              current === "desc" ? "asc" : "desc",
            )
          }
          aria-label={
            sortDirection === "desc"
              ? "Switch to ascending order"
              : "Switch to descending order"
          }
          title={
            sortDirection === "desc"
              ? "Descending order"
              : "Ascending order"
          }
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#11170f]/12 bg-[#f7f2e9] text-base text-[#11170f]/60 transition-colors hover:bg-[#071321] hover:text-white"
        >
          {sortDirection === "desc" ? "↓" : "↑"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table
          className={`w-full table-fixed border-collapse text-left transition-[min-width] duration-300 ease-out ${
            selectionMode ? "min-w-[1180px]" : "min-w-[1120px]"
          }`}
        >
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#11170f]/38">
              <th
                aria-hidden={!selectionMode}
                className={`overflow-hidden transition-[width,padding,opacity] duration-300 ease-out ${
                  selectionMode
                    ? "w-[5%] px-4 py-4 opacity-100"
                    : "pointer-events-none w-0 px-0 py-4 opacity-0"
                }`}
              >
                <div
                  className={`overflow-hidden transition-[width,opacity,transform] duration-300 ease-out ${
                    selectionMode
                      ? "w-7 translate-x-0 opacity-100"
                      : "w-0 -translate-x-3 opacity-0"
                  }`}
                >
                  <SelectionBox
                    checked={allSelectableSelected}
                    disabled={
                      !selectionMode ||
                      selectableRows.length === 0
                    }
                    label={
                      allSelectableSelected
                        ? "Deselect all unused files"
                        : "Select all unused files"
                    }
                    onChange={() => {
                      setSelectedIds(
                        allSelectableSelected
                          ? new Set()
                          : new Set(
                              selectableRows.map((row) => row.id),
                            ),
                      );
                    }}
                  />
                </div>
              </th>
              <th
                className={`px-5 py-4 transition-[width,padding] duration-300 ease-out ${
                  selectionMode ? "w-[26%]" : "w-[31%]"
                }`}
              >
                File
              </th>
              <th className="w-[9%] px-3 py-4">Date</th>
              <th className="w-[9%] px-3 py-4">Stored</th>
              <th className="w-[11%] px-3 py-4">Image</th>
              <th className="w-[10%] px-3 py-4">Projected</th>
              <th className="w-[9%] px-3 py-4">Usage</th>
              <th className="w-[13%] px-3 py-4">Assessment</th>
              <th className="w-[8%] px-5 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={row.id}
                role="button"
                tabIndex={0}
                aria-label={
                  selectionMode
                    ? `${
                        selectedIds.has(row.id)
                          ? "Deselect"
                          : "Select"
                      } ${row.pathname}`
                    : `Preview ${row.pathname}`
                }
                onPointerDown={(event) =>
                  beginRowPointer(event, row)
                }
                onPointerMove={moveRowPointer}
                onPointerEnter={(event) =>
                  enterRowWhileDragging(event, row)
                }
                onPointerUp={clearPressTimer}
                onPointerCancel={clearPressTimer}
                onContextMenu={(event) => {
                  if (
                    selectionMode ||
                    row.usageStatus === "UNUSED"
                  ) {
                    event.preventDefault();
                  }
                }}
                onClick={() => {
                  if (suppressNextClickRef.current) {
                    suppressNextClickRef.current = false;
                    return;
                  }

                  if (selectionMode) {
                    toggleRowSelection(row);
                    return;
                  }

                  setSelected(row);
                }}
                onKeyDown={(event) => {
                  if (
                    event.key !== "Enter" &&
                    event.key !== " "
                  ) {
                    return;
                  }

                  event.preventDefault();

                  if (selectionMode) {
                    toggleRowSelection(row);
                  } else {
                    setSelected(row);
                  }
                }}
                className={`h-14 border-t border-[#11170f]/8 text-xs text-[#11170f]/62 transition-colors focus-visible:outline-none ${
                  selectionMode
                    ? selectedIds.has(row.id)
                      ? "cursor-pointer select-none bg-[#071321]/[0.10] hover:bg-[#071321]/[0.13]"
                      : row.usageStatus === "UNUSED"
                        ? "cursor-pointer select-none hover:bg-[#071321]/[0.055]"
                        : "cursor-not-allowed select-none opacity-55"
                    : "cursor-zoom-in hover:bg-[#071321]/[0.055] focus-visible:bg-[#071321]/[0.055]"
                }`}
              >
                <td
                  aria-hidden={!selectionMode}
                  className={`h-14 overflow-hidden transition-[width,padding,opacity] duration-300 ease-out ${
                    selectionMode
                      ? "w-[5%] px-4 py-0 opacity-100"
                      : "pointer-events-none w-0 px-0 py-0 opacity-0"
                  }`}
                >
                  <div
                    className={`flex h-14 items-center overflow-hidden transition-[width,opacity,transform] duration-300 ease-out ${
                      selectionMode
                        ? "w-7 translate-x-0 opacity-100"
                        : "w-0 -translate-x-3 opacity-0"
                    }`}
                  >
                    <SelectionBox
                      checked={selectedIds.has(row.id)}
                      disabled={
                        !selectionMode ||
                        row.usageStatus !== "UNUSED"
                      }
                      label={`${
                        selectedIds.has(row.id)
                          ? "Deselect"
                          : "Select"
                      } ${row.pathname}`}
                      onChange={() => toggleRowSelection(row)}
                    />
                  </div>
                </td>

                <td className="px-5 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {groupDuplicates && row.contentHash ? (
                      <span
                        className="shrink-0 rounded-full border border-[#b88a3b]/30 bg-[#b88a3b]/10 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#8b672d]"
                        title={`${
                          duplicateMetaByHash.get(row.contentHash)?.count ?? 0
                        } identical physical files · ${
                          duplicateMetaByHash.get(row.contentHash)?.redundant ??
                          0
                        } redundant · ${
                          formatBytes(
                            duplicateMetaByHash.get(row.contentHash)
                              ?.reclaimableBytes ?? 0,
                          )
                        } reclaimable`}
                      >
                        Group{" "}
                        {duplicateMetaByHash.get(row.contentHash)?.index ?? "—"}
                        {" · "}
                        {duplicateMetaByHash.get(row.contentHash)?.count ?? 0}
                        {" files · "}
                        {formatBytes(
                          duplicateMetaByHash.get(row.contentHash)
                            ?.reclaimableBytes ?? 0,
                        )}
                      </span>
                    ) : null}

                    <p
                      className="min-w-0 flex-1 truncate whitespace-nowrap font-medium text-[#11170f]"
                      title={row.pathname}
                    >
                      {compactPath(row.pathname)}
                    </p>
                  </div>
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  {formatDate(row.uploadedAt)}
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  {formatBytes(row.size)}
                </td>

                <td className="truncate whitespace-nowrap px-3 py-3">
                  {row.format || row.contentType || "Not checked"}
                  {row.width && row.height
                    ? ` · ${row.width}×${row.height}`
                    : ""}
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  {row.projectedSize === null
                    ? "—"
                    : formatBytes(row.projectedSize)}
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  {usageLabel(row)}
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${statusClasses(row)}`}
                  >
                    {statusLabel(row)}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-3 text-right">
                  {!selectionMode && row.usageStatus === "UNUSED" ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        requestDeletion(row);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      className="rounded-full border border-[#b45d52]/35 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#9a463d] transition-colors hover:bg-[#9a463d] hover:text-white"
                    >
                      Delete
                    </button>
                  ) : (
                    <span className="text-[#11170f]/20">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectionSurfaceMounted
        ? createPortal(
            <div
              aria-hidden={!selectionSurfaceVisible}
              className={`fixed bottom-6 right-6 z-[105] flex max-w-[calc(100vw-3rem)] origin-bottom-right flex-col items-end gap-2 transition-[opacity,transform] duration-300 ease-out ${
                selectionSurfaceVisible
                  ? "translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none translate-y-4 scale-[0.98] opacity-0"
              }`}
            >
              {bulkDeleteMessage ? (
                <div className="max-w-sm rounded-[18px] border border-[#11170f]/12 bg-[#f7f2e9] px-4 py-3 text-xs leading-5 text-[#11170f]/65 shadow-[0_18px_55px_rgba(7,19,33,0.18)]">
                  {bulkDeleteMessage}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-2 rounded-[22px] border border-white/25 bg-[#071321]/95 p-2.5 text-white shadow-[0_22px_65px_rgba(7,19,33,0.28)] backdrop-blur-md">
                <span className="px-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/60">
                  {selectedRows.length} selected
                  {selectedRows.length > 0
                    ? ` · ${formatBytes(selectedBytes)}`
                    : ""}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  disabled={selectedRows.length === 0 || isDeleting}
                  className={`h-10 rounded-full border border-white/20 px-4 text-[9px] font-semibold uppercase tracking-[0.12em] transition-[opacity,transform,background-color] duration-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35 ${
                    selectionSurfaceVisible
                      ? "translate-y-0 opacity-100 delay-75"
                      : "translate-y-2 opacity-0"
                  }`}
                >
                  Deselect all
                </button>

                <button
                  type="button"
                  onClick={() => setSelectionMode(false)}
                  disabled={isDeleting}
                  className={`h-10 rounded-full border border-white/20 px-4 text-[9px] font-semibold uppercase tracking-[0.12em] transition-[opacity,transform,background-color] duration-300 hover:bg-white/10 disabled:opacity-35 ${
                    selectionSurfaceVisible
                      ? "translate-y-0 opacity-100 delay-100"
                      : "translate-y-2 opacity-0"
                  }`}
                >
                  Exit selection
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBulkDeleteMessage("");
                    setBulkDeleteOpen(true);
                  }}
                  disabled={selectedRows.length === 0 || isDeleting}
                  className={`h-10 rounded-full bg-[#a84a40] px-5 text-[9px] font-bold uppercase tracking-[0.12em] transition-[opacity,transform,background-color] duration-300 hover:bg-[#913c34] disabled:cursor-not-allowed disabled:opacity-35 ${
                    selectionSurfaceVisible
                      ? "translate-y-0 opacity-100 delay-150"
                      : "translate-y-2 opacity-0"
                  }`}
                >
                  Delete selected
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}

      {bulkDeleteOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[115] flex items-center justify-center bg-[#071321]/35 p-4 backdrop-blur-[3px]"
              role="dialog"
              aria-modal="true"
              aria-label="Delete selected unused files"
              onClick={() => {
                if (!isDeleting) setBulkDeleteOpen(false);
              }}
            >
              <div
                className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-white/25 bg-[#f5f0e6] shadow-[0_30px_90px_rgba(7,19,33,0.28)]"
                onClick={(event) => event.stopPropagation()}
              >
                {isDeleting ? (
                  <div className="absolute inset-0 z-20 flex flex-col justify-center bg-[#f5f0e6] px-8 py-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
                      Deleting unused files
                    </p>

                    <p className="mt-3 font-serif text-4xl leading-none text-[#11170f]">
                      {selectedRows.length} files
                    </p>

                    <p className="mt-4 text-sm leading-6 text-[#11170f]/55">
                      Every file is being checked one last time before
                      permanent deletion.
                    </p>

                    <div className="mt-7 h-2 overflow-hidden rounded-full bg-[#11170f]/10">
                      <div
                        className="h-full rounded-full bg-[#b88a3b] transition-[width] duration-300 ease-out"
                        style={{ width: `${bulkProgress}%` }}
                      />
                    </div>

                    <p className="mt-3 text-right text-[10px] font-semibold tabular-nums text-[#11170f]/45">
                      {Math.round(bulkProgress)}%
                    </p>
                  </div>
                ) : null}
                <div className="border-b border-[#11170f]/10 px-7 py-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
                    Unused blobs
                  </p>
                  <h2 className="mt-2 font-serif text-4xl leading-none text-[#11170f]">
                    Delete selected files?
                  </h2>
                </div>

                <div className="space-y-4 px-7 py-6">
                  <p className="text-sm leading-6 text-[#11170f]/65">
                    {selectedRows.length} files ·{" "}
                    {formatBytes(selectedBytes)} will be checked
                    against every public and draft reference before
                    deletion.
                  </p>

                  {bulkDeleteMessage ? (
                    <p className="rounded-[18px] bg-[#a84a40]/10 px-4 py-3 text-sm text-[#8f3f36]">
                      {bulkDeleteMessage}
                    </p>
                  ) : null}
                </div>

                <div className="flex justify-end gap-3 border-t border-[#11170f]/10 px-7 py-5">
                  <button
                    type="button"
                    onClick={() => setBulkDeleteOpen(false)}
                    disabled={isDeleting}
                    className="h-12 rounded-full border border-[#11170f]/15 px-6 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#11170f]/55 disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={confirmBulkDeletion}
                    disabled={
                      selectedRows.length === 0 || isDeleting
                    }
                    className="h-12 rounded-full bg-[#a84a40] px-7 text-[9px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#913c34] disabled:opacity-40"
                  >
                    {isDeleting
                      ? "Deleting..."
                      : "Delete permanently"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {bulkDeleteNotice
        ? createPortal(
            <div
              role="status"
              aria-live="polite"
              className={`fixed bottom-6 right-6 z-[120] rounded-[20px] border border-white/25 bg-[#071321] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_20px_60px_rgba(7,19,33,0.28)] transition-[opacity,transform] duration-300 ease-out ${
                bulkNoticeVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-3 opacity-0"
              }`}
            >
              {bulkDeleteNotice.count}{" "}
              {bulkDeleteNotice.count === 1
                ? "file deleted"
                : "files deleted"}
            </div>,
            document.body,
          )
        : null}

      {selected
        ? createPortal(
            <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071321]/35 p-4 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${selected.pathname}`}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/25 bg-[#f5f0e6] shadow-[0_30px_90px_rgba(7,19,33,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="absolute left-4 top-4 z-10 rounded-full bg-[#f5f0e6]/90 px-3 py-2 text-[9px] font-semibold tracking-[0.12em] text-[#11170f]/55 backdrop-blur-sm">
              {selectedIndex + 1} / {sortedRows.length}
            </span>

            {sortedRows.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => navigatePreview(-1)}
                  aria-label="Previous image"
                  title="Previous image — left arrow"
                  className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#071321] text-2xl text-white shadow-[0_10px_30px_rgba(7,19,33,0.22)] transition-colors hover:bg-[#17334f]"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => navigatePreview(1)}
                  aria-label="Next image"
                  title="Next image — right arrow"
                  className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#071321] text-2xl text-white shadow-[0_10px_30px_rgba(7,19,33,0.22)] transition-colors hover:bg-[#17334f]"
                >
                  ›
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close preview"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#071321] text-xl text-white transition-colors hover:bg-[#17334f]"
            >
              ×
            </button>

            <div className="flex min-h-[280px] flex-1 items-center justify-center overflow-hidden bg-[#071321]/[0.06] p-5">
              <img
                src={selected.url}
                alt={selected.pathname}
                className="max-h-[60vh] max-w-full rounded-xl object-contain"
              />
            </div>

            <div className="border-t border-[#11170f]/10 p-5">
              <div className="grid gap-3 text-xs sm:grid-cols-4">
                <div>
                  <p className="uppercase tracking-[0.12em] text-[#11170f]/38">
                    Stored weight
                  </p>
                  <p className="mt-1 font-semibold text-[#11170f]">
                    {formatBytes(selected.size)}
                  </p>
                </div>

                <div>
                  <p className="uppercase tracking-[0.12em] text-[#11170f]/38">
                    Optimizable
                  </p>
                  <p className="mt-1 font-semibold text-[#11170f]">
                    {selected.policyCurrent &&
                    selected.status === "NEEDS_OPTIMIZATION"
                      ? "Yes"
                      : "No"}
                  </p>
                </div>

                <div>
                  <p className="uppercase tracking-[0.12em] text-[#11170f]/38">
                    Dimensions
                  </p>
                  <p className="mt-1 font-semibold text-[#11170f]">
                    {selected.width && selected.height
                      ? `${selected.width} × ${selected.height}px`
                      : "Unavailable"}
                  </p>
                </div>

                <div>
                  <p className="uppercase tracking-[0.12em] text-[#11170f]/38">
                    Status
                  </p>
                  <p className="mt-1 font-semibold text-[#11170f]">
                    {statusLabel(selected)}
                  </p>
                </div>

                <div>
                  <p className="uppercase tracking-[0.12em] text-[#11170f]/38">
                    Projected weight
                  </p>
                  <p className="mt-1 font-semibold text-[#11170f]">
                    {selected.projectedSize === null
                      ? "—"
                      : formatBytes(selected.projectedSize)}
                  </p>
                </div>

                <div>
                  <p className="uppercase tracking-[0.12em] text-[#11170f]/38">
                    Potential saving
                  </p>
                  <p className="mt-1 font-semibold text-[#11170f]">
                    {formatBytes(selected.projectedSavingBytes)}
                  </p>
                </div>

                <div>
                  <p className="uppercase tracking-[0.12em] text-[#11170f]/38">
                    Usage
                  </p>
                  <p className="mt-1 font-semibold text-[#11170f]">
                    {usageLabel(selected)}
                  </p>
                </div>

                <div>
                  <p className="uppercase tracking-[0.12em] text-[#11170f]/38">
                    Checked
                  </p>
                  <p className="mt-1 font-semibold text-[#11170f]">
                    {formatDate(selected.checkedAt)}
                  </p>
                </div>
              </div>

              <p className="mt-5 break-all border-t border-[#11170f]/10 pt-4 text-xs font-medium text-[#11170f]">
                {selected.pathname}
              </p>

              {selected.note ? (
                <p className="mt-2 text-xs leading-5 text-[#11170f]/52">
                  {selected.note}
                </p>
              ) : null}
            </div>
          </div>
            </div>,
            document.body,
          )
        : null}

      {deleteCandidate
        ? createPortal(
            <div
              className="fixed inset-0 z-[110] flex items-center justify-center bg-[#071321]/40 p-4 backdrop-blur-[4px]"
              role="dialog"
              aria-modal="true"
              aria-label={`Delete ${deleteCandidate.pathname}`}
              onClick={() => {
                if (!isDeleting) {
                  setDeleteCandidate(null);
                  setDeleteError("");
                }
              }}
            >
              <div
                data-single-delete-dialog="true"
                className="w-full max-w-xl overflow-hidden rounded-[28px] border border-white/25 bg-[#f5f0e6] shadow-[0_30px_90px_rgba(7,19,33,0.28)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between border-b border-[#11170f]/10 p-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b07f2d]">
                      Unused Blob
                    </p>
                    <h2 className="mt-2 font-serif text-3xl text-[#11170f]">
                      Delete this file?
                    </h2>
                  </div>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => {
                      setDeleteCandidate(null);
                      setDeleteError("");
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071321] text-xl text-white transition-colors hover:bg-[#17334f] disabled:opacity-45"
                    aria-label="Cancel deletion"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={deleteCandidate.url}
                      alt=""
                      className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                    />

                    <div className="min-w-0">
                      <p className="break-all text-sm font-medium leading-5 text-[#11170f]">
                        {deleteCandidate.pathname}
                      </p>
                      <p className="mt-2 text-xs text-[#11170f]/52">
                        {formatBytes(deleteCandidate.size)} will be permanently
                        removed from Vercel Blob.
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 rounded-2xl border border-[#b45d52]/20 bg-[#b45d52]/[0.06] p-4 text-xs leading-5 text-[#80443c]">
                    The server will check every database reference again before
                    deletion. If the website still uses this image, deletion
                    will be refused automatically.
                  </p>

                  {deleteError ? (
                    <p className="mt-4 rounded-2xl bg-[#b45d52]/10 p-4 text-xs text-[#8a3d2f]">
                      {deleteError}
                    </p>
                  ) : null}

                  <div className="mt-6 flex justify-end gap-3 border-t border-[#11170f]/10 pt-5">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => {
                        setDeleteCandidate(null);
                        setDeleteError("");
                      }}
                      className="h-12 rounded-full border border-[#11170f]/12 px-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#11170f]/55 transition-colors hover:bg-[#11170f]/[0.06] disabled:opacity-45"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={confirmDeletion}
                      className="h-12 rounded-full bg-[#9a463d] px-7 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#7d352e] disabled:cursor-wait disabled:opacity-55"
                    >
                      {isDeleting ? "Checking references…" : "Delete permanently"}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {deleteFailureNotice
        ? createPortal(
            <div
              className="fixed bottom-6 right-6 z-[130] w-[min(390px,calc(100vw-3rem))] rounded-[20px] border border-[#b14c42]/35 bg-[#fff4ef] p-5 text-[#6f332d] shadow-[0_20px_60px_rgba(77,36,30,0.24)]"
              role="alert"
              aria-live="assertive"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9b443a]">
                File deletion failed
              </p>
              <p className="mt-2 text-sm font-medium leading-6">
                The file could not be deleted. Please contact Nolhan.
              </p>
            </div>,
            document.body,
          )
        : null}

      {deleteNotice
        ? createPortal(
            <div
              className="fixed bottom-6 right-6 z-[120] w-[min(390px,calc(100vw-3rem))] rounded-[20px] border border-[#b88a3b]/35 bg-[#f1e3c7] p-5 text-[#6f511f]"
              role="status"
              aria-live="polite"
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em]">
                Unused file deleted
              </p>
              <p
                className="mt-2 truncate text-xs font-medium"
                title={deleteNotice.pathname}
              >
                {deleteNotice.pathname}
              </p>
              <p className="mt-1 text-xs text-[#6f511f]/65">
                {formatBytes(deleteNotice.freedBytes)} freed
              </p>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
