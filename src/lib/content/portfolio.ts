import { db } from "@/lib/db";
import { portfolioPreviewItems } from "@/data/home";

export type PublicPortfolioCategory = {
  title: string;
  number: string;
  image: string;
  label: string;
  href: string;
  description: string;
};

export type PublicPortfolioItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageSrc: string;
  category: string;
  categorySlug: string;
  location: string;
  date: string;
  featured: boolean;
};

function formatNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function toStaticCategories(): PublicPortfolioCategory[] {
  return portfolioPreviewItems.map((item, index) => ({
    title: item.title,
    number: formatNumber(index),
    image: item.image,
    label: item.label,
    href: item.href,
    description: item.description,
  }));
}

export async function getPublicPortfolioCategories(): Promise<
  PublicPortfolioCategory[]
> {
  try {
    const categories = await db.portfolioCategory.findMany({
      include: {
        items: {
          where: {
            status: "PUBLISHED",
          },
          orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
          take: 1,
        },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    const publishedCategories = categories.filter(
      (category) => category.items.length > 0,
    );

    if (publishedCategories.length === 0) {
      return toStaticCategories();
    }

    return publishedCategories.map((category, index) => {
      const cover = category.items[0];

      return {
        title: category.name,
        number: formatNumber(index),
        image: cover.imageSrc,
        label: category.name,
        href: `/portfolio/${category.slug}`,
        description:
          cover.description ??
          "A curated selection of visual stories from Odyssea Vision.",
      };
    });
  } catch {
    return toStaticCategories();
  }
}

export async function getPublicPortfolioItems(): Promise<PublicPortfolioItem[]> {
  try {
    const items = await db.portfolioItem.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        category: true,
      },
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    if (items.length === 0) {
      return portfolioPreviewItems.map((item, index) => ({
        id: item.title,
        title: item.title,
        slug: item.href.split("/").filter(Boolean).at(-1) ?? item.title,
        description: item.description,
        imageSrc: item.image,
        category: item.title,
        categorySlug: item.href.split("/").filter(Boolean).at(-1) ?? item.title,
        location: "",
        date: "",
        featured: index === 0,
      }));
    }

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description ?? "",
      imageSrc: item.imageSrc,
      category: item.category?.name ?? "Portfolio",
      categorySlug: item.category?.slug ?? "portfolio",
      location: item.location ?? "",
      date: item.date ? item.date.toISOString() : "",
      featured: item.featured,
    }));
  } catch {
    return portfolioPreviewItems.map((item, index) => ({
      id: item.title,
      title: item.title,
      slug: item.href.split("/").filter(Boolean).at(-1) ?? item.title,
      description: item.description,
      imageSrc: item.image,
      category: item.title,
      categorySlug: item.href.split("/").filter(Boolean).at(-1) ?? item.title,
      location: "",
      date: "",
      featured: index === 0,
    }));
  }
}
