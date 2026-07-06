import { db } from "@/lib/db";

type RawRow = Record<string, unknown>;

type TableMeta = {
  table: string;
  columns: string[];
  lowerColumns: Set<string>;
};

export type ChartPoint = {
  label: string;
  value: number;
  title: string;
};

export type ViewInsightData = {
  available: boolean;
  total: number;
  today: number;
  series: ChartPoint[];
  topPaths: {
    path: string;
    count: number;
  }[];
  recentViews: {
    path: string;
    referrer: string;
    userAgent: string;
    date: string;
  }[];
};

export type SubscriberInsightData = {
  available: boolean;
  total: number;
  last7Days: number;
  series: ChartPoint[];
  statusCounts: {
    label: string;
    value: number;
  }[];
  recentSubscribers: {
    id: string;
    name: string;
    email: string;
    status: string;
    source: string;
    date: string;
  }[];
};

export type MessageCenterData = {
  available: boolean;
  total: number;
  newCount: number;
  thisWeek: number;
  messages: {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    phone: string;
    date: string;
  }[];
};

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function quoteIdentifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function toText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toDate(value: unknown) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(value: unknown) {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

function formatShortDate(value: unknown) {
  const date = toDate(value);
  return date ? shortDateFormatter.format(date) : "—";
}

function formatFullDate(value: unknown) {
  const date = toDate(value);
  return date ? fullDateFormatter.format(date) : "—";
}

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

async function getTableNames() {
  const rows = await db.$queryRawUnsafe<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
  );

  return rows
    .map((row) => row.name)
    .filter((name) => !name.startsWith("_") && name !== "sqlite_sequence");
}

async function getColumns(table: string) {
  const rows = await db.$queryRawUnsafe<{ name: string }[]>(
    `PRAGMA table_info(${quoteIdentifier(table)})`
  );

  return rows.map((row) => row.name);
}

async function getTableMetas(): Promise<TableMeta[]> {
  const tables = await getTableNames();

  const metas = await Promise.all(
    tables.map(async (table) => {
      const columns = await getColumns(table);

      return {
        table,
        columns,
        lowerColumns: new Set(columns.map((column) => column.toLowerCase())),
      };
    })
  );

  return metas;
}

function pickColumn(meta: TableMeta, candidates: string[]) {
  const lowerMap = new Map(
    meta.columns.map((column) => [column.toLowerCase(), column])
  );

  for (const candidate of candidates) {
    const column = lowerMap.get(candidate.toLowerCase());

    if (column) {
      return column;
    }
  }

  return undefined;
}

function hasAnyColumn(meta: TableMeta, candidates: string[]) {
  return candidates.some((candidate) =>
    meta.lowerColumns.has(candidate.toLowerCase())
  );
}

function findTableByExactName(metas: TableMeta[], candidates: string[]) {
  const lowerMap = new Map(
    metas.map((meta) => [meta.table.toLowerCase(), meta])
  );

  for (const candidate of candidates) {
    const table = lowerMap.get(candidate.toLowerCase());

    if (table) {
      return table;
    }
  }

  return undefined;
}

async function getRows(table: string, orderBy?: string, limit = 2000) {
  const orderClause = orderBy ? ` ORDER BY ${quoteIdentifier(orderBy)} DESC` : "";

  return db.$queryRawUnsafe<RawRow[]>(
    `SELECT * FROM ${quoteIdentifier(table)}${orderClause} LIMIT ${limit}`
  );
}

function groupRowsByDay(rows: RawRow[], dateColumn?: string, limit = 30) {
  if (!dateColumn) {
    return [];
  }

  const groups = new Map<string, number>();

  for (const row of rows) {
    const key = dateKey(row[dateColumn]);

    if (!key) {
      continue;
    }

    groups.set(key, (groups.get(key) ?? 0) + 1);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-limit)
    .map(([key, value]) => ({
      label: formatShortDate(key),
      title: key,
      value,
    }));
}

function detectPageViewTable(metas: TableMeta[]) {
  return (
    findTableByExactName(metas, ["PageView", "page_views", "PageViews"]) ??
    metas.find((meta) => meta.table.toLowerCase().includes("pageview"))
  );
}

function detectSubscriberTable(metas: TableMeta[]) {
  const exact = findTableByExactName(metas, [
    "NewsletterSubscriber",
    "Subscriber",
    "NewsletterSubscription",
    "NewsletterContact",
  ]);

  if (exact) {
    return exact;
  }

  return metas.find((meta) => {
    const table = meta.table.toLowerCase();

    return (
      hasAnyColumn(meta, ["email"]) &&
      !hasAnyColumn(meta, ["message", "body", "content"]) &&
      (table.includes("subscriber") ||
        table.includes("newsletter") ||
        table.includes("subscription"))
    );
  });
}

function detectMessageTable(metas: TableMeta[]) {
  const exact = findTableByExactName(metas, [
    "ContactMessage",
    "ContactSubmission",
    "FormSubmission",
    "Message",
    "Inquiry",
  ]);

  if (exact) {
    return exact;
  }

  return metas.find((meta) => {
    const table = meta.table.toLowerCase();

    return (
      hasAnyColumn(meta, ["email", "fromEmail"]) &&
      hasAnyColumn(meta, ["message", "body", "content"]) &&
      (table.includes("contact") ||
        table.includes("message") ||
        table.includes("inquiry") ||
        table.includes("form"))
    );
  });
}

export async function getViewInsightData(): Promise<ViewInsightData> {
  const metas = await getTableMetas();
  const table = detectPageViewTable(metas);

  if (!table) {
    return {
      available: false,
      total: 0,
      today: 0,
      series: [],
      topPaths: [],
      recentViews: [],
    };
  }

  const dateColumn = pickColumn(table, ["createdAt", "date", "timestamp"]);
  const pathColumn = pickColumn(table, ["path", "pathname", "url"]) ?? "path";
  const referrerColumn = pickColumn(table, ["referrer", "referer"]);
  const userAgentColumn = pickColumn(table, ["userAgent", "agent"]);
  const rows = await getRows(table.table, dateColumn, 3000);
  const todayKey = new Date().toISOString().slice(0, 10);

  const pathCounts = new Map<string, number>();

  for (const row of rows) {
    const path = toText(row[pathColumn]) || "/";
    pathCounts.set(path, (pathCounts.get(path) ?? 0) + 1);
  }

  return {
    available: true,
    total: rows.length,
    today: dateColumn
      ? rows.filter((row) => dateKey(row[dateColumn]) === todayKey).length
      : 0,
    series: groupRowsByDay(rows, dateColumn, 30),
    topPaths: Array.from(pathCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({ path, count })),
    recentViews: rows.slice(0, 20).map((row) => ({
      path: toText(row[pathColumn]) || "/",
      referrer: referrerColumn ? toText(row[referrerColumn]) || "Direct" : "Direct",
      userAgent: userAgentColumn ? toText(row[userAgentColumn]) : "",
      date: dateColumn ? formatFullDate(row[dateColumn]) : "—",
    })),
  };
}

function subscriberName(row: RawRow) {
  const fullName = toText(row.name) || toText(row.fullName);

  if (fullName) {
    return fullName;
  }

  const first = toText(row.firstName);
  const last = toText(row.lastName);

  return `${first} ${last}`.trim() || "Subscriber";
}

function subscriberStatus(row: RawRow, statusColumn?: string) {
  if (statusColumn && toText(row[statusColumn])) {
    return titleCase(toText(row[statusColumn]));
  }

  if (toText(row.unsubscribedAt)) {
    return "Unsubscribed";
  }

  const active = row.active ?? row.isActive ?? row.subscribed;

  if (active === false || active === 0 || active === "false") {
    return "Paused";
  }

  return "Active";
}

export async function getSubscriberInsightData(): Promise<SubscriberInsightData> {
  const metas = await getTableMetas();
  const table = detectSubscriberTable(metas);

  if (!table) {
    return {
      available: false,
      total: 0,
      last7Days: 0,
      series: [],
      statusCounts: [],
      recentSubscribers: [],
    };
  }

  const dateColumn = pickColumn(table, [
    "createdAt",
    "subscribedAt",
    "joinedAt",
    "date",
    "updatedAt",
  ]);
  const statusColumn = pickColumn(table, ["status", "state"]);
  const sourceColumn = pickColumn(table, ["source", "form", "origin"]);
  const emailColumn = pickColumn(table, ["email"]) ?? "email";
  const rows = await getRows(table.table, dateColumn, 3000);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const statusCounts = new Map<string, number>();

  for (const row of rows) {
    const status = subscriberStatus(row, statusColumn);
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  return {
    available: true,
    total: rows.length,
    last7Days: dateColumn
      ? rows.filter((row) => {
          const date = toDate(row[dateColumn]);
          return date ? date.getTime() >= sevenDaysAgo : false;
        }).length
      : 0,
    series: groupRowsByDay(rows, dateColumn, 30),
    statusCounts: Array.from(statusCounts.entries()).map(([label, value]) => ({
      label,
      value,
    })),
    recentSubscribers: rows.slice(0, 80).map((row, index) => ({
      id: toText(row.id) || `${index}`,
      name: subscriberName(row),
      email: toText(row[emailColumn]) || "No email",
      status: subscriberStatus(row, statusColumn),
      source: sourceColumn ? toText(row[sourceColumn]) || "Website" : "Website",
      date: dateColumn ? formatFullDate(row[dateColumn]) : "—",
    })),
  };
}

function messageStatus(row: RawRow, statusColumn?: string) {
  if (statusColumn && toText(row[statusColumn])) {
    return titleCase(toText(row[statusColumn]));
  }

  if (toText(row.archivedAt)) {
    return "Archived";
  }

  const isRead = row.isRead ?? row.read;

  if (toText(row.readAt) || isRead === true || isRead === 1 || isRead === "true") {
    return "Read";
  }

  return "New";
}

export async function getMessageCenterData(): Promise<MessageCenterData> {
  const metas = await getTableMetas();
  const table = detectMessageTable(metas);

  if (!table) {
    return {
      available: false,
      total: 0,
      newCount: 0,
      thisWeek: 0,
      messages: [],
    };
  }

  const dateColumn = pickColumn(table, ["createdAt", "sentAt", "date", "updatedAt"]);
  const statusColumn = pickColumn(table, ["status", "state"]);
  const nameColumn = pickColumn(table, ["name", "fullName", "firstName"]);
  const emailColumn = pickColumn(table, ["email", "fromEmail"]) ?? "email";
  const subjectColumn = pickColumn(table, ["subject", "topic", "formType"]);
  const messageColumn = pickColumn(table, ["message", "body", "content"]) ?? "message";
  const phoneColumn = pickColumn(table, ["phone", "phoneNumber", "tel"]);
  const rows = await getRows(table.table, dateColumn, 500);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const messages = rows.map((row, index) => {
    const status = messageStatus(row, statusColumn);
    const fallbackName =
      `${toText(row.firstName)} ${toText(row.lastName)}`.trim() || "Unknown sender";

    return {
      id: toText(row.id) || `${index}`,
      name: nameColumn ? toText(row[nameColumn]) || fallbackName : fallbackName,
      email: toText(row[emailColumn]) || "No email",
      subject: subjectColumn
        ? toText(row[subjectColumn]) || "Contact message"
        : "Contact message",
      message: toText(row[messageColumn]) || "No message body.",
      status,
      phone: phoneColumn ? toText(row[phoneColumn]) : "",
      date: dateColumn ? formatFullDate(row[dateColumn]) : "—",
    };
  });

  return {
    available: true,
    total: rows.length,
    newCount: messages.filter((message) => message.status === "New").length,
    thisWeek: dateColumn
      ? rows.filter((row) => {
          const date = toDate(row[dateColumn]);
          return date ? date.getTime() >= sevenDaysAgo : false;
        }).length
      : 0,
    messages,
  };
}
