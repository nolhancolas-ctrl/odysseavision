"use client";

import { useMemo, useState } from "react";
import type { FormsContactInfo, FormsSettings } from "@/lib/content/forms";

type FormsSettingsEditorProps = {
  settings: FormsSettings;
  updateAction: (formData: FormData) => Promise<void>;
  resetAction: (formData: FormData) => Promise<void>;
};

function reorder<T extends { order: number }>(items: T[]) {
  return items.map((item, index) => ({ ...item, order: index }));
}

function Field({
  label,
  children,
  help,
}: {
  label: string;
  children: React.ReactNode;
  help?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40">
        {label}
      </label>
      {children}
      {help ? <p className="mt-2 text-xs text-[#242617]/40">{help}</p> : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-none rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm leading-6 text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
    />
  );
}

function Category({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
      <div className="border-b border-[#242617]/10 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-3xl uppercase leading-none text-[#242617]">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#242617]/55">
          {description}
        </p>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function ContactInfoRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: FormsContactInfo;
  index: number;
  onChange: (item: FormsContactInfo) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-4 rounded-[1.5rem] border border-[#242617]/10 bg-[#f4efe4]/55 p-4 lg:grid-cols-[1fr_1.2fr_1.4fr_120px_90px] lg:items-center">
      <TextInput
        value={item.title}
        onChange={(value) => onChange({ ...item, title: value })}
        placeholder="Email"
      />
      <TextInput
        value={item.value}
        onChange={(value) => onChange({ ...item, value })}
        placeholder="odysseavision@gmail.com"
      />
      <TextInput
        value={item.href}
        onChange={(value) => onChange({ ...item, href: value })}
        placeholder="mailto:..."
      />

      <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-white/35 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#242617]/55">
        <input
          type="checkbox"
          checked={item.visible}
          onChange={(event) =>
            onChange({ ...item, visible: event.target.checked })
          }
          className="h-4 w-4 accent-[#b88a3b]"
        />
        Visible
      </label>

      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer rounded-full border border-red-900/20 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]"
      >
        Remove
      </button>

      <input type="hidden" value={index} readOnly />
    </div>
  );
}

export function FormsSettingsEditor({
  settings,
  updateAction,
  resetAction,
}: FormsSettingsEditorProps) {
  const [recipientEmail, setRecipientEmail] = useState(settings.recipientEmail);
  const [notificationSubject, setNotificationSubject] = useState(
    settings.notificationSubject,
  );
  const [successMessage, setSuccessMessage] = useState(settings.successMessage);
  const [responseTimeMessage, setResponseTimeMessage] = useState(
    settings.responseTimeMessage,
  );
  const [newsletterEnabled, setNewsletterEnabled] = useState(
    settings.newsletterEnabled,
  );
  const [newsletterLabel, setNewsletterLabel] = useState(settings.newsletterLabel);
  const [newsletterSource, setNewsletterSource] = useState(
    settings.newsletterSource,
  );
  const [projectTypesText, setProjectTypesText] = useState(
    settings.projectTypes.join("\n"),
  );
  const [contactInfo, setContactInfo] = useState(settings.contactInfo);
  const [availabilityText, setAvailabilityText] = useState(
    settings.availabilityText,
  );
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(
    settings.autoReplyEnabled,
  );
  const [autoReplySubject, setAutoReplySubject] = useState(
    settings.autoReplySubject,
  );
  const [autoReplyBody, setAutoReplyBody] = useState(settings.autoReplyBody);

  const payload = useMemo(
    () =>
      JSON.stringify({
        recipientEmail,
        notificationSubject,
        successMessage,
        responseTimeMessage,
        newsletterEnabled,
        newsletterLabel,
        newsletterSource,
        projectTypes: projectTypesText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        contactInfo: reorder(contactInfo),
        availabilityText,
        autoReplyEnabled,
        autoReplySubject,
        autoReplyBody,
      }),
    [
      recipientEmail,
      notificationSubject,
      successMessage,
      responseTimeMessage,
      newsletterEnabled,
      newsletterLabel,
      newsletterSource,
      projectTypesText,
      contactInfo,
      availabilityText,
      autoReplyEnabled,
      autoReplySubject,
      autoReplyBody,
    ],
  );

  return (
    <form action={updateAction} className="space-y-8">
      <input type="hidden" name="formsSettings" value={payload} />

      <Category
        eyebrow="Email"
        title="Notifications"
        description="Configure how contact enquiries should be labelled and who should receive them."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Recipient email">
            <TextInput
              value={recipientEmail}
              onChange={setRecipientEmail}
              placeholder="odysseavision@gmail.com"
            />
          </Field>

          <Field label="Notification subject">
            <TextInput
              value={notificationSubject}
              onChange={setNotificationSubject}
            />
          </Field>

          <Field label="Success message">
            <TextInput value={successMessage} onChange={setSuccessMessage} />
          </Field>

          <Field label="Response time message">
            <TextInput
              value={responseTimeMessage}
              onChange={setResponseTimeMessage}
            />
          </Field>
        </div>
      </Category>

      <Category
        eyebrow="Contact form"
        title="Project types"
        description="One project type per line. These values appear in the public contact dropdown."
      >
        <Field label="Project types">
          <TextArea
            value={projectTypesText}
            onChange={setProjectTypesText}
            rows={8}
          />
        </Field>
      </Category>

      <Category
        eyebrow="Contact panel"
        title="Displayed contact information"
        description="Edit the contact information shown in the dark panel on the contact page."
      >
        <div className="grid gap-4">
          {contactInfo.map((item, index) => (
            <ContactInfoRow
              key={item.id}
              item={item}
              index={index}
              onChange={(nextItem) =>
                setContactInfo((current) =>
                  current.map((contact, currentIndex) =>
                    currentIndex === index ? nextItem : contact,
                  ),
                )
              }
              onRemove={() =>
                setContactInfo((current) =>
                  reorder(
                    current.filter((_, currentIndex) => currentIndex !== index),
                  ),
                )
              }
            />
          ))}

          <button
            type="button"
            onClick={() =>
              setContactInfo((current) => [
                ...current,
                {
                  id: `contact-${Date.now()}`,
                  title: "New item",
                  value: "",
                  href: "",
                  visible: true,
                  order: current.length,
                },
              ])
            }
            className="w-fit cursor-pointer rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/55 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
          >
            Add contact info
          </button>

          <Field label="Availability text">
            <TextInput
              value={availabilityText}
              onChange={setAvailabilityText}
            />
          </Field>
        </div>
      </Category>

      <Category
        eyebrow="Newsletter"
        title="Newsletter consent"
        description="Configure the opt-in checkbox and subscriber source."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/65 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#242617]/55">
            <input
              type="checkbox"
              checked={newsletterEnabled}
              onChange={(event) => setNewsletterEnabled(event.target.checked)}
              className="h-4 w-4 accent-[#b88a3b]"
            />
            Enable newsletter opt-in
          </label>

          <Field label="Subscriber source">
            <TextInput
              value={newsletterSource}
              onChange={setNewsletterSource}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Newsletter checkbox label">
              <TextInput
                value={newsletterLabel}
                onChange={setNewsletterLabel}
              />
            </Field>
          </div>
        </div>
      </Category>

      <Category
        eyebrow="Automation"
        title="Auto reply draft"
        description="Configure the automatic email sent to the client after a contact form submission."
      >
        <div className="grid gap-5">
          <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/65 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#242617]/55">
            <input
              type="checkbox"
              checked={autoReplyEnabled}
              onChange={(event) => setAutoReplyEnabled(event.target.checked)}
              className="h-4 w-4 accent-[#b88a3b]"
            />
            Send auto-reply to client
          </label>

          <Field label="Auto-reply subject">
            <TextInput
              value={autoReplySubject}
              onChange={setAutoReplySubject}
            />
          </Field>

          <Field label="Auto-reply body">
            <TextArea
              value={autoReplyBody}
              onChange={setAutoReplyBody}
              rows={8}
            />
          </Field>
        </div>
      </Category>

      <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-[2rem] border border-[#242617]/10 bg-[#f4efe4]/90 p-4 shadow-[0_20px_60px_rgba(20,20,10,0.16)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#242617]/55">
          Save to update the public contact form and admin email settings.
        </p>

        <div className="flex gap-3">
          <button
            type="submit"
            formAction={resetAction}
            className="cursor-pointer rounded-full border border-red-900/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-red-900/60 transition hover:border-red-800 hover:bg-red-800 hover:text-[#f4efe4]"
          >
            Reset
          </button>

          <button
            type="submit"
            className="cursor-pointer rounded-full bg-[#071321] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#142844]"
          >
            Save forms
          </button>
        </div>
      </div>
    </form>
  );
}
