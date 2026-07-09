import { db } from "@/lib/db";
import {
  getEditablePage,
  type EditableFieldKey,
  type EditablePageSection,
} from "@/data/sitePages";

export type PublicSectionContent = {
  ctaLabel?: string;
  ctaHref?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  body?: string;
  andrewDescription?: string;
  morganeDescription?: string;
  imageSrc?: string;
  images: Record<string, string>;
  imageWatermarks: Record<string, boolean>;
  drawings: Record<string, string>;
  featuredVideoMode?: string;
  featuredVideoId?: string;
};

export type PublicPageContent = {
  pageKey: string;
  sections: Record<string, PublicSectionContent>;
};

const editableFields: EditableFieldKey[] = [
  "ctaLabel",
  "eyebrow",
  "title",
  "description",
  "body",
  "andrewDescription",
  "morganeDescription",
  "featuredVideoMode",
  "featuredVideoId",
];

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function readStringRecord(value: unknown): Record<string, string> {
  if (!isObject(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function readBooleanRecord(value: unknown): Record<string, boolean> {
  if (!isObject(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, boolean] => typeof entry[1] === "boolean",
    ),
  );
}

function isWatermarkEligibleImageCategory(category: string) {
  return category === "background" || category === "photoframe" || category === "photo";
}

function getDefaultImageWatermark(category: string) {
  if (!isWatermarkEligibleImageCategory(category)) {
    return false;
  }

  return category !== "background";
}

function getDefaultSectionContent(
  section: EditablePageSection,
): PublicSectionContent {
  const content: PublicSectionContent = {
    images: {},
    imageWatermarks: {},
    drawings: {},
  };

  for (const field of section.fields) {
    content[field] = section.defaults[field] ?? "";
  }

  if (section.defaults.ctaHref) {
    content.ctaHref = section.defaults.ctaHref;
  }

  if (section.defaults.imageSrc) {
    content.imageSrc = section.defaults.imageSrc;
  }

  for (const image of section.images ?? []) {
    content.images[image.key] = image.defaultSrc ?? "";

    if (isWatermarkEligibleImageCategory(image.category)) {
      content.imageWatermarks[image.key] = getDefaultImageWatermark(image.category);
    }
  }

  if (!content.imageSrc) {
    const firstImage = Object.values(content.images).find(Boolean);

    if (firstImage) {
      content.imageSrc = firstImage;
    }
  }

  for (const drawing of section.drawings ?? []) {
    content.drawings[drawing.key] = drawing.defaultText;
  }

  return content;
}

export function mergeSectionContent(
  section: EditablePageSection,
  savedContent: unknown,
): PublicSectionContent {
  const defaults = getDefaultSectionContent(section);

  if (!isObject(savedContent)) {
    return defaults;
  }

  const merged: PublicSectionContent = {
    ...defaults,
    images: {
      ...defaults.images,
      ...readStringRecord(savedContent.images),
    },
    imageWatermarks: {
      ...defaults.imageWatermarks,
      ...readBooleanRecord(savedContent.imageWatermarks),
    },
    drawings: {
      ...defaults.drawings,
      ...readStringRecord(savedContent.drawings),
    },
  };

  for (const field of editableFields) {
    const value = readString(savedContent[field]);

    if (value !== undefined) {
      merged[field] = value;
    }
  }

  const ctaHref = readString(savedContent.ctaHref);

  if (ctaHref !== undefined) {
    merged.ctaHref = ctaHref;
  }

  const imageSrc = readString(savedContent.imageSrc);

  if (imageSrc !== undefined) {
    merged.imageSrc = imageSrc;
  } else {
    const firstImage = Object.values(merged.images).find(Boolean);

    if (firstImage) {
      merged.imageSrc = firstImage;
    }
  }

  return merged;
}

export async function getPublicPageContent(
  pageKey: string,
): Promise<PublicPageContent | null> {
  const page = getEditablePage(pageKey);

  if (!page) {
    return null;
  }

  const savedSections = await db.pageContent.findMany({
    where: { pageKey },
  });

  const sections: Record<string, PublicSectionContent> = {};

  for (const section of page.sections) {
    const saved = savedSections.find(
      (item) => item.sectionKey === section.key,
    );

    sections[section.key] = mergeSectionContent(section, saved?.content);
  }

  return {
    pageKey,
    sections,
  };
}

export async function getPublicSectionContent(
  pageKey: string,
  sectionKey: string,
): Promise<PublicSectionContent | null> {
  const page = getEditablePage(pageKey);

  if (!page) {
    return null;
  }

  const section = page.sections.find((item) => item.key === sectionKey);

  if (!section) {
    return null;
  }

  const saved = await db.pageContent.findUnique({
    where: {
      pageKey_sectionKey: {
        pageKey,
        sectionKey,
      },
    },
  });

  return mergeSectionContent(section, saved?.content);
}
