"use client";

import { useEffect } from "react";

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

      const passwordInput = form.querySelector<HTMLInputElement>(
        'input[type="password"], input[name*="password" i], input[name*="access" i]'
      );

      const password = passwordInput?.value?.trim();

      if (!password) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const submitter =
        event.submitter instanceof HTMLElement ? event.submitter : undefined;

      try {
        const response = await fetch("/api/admin/secret-access", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        });

        const result = (await response.json()) as {
          ok?: boolean;
          redirectTo?: string;
        };

        if (result.ok) {
          window.location.href = result.redirectTo || "/admin";
          return;
        }
      } catch {
        // Let the original form continue if the private check fails.
      }

      form.dataset.adminSecretChecked = "true";

      if (typeof form.requestSubmit === "function") {
        form.requestSubmit(submitter);
        return;
      }

      form.submit();
    };

    document.addEventListener("submit", onSubmit, true);

    return () => {
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return null;
}
