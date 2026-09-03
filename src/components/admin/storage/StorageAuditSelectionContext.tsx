"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type StorageAuditSelectionValue = {
  selectionMode: boolean;
  setSelectionMode: (active: boolean) => void;
  toggleSelectionMode: () => void;
};

const StorageAuditSelectionContext =
  createContext<StorageAuditSelectionValue | null>(
    null,
  );

export function StorageAuditSelectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectionMode, setSelectionMode] =
    useState(false);

  return (
    <StorageAuditSelectionContext.Provider
      value={{
        selectionMode,
        setSelectionMode,
        toggleSelectionMode: () =>
          setSelectionMode((current) => !current),
      }}
    >
      {children}
    </StorageAuditSelectionContext.Provider>
  );
}

export function useStorageAuditSelection() {
  const value = useContext(
    StorageAuditSelectionContext,
  );

  if (!value) {
    throw new Error(
      "Storage audit selection must be used inside its provider.",
    );
  }

  return value;
}
