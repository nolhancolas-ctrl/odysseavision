export const adminAsset = {
  "logo": "/images/admin/odyssea_logo.png",
  "odyssea_logo": "/images/admin/odyssea_logo.png",
  "stamp_corner": "/images/admin/stamp_corner.png",
  "dashboard": "/images/admin/dashboard.svg",
  "stories": "/images/admin/stories.png",
  "portfolio": "/images/admin/portfolio.svg",
  "videos": "/images/admin/videos.svg",
  "clients_album": "/images/admin/clients_album.png",
  "clients": "/images/admin/clients.png",
  "media_librairie": "",
  "media_library": "",
  "website_page": "/images/admin/website_page.png",
  "navigation": "/images/admin/navigation.png",
  "appearance": "/images/admin/appearance.png",
  "seo_settings": "/images/admin/seo_settings.png",
  "forms_emails": "/images/admin/forms_emails.png",
  "eye": "/images/admin/eye.png"
} as const;

export type AdminAssetKey = keyof typeof adminAsset;
