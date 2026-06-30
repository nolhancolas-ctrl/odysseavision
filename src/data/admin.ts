import { adminAsset } from "@/data/adminAssets";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  iconSrc?: string;
  description?: string;
};

export const adminPrimaryNavigation: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "⌂",
    iconSrc: adminAsset.dashboard,
  },
  {
    href: "/admin/stories",
    label: "Stories",
    icon: "✍",
    iconSrc: adminAsset.stories,
    description: "Articles, travel notes and drafts",
  },
  {
    href: "/admin/portfolio",
    label: "Portfolio",
    icon: "▧",
    iconSrc: adminAsset.portfolio,
    description: "Photos, categories and galleries",
  },
  {
    href: "/admin/videos",
    label: "Videos",
    icon: "▷",
    iconSrc: adminAsset.videos,
    description: "Vimeo films and thumbnails",
  },
  {
    href: "/admin/albums",
    label: "Client albums",
    icon: "▱",
    iconSrc: adminAsset.clients_album,
    description: "Private albums and access",
  },
  {
    href: "/admin/clients",
    label: "Clients",
    icon: "♙",
    iconSrc: adminAsset.clients,
    description: "Contacts, notes and private links",
  },
  {
    href: "/admin/media",
    label: "Media library",
    icon: "▤",
    iconSrc: adminAsset.media_librairie,
    description: "Reusable images and files",
  },
];

export const adminSiteNavigation: AdminNavItem[] = [
  {
    href: "/admin/site",
    label: "Website pages",
    icon: "□",
    iconSrc: adminAsset.website_page,
    description: "Home, About, Contact...",
  },
  {
    href: "/admin/navigation",
    label: "Navigation",
    icon: "☷",
    iconSrc: adminAsset.navigation,
    description: "Menu, footer and links",
  },
  {
    href: "/admin/appearance",
    label: "Appearance",
    icon: "◌",
    iconSrc: adminAsset.appearance,
    description: "Logo, splashscreen and identity",
  },
  {
    href: "/admin/seo",
    label: "SEO & settings",
    icon: "⚙",
    iconSrc: adminAsset.seo_settings,
    description: "Titles, descriptions and Open Graph",
  },
  {
    href: "/admin/forms",
    label: "Forms & emails",
    icon: "✉",
    iconSrc: adminAsset.forms_emails,
    description: "Messages, newsletter and contact",
  },
];

export const adminStats = [
  {
    label: "Stories",
    value: "24",
    detail: "8 published",
    icon: "✍",
    iconSrc: adminAsset.stories,
  },
  {
    label: "Photos",
    value: "156",
    detail: "12 new",
    icon: "▧",
    iconSrc: adminAsset.portfolio,
  },
  {
    label: "Videos",
    value: "7",
    detail: "3 published",
    icon: "▷",
    iconSrc: adminAsset.videos,
  },
  {
    label: "Client albums",
    value: "18",
    detail: "2 pending",
    icon: "▱",
    iconSrc: adminAsset.clients_album,
  },
  {
    label: "Clients",
    value: "23",
    detail: "1 new",
    icon: "♙",
    iconSrc: adminAsset.clients,
  },
];

export const adminRecentItems = [
  {
    type: "Story",
    title: "A meeting in the heart of the savanna",
    status: "Published",
    date: "June 12, 2024",
    image: "/images/stories/featured_elephants_01.png",
  },
  {
    type: "Portfolio",
    title: "Wild escape in Iceland",
    status: "Draft",
    date: "June 10, 2024",
    image: "/images/portfolio/hero_landscape_01.png",
  },
  {
    type: "Video",
    title: "The blue giants",
    status: "Published",
    date: "June 8, 2024",
    image: "/images/videos/featured_film_01.png",
  },
  {
    type: "Portfolio",
    title: "On the roads of Patagonia",
    status: "Draft",
    date: "June 6, 2024",
    image: "/images/portfolio/recent_01.png",
  },
];

export const adminRecentAlbums = [
  {
    title: "Claire & Julien wedding",
    photos: "23 photos",
    status: "Published",
    image: "/images/clients/album_01.png",
  },
  {
    title: "Martin family",
    photos: "45 photos",
    status: "Pending",
    image: "/images/clients/album_02.png",
  },
  {
    title: "Norway journey",
    photos: "62 photos",
    status: "Published",
    image: "/images/clients/album_03.png",
  },
];

export const adminActivities = [
  "New client added — Camille Dupont",
  "New album created — Claire & Julien wedding",
  "Story published — A meeting in the heart of the savanna",
  "New contact form message",
  "Video published — Iceland behind the scenes",
];

export const adminQuickActions = [
  {
    href: "/admin/stories",
    label: "Add a story",
    icon: "+",
    iconSrc: adminAsset.stories,
  },
  {
    href: "/admin/portfolio",
    label: "Add a photo",
    icon: "▧",
    iconSrc: adminAsset.portfolio,
  },
  {
    href: "/admin/videos",
    label: "Add a video",
    icon: "▷",
    iconSrc: adminAsset.videos,
  },
  {
    href: "/admin/albums",
    label: "Create a client album",
    icon: "▱",
    iconSrc: adminAsset.clients_album,
  },
  {
    href: "/admin/clients",
    label: "Add a client",
    icon: "♙",
    iconSrc: adminAsset.clients,
  },
  {
    href: "/admin/site",
    label: "Edit a page",
    icon: "✎",
    iconSrc: adminAsset.website_page,
  },
  {
    href: "/admin/settings",
    label: "Site settings",
    icon: "⚙",
    iconSrc: adminAsset.seo_settings,
  },
];
