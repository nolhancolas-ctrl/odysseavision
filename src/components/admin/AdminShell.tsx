"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { adminAsset } from "@/data/adminAssets";
import {
  adminPrimaryNavigation,
  adminSiteNavigation,
  type AdminNavItem,
} from "@/data/admin";

function AdminIcon({
  src,
  fallback,
  className = "h-4 w-4",
}: {
  src?: string;
  fallback: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={`${className} object-contain`}
      />
    );
  }

  return <span aria-hidden="true">{fallback}</span>;
}

function AdminNavLink({
  item,
  pathname,
  onClick,
}: {
  item: AdminNavItem;
  pathname: string;
  onClick?: () => void;
}) {
  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
        isActive
          ? "border-[#b88a3b]/60 bg-[#f4efe4]/10 text-[#f4efe4]"
          : "border-transparent text-[#f4efe4]/72 hover:border-[#f4efe4]/10 hover:bg-[#f4efe4]/5 hover:text-[#f4efe4]"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
          isActive
            ? "border-[#b88a3b]/50 bg-[#b88a3b]/15"
            : "border-[#f4efe4]/10 group-hover:border-[#d5ad68]/40"
        }`}
      >
        <AdminIcon
          src={item.iconSrc}
          fallback={item.icon}
          className={`h-[18px] w-[18px] ${
            isActive
              ? "opacity-100 brightness-0 invert sepia saturate-[850%] hue-rotate-[352deg]"
              : "opacity-70 brightness-0 invert sepia saturate-[320%] hue-rotate-[350deg]"
          }`}
        />
      </span>

      <span>{item.label}</span>
    </Link>
  );
}

function AdminNavGroup({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: AdminNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#d5ad68]">
        {title}
      </p>

      <div className="space-y-1.5">
        {items.map((item) => (
          <AdminNavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onClick={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

function AdminSidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link href="/admin" onClick={onNavigate} className="mb-10 flex items-center gap-4">
        <span className="flex h-20 w-20 items-center justify-center overflow-visible">
          {(adminAsset.odyssea_logo || adminAsset.logo) ? (
            <img
              src={adminAsset.odyssea_logo || adminAsset.logo}
              alt="Odyssea Vision"
              className="h-full w-full object-contain brightness-0 invert sepia saturate-[850%] hue-rotate-[352deg] opacity-95"
            />
          ) : (
            <span className="font-serif text-sm text-[#d5ad68]">OV</span>
          )}
        </span>

        <span className="font-serif text-2xl uppercase leading-none tracking-[0.12em] text-[#d5ad68]">
          Odyssea
          <br />
          <span className="text-base tracking-[0.35em]">Vision</span>
        </span>
      </Link>

      <nav className="space-y-9">
        <AdminNavGroup
          title="Create & manage"
          items={adminPrimaryNavigation}
          pathname={pathname}
          onNavigate={onNavigate}
        />

        <AdminNavGroup
          title="Website & design"
          items={adminSiteNavigation}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="mt-10 rounded-3xl border border-[#d5ad68]/35 bg-[#f4efe4]/5 p-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#d5ad68]">
          Secret access
        </p>
        <p className="mt-2 text-sm leading-6 text-[#f4efe4]/68">
          Later, a special password typed into the client album access field will
          unlock this private admin space.
        </p>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4efe4] text-[#11170f]">
      {adminAsset.stamp_corner ? (
        <img
          src={adminAsset.stamp_corner}
          alt=""
          aria-hidden="true"
          className="pointer-events-none fixed bottom-0 right-0 z-[1] hidden w-[360px] max-w-[32vw] opacity-20 mix-blend-multiply lg:block"
        />
      ) : null}

      <button
        type="button"
        aria-label={mobileSidebarOpen ? "Close admin menu" : "Open admin menu"}
        onClick={() => setMobileSidebarOpen((isOpen) => !isOpen)}
        className="fixed left-4 top-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-[#d5ad68]/35 bg-[#071321] text-[#f4efe4] shadow-2xl transition hover:bg-[#142844] lg:hidden"
      >
        <span className="relative block h-4 w-5">
          <span
            className={`absolute left-0 top-0 h-px w-5 bg-current transition ${
              mobileSidebarOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-2 h-px w-5 bg-current transition ${
              mobileSidebarOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 top-4 h-px w-5 bg-current transition ${
              mobileSidebarOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      <div
        className={`fixed inset-0 z-[55] bg-[#071321]/45 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          mobileSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-[300px] overflow-y-auto border-r border-[#f4efe4]/10 bg-[#071321] px-5 py-7 text-[#f4efe4] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebarContent
          pathname={pathname}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
      </aside>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] overflow-y-auto border-r border-[#f4efe4]/10 bg-[#071321] px-5 py-7 text-[#f4efe4] lg:block">
        <AdminSidebarContent pathname={pathname} />
      </aside>

      <div className="relative z-10 lg:pl-[280px]">
        <header className="sticky top-0 z-20 border-b border-[#11170f]/10 bg-[#f4efe4]/88 px-5 py-4 pl-20 backdrop-blur-md md:px-8 md:pl-20 lg:px-10">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#11170f]/45">
                Odyssea Vision Admin
              </p>
              <p className="mt-1 hidden font-serif text-2xl text-[#11170f] sm:block">
                Content, clients & website
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 rounded-full border border-[#11170f]/15 bg-white/35 px-5 py-3 text-xs uppercase tracking-[0.16em] text-[#11170f]/70 transition hover:bg-[#071321] hover:text-[#f4efe4]"
              >
                <AdminIcon
                  src={adminAsset.eye}
                  fallback="◉"
                  className="h-4 w-4 opacity-80 transition group-hover:brightness-0 group-hover:invert"
                />
                <span>View public site</span>
              </Link>

              <Link
                href="/admin/settings"
                className="hidden rounded-full bg-[#071321] px-5 py-3 text-xs uppercase tracking-[0.16em] text-[#f4efe4] transition hover:bg-[#142844] md:block"
              >
                Settings
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
