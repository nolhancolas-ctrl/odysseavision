"use client";

import { useEffect } from "react";

async function tryAdminLogin(password: string) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    return "";
  }

  const result = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    redirect?: string;
    redirectTo?: string;
  };

  if (!result.ok) {
    return "";
  }

  return result.redirect || result.redirectTo || "/admin";
}

function findPasswordInput(root: ParentNode = document) {
  return root.querySelector<HTMLInputElement>(
    'input[type="password"], input[name*="password" i], input[name*="access" i], input[name*="code" i], input[autocomplete="current-password"]',
  );
}

function findNearbyPasswordInput(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return findPasswordInput();
  }

  const form = target.closest("form");

  if (form) {
    return findPasswordInput(form);
  }

  const section =
    target.closest("section") ||
    target.closest("main") ||
    target.closest("div") ||
    document;

  return findPasswordInput(section);
}

function isUsefulAccessTrigger(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const button = target.closest("button, a, [role='button']");

  if (!button) {
    return false;
  }

  const text = button.textContent?.toLowerCase() || "";
  const aria = button.getAttribute("aria-label")?.toLowerCase() || "";

  return (
    text.includes("access") ||
    text.includes("gallery") ||
    text.includes("enter") ||
    text.includes("open") ||
    text.includes("unlock") ||
    aria.includes("access") ||
    aria.includes("gallery") ||
    aria.includes("enter") ||
    aria.includes("open") ||
    aria.includes("unlock")
  );
}

async function handlePossibleAdminAccess(
  passwordInput: HTMLInputElement | null,
) {
  const password = passwordInput?.value?.trim();

  if (!password) {
    return "";
  }

  return tryAdminLogin(password);
}

export function SecretAccessWatcher() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) {
      return;
    }

    const onSubmit = async (event: SubmitEvent) => {
      const form = event.target;

      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      if (form.dataset.adminSecretChecked === "true") {
        delete form.dataset.adminSecretChecked;
        return;
      }

      const passwordInput = findPasswordInput(form);

      if (!passwordInput?.value?.trim()) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const redirectTo = await handlePossibleAdminAccess(passwordInput).catch(
        () => "",
      );

      if (redirectTo) {
        window.location.assign(redirectTo);
        return;
      }

      form.dataset.adminSecretChecked = "true";

      const submitter =
        event.submitter instanceof HTMLElement ? event.submitter : undefined;

      if (typeof form.requestSubmit === "function") {
        form.requestSubmit(submitter);
        return;
      }

      form.submit();
    };

    const onClick = async (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const trigger = target.closest<HTMLElement>("button, a, [role='button']");

      if (!trigger || trigger.dataset.adminSecretChecked === "true") {
        if (trigger) {
          delete trigger.dataset.adminSecretChecked;
        }

        return;
      }

      if (!isUsefulAccessTrigger(target)) {
        return;
      }

      const passwordInput = findNearbyPasswordInput(target);

      if (!passwordInput?.value?.trim()) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const redirectTo = await handlePossibleAdminAccess(passwordInput).catch(
        () => "",
      );

      if (redirectTo) {
        window.location.assign(redirectTo);
        return;
      }

      trigger.dataset.adminSecretChecked = "true";
      trigger.click();
    };

    const onKeyDown = async (event: KeyboardEvent) => {
      if (event.key !== "Enter") {
        return;
      }

      const target = event.target;

      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      if (
        target.type !== "password" &&
        !target.name.toLowerCase().includes("password") &&
        !target.name.toLowerCase().includes("access") &&
        !target.name.toLowerCase().includes("code")
      ) {
        return;
      }

      const password = target.value.trim();

      if (!password) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const redirectTo = await tryAdminLogin(password).catch(() => "");

      if (redirectTo) {
        window.location.assign(redirectTo);
        return;
      }

      const form = target.closest("form");

      if (form) {
        form.dataset.adminSecretChecked = "true";
        form.requestSubmit();
      }
    };

    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return null;
}
