const asset = (name: string) => ({
  src: `/images/contact/${name}`,
  label: name,
});

export const contactImages = {
  hero: asset("hero_fond.png"),
  hero01: asset("hero_01.png"),
  hero02: asset("hero_02.png"),

  form01: asset("form_01.png"),
  formLeaf: asset("hero_drawing_01.png"),
};

export const contactHero = {
  eyebrow: "Contact",
  title: "Let’s create something beautiful.",
  description:
    "Whether it’s a film, a private gallery, a wild adventure or a simple hello, we’d love to hear your story.",
  handwritten: "stories begin with hello",
};

export const contactInfo = [
  {
    title: "Email",
    value: "odysseavision@gmail.com",
    href: "mailto:odysseavision@gmail.com",
  },
  {
    title: "Instagram",
    value: "@odyssea.vision",
    href: "https://www.instagram.com/odyssea.vision",
  },
  {
    title: "Based between",
    value: "land & sea",
    href: "",
  },
];

export const projectTypes = [
  "Photography",
  "Film",
  "Client album",
  "Travel story",
  "Brand project",
  "Other",
];

export const contactServices = [
  {
    title: "Photography",
    description:
      "From wildlife and ocean to landscapes and portraits. Let’s bring your vision to life.",
    icon: "camera",
  },
  {
    title: "Videography",
    description:
      "Short films, travel recaps and cinematic stories from land and sea.",
    icon: "video",
  },
  {
    title: "Collaborations",
    description:
      "Partnerships with brands, conservation projects and creative adventures.",
    icon: "globe",
  },
];

export const contactServiceImages = {
  leftTall: "/images/contact/services_left_01.png",
  leftSmall: "/images/contact/services_left_02.png",
  rightTall: "/images/contact/services_right_01.png",
  rightSmall: "/images/contact/services_right_02.png",
};

export const contactNewsletterImages = {
  image01: "/images/contact/newsletter_01.png",
  image02: "/images/contact/newsletter_02.png",
  image03: "/images/contact/newsletter_03.png",
  image04: "/images/contact/newsletter_04.png",
};
