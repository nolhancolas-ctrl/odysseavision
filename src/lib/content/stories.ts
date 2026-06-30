import { db } from "@/lib/db";
import {
  stories as staticStories,
  storyCategories as staticCategories,
} from "@/data/stories";

export type PublicStory = {
  slug: string;
  title: string;
  category: string;
  description: string;
  content: string;
  imageSrc: string;
  date: string;
  displayDate: string;
  readTime: string;
  featured: boolean;
};

export type PublicStoriesArchive = {
  stories: PublicStory[];
  storyCategories: string[];
};

function formatDisplayDate(date: Date | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getStaticStories(): PublicStory[] {
  return staticStories.map((story, index) => ({
    slug: story.slug,
    title: story.title,
    category: story.category,
    description: story.description,
    content: story.description,
    imageSrc: story.image.src,
    date: story.date,
    displayDate: story.displayDate,
    readTime: story.readTime,
    featured: index === 0,
  }));
}

export async function getPublicStoriesArchive(): Promise<PublicStoriesArchive> {
  try {
    const dbStories = await db.story.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        category: true,
      },
      orderBy: [
        { featured: "desc" },
        { order: "asc" },
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });

    if (dbStories.length === 0) {
      return {
        stories: getStaticStories(),
        storyCategories: staticCategories,
      };
    }

    const stories = dbStories.map((story) => ({
      slug: story.slug,
      title: story.title,
      category: story.category?.name ?? "Stories",
      description: story.excerpt ?? "",
      content: story.content ?? story.excerpt ?? "",
      imageSrc: story.imageSrc,
      date: story.date ? story.date.toISOString().slice(0, 10) : "",
      displayDate: formatDisplayDate(story.date),
      readTime: story.readTime ?? "",
      featured: story.featured,
    }));

    const categories = Array.from(
      new Set(stories.map((story) => story.category).filter(Boolean)),
    );

    return {
      stories,
      storyCategories: ["All stories", ...categories],
    };
  } catch {
    return {
      stories: getStaticStories(),
      storyCategories: staticCategories,
    };
  }
}

export async function getPublicStoryBySlug(
  slug: string,
): Promise<PublicStory | null> {
  try {
    const story = await db.story.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      include: {
        category: true,
      },
    });

    if (!story) {
      const fallback = getStaticStories().find((item) => item.slug === slug);
      return fallback ?? null;
    }

    return {
      slug: story.slug,
      title: story.title,
      category: story.category?.name ?? "Stories",
      description: story.excerpt ?? "",
      content: story.content ?? story.excerpt ?? "",
      imageSrc: story.imageSrc,
      date: story.date ? story.date.toISOString().slice(0, 10) : "",
      displayDate: formatDisplayDate(story.date),
      readTime: story.readTime ?? "",
      featured: story.featured,
    };
  } catch {
    const fallback = getStaticStories().find((item) => item.slug === slug);
    return fallback ?? null;
  }
}
