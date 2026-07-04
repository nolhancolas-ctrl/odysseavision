"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { AppearanceSettings } from "@/lib/content/appearance";

type SplashScreenClientProps = {
  settings: AppearanceSettings;
};

export function SplashScreenClient({ settings }: SplashScreenClientProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const previousPathname = useRef(pathname);
  const initialRenderDone = useRef(false);

  const splashImages = useMemo(
    () =>
      [settings.splashOuterLogoSrc, settings.splashInnerLogoSrc].filter(
        Boolean,
      ),
    [settings.splashOuterLogoSrc, settings.splashInnerLogoSrc],
  );

  const [assetsReady, setAssetsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!settings.splashEnabled || isAdminRoute) return;

    let cancelled = false;

    const preloadImage = async (src: string) => {
      const image = new window.Image();
      image.src = src;

      try {
        await image.decode();
      } catch {
        await new Promise<void>((resolve) => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });
      }
    };

    Promise.all(splashImages.map(preloadImage)).then(() => {
      if (!cancelled) {
        window.setTimeout(() => setAssetsReady(true), 120);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAdminRoute, settings.splashEnabled, splashImages]);

  useEffect(() => {
    if (!settings.splashEnabled || isAdminRoute) return;
    if (!assetsReady) return;

    const timer = window.setTimeout(() => {
      setIsVisible(false);
      initialRenderDone.current = true;
    }, settings.splashInitialDuration);

    return () => window.clearTimeout(timer);
  }, [
    assetsReady,
    isAdminRoute,
    settings.splashEnabled,
    settings.splashInitialDuration,
  ]);

  useEffect(() => {
    if (!settings.splashEnabled || isAdminRoute) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");
      const targetAttr = link.getAttribute("target");

      if (!href || targetAttr === "_blank") return;
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      const url = new URL(href, window.location.origin);

      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
        return;
      }

      setIsVisible(true);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isAdminRoute, settings.splashEnabled]);

  useEffect(() => {
    if (!settings.splashEnabled) return;

    if (isAdminRoute) {
      previousPathname.current = pathname;
      initialRenderDone.current = true;
      setIsVisible(false);
      return;
    }

    if (!initialRenderDone.current) {
      previousPathname.current = pathname;
      return;
    }

    if (previousPathname.current === pathname) return;

    previousPathname.current = pathname;
    setIsVisible(true);

    const timer = window.setTimeout(() => {
      setIsVisible(false);
    }, settings.splashRouteDuration);

    return () => window.clearTimeout(timer);
  }, [
    pathname,
    isAdminRoute,
    settings.splashEnabled,
    settings.splashRouteDuration,
  ]);

  if (!settings.splashEnabled || isAdminRoute) {
    return null;
  }

  return (
    <div
      aria-hidden={!isVisible}
      className={`fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-700 ease-out ${
        isVisible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      style={{ backgroundColor: settings.splashBackgroundColor }}
    >
      <div className="ov-splash-grain absolute inset-0 opacity-[0.04]" />

      <div
        className={`absolute left-1/2 top-1/2 h-[245px] w-[245px] -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out md:h-[330px] md:w-[330px] ${
          isVisible && assetsReady
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0"
        }`}
      >
        {settings.splashOuterLogoSrc ? (
          <div
            className={`ov-splash-layer ov-splash-layer-outer ${
              assetsReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="ov-splash-spin-outer">
              <img
                src={settings.splashOuterLogoSrc}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            </div>
          </div>
        ) : null}

        {settings.splashInnerLogoSrc ? (
          <div
            className={`ov-splash-layer ov-splash-layer-inner ${
              assetsReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="ov-splash-spin-inner">
              <img
                src={settings.splashInnerLogoSrc}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            </div>
          </div>
        ) : null}
      </div>

      <p
        className={`absolute bottom-9 left-1/2 -translate-x-1/2 font-serif text-[26px] uppercase tracking-[0.42em] opacity-45 transition-all duration-700 ease-out lg:text-[32px] ${
          isVisible && assetsReady
            ? "translate-y-0 opacity-45"
            : "translate-y-2 opacity-0"
        }`}
        style={{ color: settings.splashTextColor }}
      >
        {settings.splashText}
      </p>

      <style jsx global>{`
        .ov-splash-layer {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate3d(-50%, -50%, 0);
          transform-origin: 50% 50%;
          pointer-events: none;
          user-select: none;
          transition: opacity 500ms ease-out;
          will-change: opacity;
        }

        .ov-splash-layer-outer {
          width: 100%;
          height: 100%;
        }

        .ov-splash-layer-inner {
          width: 58%;
          height: 58%;
        }

        .ov-splash-spin-outer,
        .ov-splash-spin-inner {
          width: 100%;
          height: 100%;
          transform-origin: 50% 50%;
          will-change: transform, opacity;
        }

        .ov-splash-spin-outer {
          animation: ov-splash-spin-outer 7.4s linear infinite;
        }

        .ov-splash-spin-inner {
          animation:
            ov-splash-spin-inner 4.85s linear infinite,
            ov-splash-inner-fade 1.8s ease-in-out infinite alternate;
        }

        .ov-splash-spin-outer img,
        .ov-splash-spin-inner img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
        }

        .ov-splash-grain {
          background-image:
            radial-gradient(
              circle at 20% 30%,
              rgba(11, 37, 95, 0.22) 0 1px,
              transparent 1px
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(36, 38, 23, 0.18) 0 1px,
              transparent 1px
            );
          background-size:
            18px 18px,
            24px 24px;
        }

        @keyframes ov-splash-spin-outer {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes ov-splash-spin-inner {
          from {
            transform: rotate(17deg);
          }

          to {
            transform: rotate(-377deg);
          }
        }

        @keyframes ov-splash-inner-fade {
          from {
            opacity: 0.88;
          }

          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ov-splash-spin-outer,
          .ov-splash-spin-inner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
