const asset = (name: string) => ({
  src: `/images/client-albums/${name}`,
  label: name,
});

export const clientAlbumImages = {
  hero: asset("hero_fond.png"),
  hero01: asset("hero_01.png"),
  hero02: asset("hero_02.png"),

  introTurtle: asset("intro_01.png"),

  accessFond: asset("access_fond.png"),
  accessCard: asset("access_card.png"),

  ctaFond: asset("cta_fond.png"),
  ctaWhale: asset("cta_01.png"),
};

export const clientAlbumHero = {
  eyebrow: "Client albums",
  title: "Your memories, beautifully preserved.",
  description:
    "Private galleries for our incredible clients. Relive your adventures and share your moments with the people who matter most.",
  handwritten: "for the moments that stay",
};

export const clientAlbumIntro = {
  eyebrow: "Private & personal",
  title: "A gallery, just for you.",
  description:
    "Whether it’s an elopement, a family adventure, a brand project or an unforgettable experience, your gallery is a space to download, share and cherish.",
};

export const clientAlbums = [
  {
    slug: "whales-of-ningaloo",
    title: "Whales of Ningaloo",
    date: "May 2024",
    photoCount: 128,
    cover: asset("album_01.png"),
    href: "/client-albums/whales-of-ningaloo",
    passwordProtected: true,
  },
  {
    slug: "thailand-adventure",
    title: "Thailand Adventure",
    date: "Apr 2024",
    photoCount: 356,
    cover: asset("album_02.png"),
    href: "/client-albums/thailand-adventure",
    passwordProtected: true,
  },
  {
    slug: "eliza-tom-bali",
    title: "Eliza & Tom — Bali",
    date: "Mar 2024",
    photoCount: 214,
    cover: asset("album_03.png"),
    href: "/client-albums/eliza-tom-bali",
    passwordProtected: true,
  },
  {
    slug: "raja-ampat-diving",
    title: "Raja Ampat Diving",
    date: "Feb 2024",
    photoCount: 187,
    cover: asset("album_04.png"),
    href: "/client-albums/raja-ampat-diving",
    passwordProtected: true,
  },
];

export const clientAlbumAccessFeatures = [
  {
    title: "Private galleries",
    description: "Each gallery is private and protected with a password.",
    icon: "/images/client-albums/access_icon_01.png",
  },
  {
    title: "High-resolution downloads",
    description: "Download high-resolution photos and relive every moment.",
    icon: "/images/client-albums/access_icon_02.png",
  },
  {
    title: "Easy sharing",
    description: "Share your gallery with family and friends in just a few clicks.",
    icon: "/images/client-albums/access_icon_03.png",
  },
];
