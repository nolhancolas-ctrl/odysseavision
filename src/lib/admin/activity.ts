import { db } from "@/lib/db";

type RawRow = Record<string, unknown>;

export type AdminActivityItem = {
  id: string;
  title: string;
  category: string;
  detail: string;
  date: string;
  fullDate: string;
  href?: string;
  modalTitle: string;
  modalDescription: string;
  metadata: {
    label: string;
    value: string;
  }[];
};

type TableSource = {
  table: string;
  category: string;
  hrefBase?: string;
  titleColumns: string[];
  descriptionColumns?: string[];
};

const sources: TableSource[] = [
  {
    table: "Story",
    category: "Story",
    hrefBase: "/admin/stories",
    titleColumns: ["title", "name"],
    descriptionColumns: ["excerpt", "slug", "status"],
  },
  {
    table: "PortfolioItem",
    category: "Portfolio",
    hrefBase: "/admin/portfolio",
    titleColumns: ["title", "name"],
    descriptionColumns: ["location", "slug", "status"],
  },
  {
    table: "Video",
    category: "Video",
    hrefBase: "/admin/videos",
    titleColumns: ["title", "name"],
    descriptionColumns: ["vimeoUrl", "slug", "status"],
  },
  {
    table: "ClientAlbum",
    category: "Client album",
    hrefBase: "/admin/albums",
    titleColumns: ["title", "name"],
    descriptionColumns: ["slug", "status"],
  },
  {
    table: "Client",
    category: "Client",
    hrefBase: "/admin/clients",
    titleColumns: ["name", "fullName", "email"],
    descriptionColumns: ["email", "phone", "status"],
  },
  {
    table: "NewsletterCampaign",
    category: "Newsletter",
    hrefBase: "/admin/newsletters",
    titleColumns: ["title", "subject", "name"],
    descriptionColumns: ["status", "subject"],
  },
  {
    table: "ContactMessage",
    category: "Message",
    hrefBase: "/admin/messages",
    titleColumns: ["subject", "name", "email"],
    descriptionColumns: ["name", "email", "message", "status"],
  },
  {
    table: "NewsletterSubscriber",
    category: "Subscriber",
    hrefBase: "/admin/analytics/subscribers",
    titleColumns: ["email", "name"],
    descriptionColumns: ["source", "status"],
  },
];

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

  if (!value) {
    return null;
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: unknown, type: "short" | "full") {
  const date = toDate(value);

  if (!date) {
    return "—";
  }

  return type === "short"
    ? shortDateFormatter.format(date)
    : fullDateFormatter.format(date);
}

function pickColumn(columns: string[], candidates: string[]) {
  const lowerMap = new Map(
    columns.map((column) => [column.toLowerCase(), column])
  );

  for (const candidate of candidates) {
    const column = lowerMap.get(candidate.toLowerCase());

    if (column) {
      return column;
    }
  }

  return undefined;
}

function pickText(row: RawRow, columns: string[], candidates: string[]) {
  const column = pickColumn(columns, candidates);

  if (!column) {
    return "";
  }

  return toText(row[column]);
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

function inferAction(source: TableSource, row: RawRow, columns: string[]) {
  if (source.table === "PageView") {
    return "viewed";
  }

  if (source.table === "ContactMessage") {
    return "received";
  }

  if (source.table === "NewsletterSubscriber") {
    return "subscribed";
  }

  if (pickColumn(columns, ["importedAt"])) {
    return "imported";
  }

  const createdColumn = pickColumn(columns, ["createdAt"]);
  const updatedColumn = pickColumn(columns, ["updatedAt"]);

  const createdAt = createdColumn ? toDate(row[createdColumn]) : null;
  const updatedAt = updatedColumn ? toDate(row[updatedColumn]) : null;

  if (
    createdAt &&
    updatedAt &&
    Math.abs(updatedAt.getTime() - createdAt.getTime()) > 90_000
  ) {
    return "updated";
  }

  return "created";
}

async function tableExists(table: string) {
  const rows = await db.$queryRawUnsafe<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    table
  );

  return rows.length > 0;
}

async function getColumns(table: string) {
  const rows = await db.$queryRawUnsafe<{ name: string }[]>(
    `PRAGMA table_info(${quoteIdentifier(table)})`
  );

  return rows.map((row) => row.name);
}

async function getRows(table: string, orderColumn: string) {
  return db.$queryRawUnsafe<RawRow[]>(
    `SELECT * FROM ${quoteIdentifier(table)} ORDER BY ${quoteIdentifier(
      orderColumn
    )} DESC LIMIT 20`
  );
}

function buildMetadata(row: RawRow, columns: string[]) {
  return columns
    .filter((column) =>
      [
        "status",
        "email",
        "name",
        "subject",
        "slug",
        "path",
        "source",
        "referrer",
        "createdAt",
        "updatedAt",
        "importedAt",
      ].includes(column)
    )
    .map((column) => ({
      label: titleCase(column),
      value:
        column.toLowerCase().includes("at") || column.toLowerCase() === "date"
          ? formatDate(row[column], "full")
          : toText(row[column]),
    }))
    .filter((item) => item.value);
}

export async function getAdminActivityTimeline(): Promise<AdminActivityItem[]> {
  const items: AdminActivityItem[] = [];

  for (const source of sources) {
    const exists = await tableExists(source.table);

    if (!exists) {
      continue;
    }

    const columns = await getColumns(source.table);
    const orderColumn =
      pickColumn(columns, ["updatedAt", "createdAt", "importedAt", "date"]) ??
      pickColumn(columns, ["id"]);

    if (!orderColumn) {
      continue;
    }

    const rows = await getRows(source.table, orderColumn);
    const idColumn = pickColumn(columns, ["id"]);
    const createdColumn = pickColumn(columns, ["createdAt"]);
    const updatedColumn = pickColumn(columns, ["updatedAt"]);
    const dateColumn = updatedColumn ?? createdColumn ?? orderColumn;

    for (const [index, row] of rows.entries()) {
      const rowId = idColumn ? toText(row[idColumn]) : "";
      const action = inferAction(source, row, columns);
      const label =
        pickText(row, columns, source.titleColumns) ||
        pickText(row, columns, source.descriptionColumns ?? []) ||
        source.category;

      const detail =
        pickText(row, columns, source.descriptionColumns ?? []) ||
        label ||
        `${source.category} ${action}`;

      const href =
        source.hrefBase && rowId
          ? `${source.hrefBase}/${encodeURIComponent(rowId)}`
          : source.hrefBase;

      items.push({
        id: `${source.table}-${rowId || index}-${toText(row[dateColumn])}`,
        title: `${source.category} ${action}`,
        category: source.category,
        detail,
        date: formatDate(row[dateColumn], "short"),
        fullDate: formatDate(row[dateColumn], "full"),
        href,
        modalTitle: `${source.category} ${action}`,
        modalDescription: detail,
        metadata: buildMetadata(row, columns),
      });
    }
  }

  return items
    .filter((item) => item.category !== "View")
    .sort((a, b) => {
      const dateA = new Date(a.fullDate).getTime();
      const dateB = new Date(b.fullDate).getTime();

      if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
        return 0;
      }

      return dateB - dateA;
    })
    .slice(0, 120);
}
