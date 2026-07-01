export type EditablePageSection = {
  key: string;
  label: string;
  description: string;
  defaults: {
    eyebrow?: string;
    title?: string;
    description?: string;
    imageSrc?: string;
    ctaLabel?: string;
    ctaHref?: string;
    body?: string;
  };
};

export type EditablePage = {
  key: string;
  title: string;
  href: string;
  description: string;
  sections: EditablePageSection[];
};

export const editablePages: EditablePage[] = [
  {
    key: "home",
    title: "Home",
    href: "/",
    description: "Main landing page, hero, featured sections and calls to action.",
    sections: [
      {
        key: "hero",
        label: "Hero",
        description: "Main headline, opening text and hero visual.",
        defaults: {
          eyebrow: "Odyssea Vision",
          title: "Stories from the ocean and the wild.",
          description: "Cinematic imagery, travel stories and private galleries.",
          imageSrc: "/images/home/hero_fond.png",
          ctaLabel: "Explore",
          ctaHref: "/portfolio",
        },
      },
      {
        key: "portfolio-preview",
        label: "Portfolio preview",
        description: "Intro text for the featured portfolio area.",
        defaults: {
          eyebrow: "Portfolio",
          title: "Selected visual stories",
          description: "A curated selection of photography and ocean-inspired work.",
          ctaLabel: "View portfolio",
          ctaHref: "/portfolio",
        },
      },
      {
        key: "stories-preview",
        label: "Stories preview",
        description: "Intro text for the recent stories area.",
        defaults: {
          eyebrow: "Stories",
          title: "Notes from the journey",
          description: "Travel, wildlife and ocean stories from the field.",
          ctaLabel: "Read stories",
          ctaHref: "/stories",
        },
      },
      {
        key: "final-cta",
        label: "Final CTA",
        description: "Final conversion block on the homepage.",
        defaults: {
          eyebrow: "Let’s create",
          title: "Ready to shape your next visual story?",
          description: "Tell us about your project, your journey or your private gallery.",
          ctaLabel: "Contact us",
          ctaHref: "/contact",
        },
      },
    ],
  },
  {
    key: "about",
    title: "About",
    href: "/about",
    description: "About page, story, philosophy and brand presentation.",
    sections: [
      {
        key: "hero",
        label: "Hero",
        description: "Top section of the About page.",
        defaults: {
          eyebrow: "About",
          title: "A cinematic eye for wild places.",
          description: "Odyssea Vision creates visual stories rooted in travel, ocean life and nature.",
          imageSrc: "/images/about/hero_fond.png",
        },
      },
      {
        key: "intro",
        label: "Intro",
        description: "Main about text.",
        defaults: {
          title: "For the moments that stay.",
          body: "Write the studio story, values, approach and creative direction here.",
        },
      },
      {
        key: "philosophy",
        label: "Philosophy",
        description: "Brand values and creative approach.",
        defaults: {
          eyebrow: "Philosophy",
          title: "Slow, sensitive and cinematic.",
          description: "A gentle way to document people, places and wildlife.",
        },
      },
      {
        key: "final-cta",
        label: "Final CTA",
        description: "Contact call to action.",
        defaults: {
          title: "Let’s tell your story.",
          ctaLabel: "Get in touch",
          ctaHref: "/contact",
        },
      },
    ],
  },
  {
    key: "portfolio",
    title: "Portfolio",
    href: "/portfolio",
    description: "Portfolio landing page, hero copy and gallery introduction.",
    sections: [
      {
        key: "hero",
        label: "Hero",
        description: "Top section of the Portfolio page.",
        defaults: {
          eyebrow: "Portfolio",
          title: "Photography shaped by movement, light and wild encounters.",
          description: "Explore a selection of visual stories from ocean, travel and nature.",
          imageSrc: "/images/portfolio/hero_landscape_01.png",
        },
      },
      {
        key: "gallery-intro",
        label: "Gallery intro",
        description: "Text displayed before the gallery or categories.",
        defaults: {
          eyebrow: "Selected work",
          title: "Visual stories",
          description: "Browse photography collections by mood, place and subject.",
        },
      },
      {
        key: "final-cta",
        label: "Final CTA",
        description: "Final portfolio call to action.",
        defaults: {
          title: "Want to create a visual story together?",
          ctaLabel: "Contact us",
          ctaHref: "/contact",
        },
      },
    ],
  },
  {
    key: "stories",
    title: "Stories",
    href: "/stories",
    description: "Stories archive page, hero and editorial introduction.",
    sections: [
      {
        key: "hero",
        label: "Hero",
        description: "Top section of the Stories page.",
        defaults: {
          eyebrow: "Stories",
          title: "Field notes, ocean encounters and wild memories.",
          description: "Read the stories behind the images.",
          imageSrc: "/images/stories/hero_fond.png",
        },
      },
      {
        key: "archive-intro",
        label: "Archive intro",
        description: "Introduction above the story archive.",
        defaults: {
          eyebrow: "Journal",
          title: "Latest stories",
          description: "A collection of travel notes, wildlife encounters and visual essays.",
        },
      },
    ],
  },
  {
    key: "videos",
    title: "Videos",
    href: "/videos",
    description: "Videos page, hero copy and film sections.",
    sections: [
      {
        key: "hero",
        label: "Hero",
        description: "Top section of the Videos page.",
        defaults: {
          eyebrow: "Videos",
          title: "Films from the ocean and the road.",
          description: "Short films, travel episodes and cinematic memories.",
          imageSrc: "/images/videos/hero_fond.png",
        },
      },
      {
        key: "featured-film",
        label: "Featured film",
        description: "Featured video block introduction.",
        defaults: {
          eyebrow: "Featured film",
          title: "Latest episode",
          description: "A highlighted film from the collection.",
        },
      },
      {
        key: "collection-intro",
        label: "Collection intro",
        description: "Introduction above the video collection.",
        defaults: {
          eyebrow: "Collection",
          title: "All films",
          description: "Browse travel films, ocean films, recaps and behind the scenes.",
        },
      },
    ],
  },
  {
    key: "client-albums",
    title: "Client albums",
    href: "/client-albums",
    description: "Client album landing page, private gallery access and CTA.",
    sections: [
      {
        key: "hero",
        label: "Hero",
        description: "Top section of the Client albums page.",
        defaults: {
          eyebrow: "Client albums",
          title: "Your memories, beautifully preserved.",
          description: "Private galleries for clients, families, couples and brands.",
          imageSrc: "/images/client-albums/hero_fond.png",
        },
      },
      {
        key: "intro",
        label: "Intro",
        description: "Introductory private gallery text.",
        defaults: {
          eyebrow: "Private & personal",
          title: "A gallery, just for you.",
          description: "A private space to download, share and cherish your images.",
        },
      },
      {
        key: "access",
        label: "Access",
        description: "Password and access explanation.",
        defaults: {
          title: "Access your private gallery",
          description: "Use your private password to enter your album.",
        },
      },
    ],
  },
  {
    key: "contact",
    title: "Contact",
    href: "/contact",
    description: "Contact page copy, form introduction and contact details.",
    sections: [
      {
        key: "hero",
        label: "Hero",
        description: "Top section of the Contact page.",
        defaults: {
          eyebrow: "Contact",
          title: "Tell us about your next story.",
          description: "For visual projects, private galleries, travel work and creative collaborations.",
          imageSrc: "/images/contact/hero_fond.png",
        },
      },
      {
        key: "form-intro",
        label: "Form intro",
        description: "Text above the contact form.",
        defaults: {
          title: "Start the conversation",
          description: "Share a few details about your project and we will get back to you.",
        },
      },
      {
        key: "details",
        label: "Contact details",
        description: "Email, location or practical contact information.",
        defaults: {
          title: "Contact details",
          body: "Email, location and availability details can be edited here.",
        },
      },
    ],
  },
];

export function getEditablePage(pageKey: string) {
  return editablePages.find((page) => page.key === pageKey);
}
