export type EditableFieldKey =
  | "ctaLabel"
  | "eyebrow"
  | "title"
  | "description"
  | "body"
  | "andrewDescription"
  | "morganeDescription";

export type EditableImageCategory =
  | "background"
  | "photoframe"
  | "photo"
  | "drawing"
  | "ornamental"
  | "icons";

export type EditableImageSlot = {
  key: string;
  label: string;
  category: EditableImageCategory;
  defaultSrc?: string;
};

export type EditableDrawingSlot = {
  key: string;
  label: string;
  defaultText: string;
};

export type EditablePageSection = {
  key: string;
  label: string;
  description: string;

  /**
   * Controls exactly which text fields are editable in the admin.
   * If a field is not listed here, it must not be displayed.
   */
  fields: EditableFieldKey[];

  /**
   * Legacy/simple defaults.
   * Kept for compatibility with the current admin and seed script.
   */
  defaults: {
    eyebrow?: string;
    title?: string;
    description?: string;
    imageSrc?: string;
    ctaLabel?: string;
    ctaHref?: string;
    body?: string;
    andrewDescription?: string;
    morganeDescription?: string;
  };

  /**
   * Structured image slots for the future Website pages editor.
   * Categories are displayed only when they contain at least one slot.
   */
  images?: EditableImageSlot[];

  /**
   * Handwritten / decorative text slots.
   * These will live visually inside the Images / Drawing area.
   */
  drawings?: EditableDrawingSlot[];
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
        description: "Main headline, opening text, background and postcards.",
        fields: ["ctaLabel", "title", "description"],
        defaults: {
          title: "Wild Stories",
          description:
            "We are Andrew & Morgane, photographers and filmmakers capturing the beauty of our planet and the stories that deserve to be told.",
          ctaLabel: "Explore the portfolio",
          ctaHref: "/portfolio",
          imageSrc: "/images/home/hero_fond.png",
        },
        images: [
          {
            key: "background",
            label: "Hero background",
            category: "background",
            defaultSrc: "/images/home/hero_fond.png",
          },
          {
            key: "postalCoast",
            label: "Left postcard coast",
            category: "photoframe",
            defaultSrc: "/images/home/postal_coast_01.png",
          },
          {
            key: "postalTurtle",
            label: "Left postcard turtle",
            category: "photoframe",
            defaultSrc: "/images/home/postal_turtle_01.png",
          },
          {
            key: "postalZebra",
            label: "Right postcard zebra",
            category: "photoframe",
            defaultSrc: "/images/home/postal_zebra_01.png",
          },
          {
            key: "postalManta",
            label: "Right postcard manta",
            category: "photoframe",
            defaultSrc: "/images/home/postal_manta_01.png",
          },
        ],
        drawings: [
          {
            key: "subtitle",
            label: "Hero italic subtitle",
            defaultText: "from land and sea.",
          },
        ],
      },
      {
        key: "intro",
        label: "Intro",
        description: "Welcome block with main intro image.",
        fields: ["ctaLabel", "eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Welcome",
          title: "Visual Storytellers & Ocean Lovers",
          description:
            "We travel the world in search of wild places, genuine encounters and stories that inspire. Through photography and film, we aim to share the beauty of our planet, raise awareness about its fragility and remind us all why it’s worth protecting.",
          ctaLabel: "Discover our story",
          ctaHref: "/about",
          imageSrc: "/images/home/intro_duo_mountain_01.png",
        },
        images: [
          {
            key: "photo",
            label: "Intro photo frame",
            category: "photoframe",
            defaultSrc: "/images/home/intro_duo_mountain_01.png",
          },
        ],
      },
      {
        key: "portfolio-preview",
        label: "Portfolio preview",
        description: "Intro text for the featured portfolio carousel.",
        fields: ["eyebrow", "title"],
        defaults: {
          eyebrow: "Portfolio",
          title: "Explore our world",
        },
      },
      {
        key: "featured-story",
        label: "Featured story",
        description: "Featured editorial block on the homepage.",
        fields: ["ctaLabel", "eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Featured story",
          title: "The Reality Behind Elephant Tours",
          description:
            "A closer look at the elephant tourism industry, ethical encounters and how we can all make better choices for animals and local communities.",
          ctaLabel: "Read the story",
          ctaHref: "/stories/the-reality-behind-elephant-tours",
          imageSrc: "/images/home/story_elephants_01.png",
        },
        images: [
          {
            key: "photo",
            label: "Featured story image",
            category: "photoframe",
            defaultSrc: "/images/home/story_elephants_01.png",
          },
        ],
      },
      {
        key: "about-preview",
        label: "About preview",
        description: "Dark block introducing Andrew and Morgane.",
        fields: ["ctaLabel", "eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Meet Andrew & Morgane",
          title: "Two souls, one vision",
          description:
            "We’re a couple, a team and partners in adventure. Photography brought us together and the ocean keeps guiding our path.",
          ctaLabel: "More about us",
          ctaHref: "/about",
          imageSrc: "/images/home/about_duo_coast_01.png",
        },
        images: [
          {
            key: "photo",
            label: "About preview image",
            category: "photo",
            defaultSrc: "/images/home/about_duo_coast_01.png",
          },
        ],
      },
      {
        key: "mission",
        label: "Mission",
        description: "Mission block with turtle ornament and icons.",
        fields: ["eyebrow", "title"],
        defaults: {
          eyebrow: "Our mission",
          title: "Protect what we love",
        },
        images: [
          {
            key: "turtle",
            label: "Turtle ornament",
            category: "ornamental",
            defaultSrc: "/images/home/mission_turtle_transparent_01.png",
          },
          {
            key: "oceanIcon",
            label: "Ocean conservation icon",
            category: "icons",
            defaultSrc: "/images/home/mission_ocean_01.png",
          },
          {
            key: "storytellingIcon",
            label: "Responsible storytelling icon",
            category: "icons",
            defaultSrc: "/images/home/mission_storytelling_01.png",
          },
          {
            key: "bubblesIcon",
            label: "Leave only bubbles icon",
            category: "icons",
            defaultSrc: "/images/home/mission_bubbles_01.png",
          },
        ],
      },
      {
        key: "final-cta",
        label: "Final CTA",
        description: "Final contact block on the homepage.",
        fields: ["ctaLabel", "title", "description"],
        defaults: {
          title: "Let’s tell your story",
          description: "or simply say hello.",
          ctaLabel: "Contact us",
          ctaHref: "/contact",
        },
        images: [
          {
            key: "leftPhoto",
            label: "Left sailboat photo",
            category: "photoframe",
            defaultSrc: "/images/home/cta_sailboat_01.png",
          },
          {
            key: "rightPhoto",
            label: "Right ocean cliff photo",
            category: "photoframe",
            defaultSrc: "/images/home/cta_ocean_cliff_01.png",
          },
          {
            key: "stamp",
            label: "CTA stamp",
            category: "ornamental",
            defaultSrc: "/images/home/cta_stamp_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Handwritten quote",
            defaultText: "home is where the anchor drops",
          },
        ],
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
        description: "Top section of the About page with background, postcards and handwritten text.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "About us",
          title: "Two storytellers chasing wild horizons.",
          description:
            "We’re Andrew & Morgane, photographers and filmmakers drawn to the ocean, wildlife and the stories that live in between.",
          imageSrc: "/images/about/hero_fond.png",
        },
        images: [
          {
            key: "background",
            label: "Hero background",
            category: "background",
            defaultSrc: "/images/about/hero_fond.png",
          },
          {
            key: "hero01",
            label: "Left postcard main",
            category: "photoframe",
            defaultSrc: "/images/about/hero_01.png",
          },
          {
            key: "hero02",
            label: "Left postcard small",
            category: "photoframe",
            defaultSrc: "/images/about/hero_02.png",
          },
          {
            key: "drawing01",
            label: "Hero drawing top",
            category: "drawing",
            defaultSrc: "/images/about/hero_drawing_01.png",
          },
          {
            key: "drawing02",
            label: "Hero drawing bottom",
            category: "drawing",
            defaultSrc: "/images/about/hero_drawing_02.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Handwritten hero text",
            defaultText: "collect moments, not things",
          },
        ],
      },
      {
        key: "story",
        label: "Story",
        description: "Main story block with collage images.",
        fields: ["ctaLabel", "eyebrow", "title", "body"],
        defaults: {
          eyebrow: "Our story",
          title: "How our adventure began",
          body: `Morgane picked up a camera at 16 and instantly fell in love with the way it could freeze a feeling, a place, a moment in time.

She shared that passion with Andrew, who is drawn to film and the beauty of real, unfiltered moments.

Travel brought us together and created the perfect duo: her eye for stills, his vision for motion.

Today, we roam the world together, capturing landscapes, underwater life, wildlife and the human stories that make each place unique.`,
          ctaLabel: "Our journey in pictures",
          ctaHref: "/portfolio",
        },
        images: [
          {
            key: "story01",
            label: "Story image large",
            category: "photoframe",
            defaultSrc: "/images/about/story_01.png",
          },
          {
            key: "story02",
            label: "Story image left",
            category: "photoframe",
            defaultSrc: "/images/about/story_02.png",
          },
          {
            key: "story03",
            label: "Story image right",
            category: "photoframe",
            defaultSrc: "/images/about/story_03.png",
          },
          {
            key: "story04",
            label: "Story image bottom",
            category: "photoframe",
            defaultSrc: "/images/about/story_04.png",
          },
        ],
      },
      {
        key: "ocean-dreams",
        label: "Ocean dreams",
        description: "Dark ocean life section with visual collage, icons and handwritten text.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Ocean life & future dreams",
          title: "Living for the ocean, dreaming of tomorrow",
          description:
            "The ocean is our playground, our teacher and our biggest inspiration.",
        },
        images: [
          {
            key: "ocean01",
            label: "Ocean photo left",
            category: "photoframe",
            defaultSrc: "/images/about/ocean_01.png",
          },
          {
            key: "ocean02",
            label: "Ocean photo right",
            category: "photoframe",
            defaultSrc: "/images/about/ocean_02.png",
          },
          {
            key: "drawing",
            label: "Ocean drawing",
            category: "drawing",
            defaultSrc: "/images/about/ocean_drawing_01.png",
          },
          {
            key: "icon01",
            label: "Deckhand icon",
            category: "icons",
            defaultSrc: "/images/about/ocean_icon_01.png",
          },
          {
            key: "icon02",
            label: "Floating home icon",
            category: "icons",
            defaultSrc: "/images/about/ocean_icon_02.png",
          },
          {
            key: "icon03",
            label: "Diving icon",
            category: "icons",
            defaultSrc: "/images/about/ocean_icon_03.png",
          },
          {
            key: "icon04",
            label: "Marine biology icon",
            category: "icons",
            defaultSrc: "/images/about/ocean_icon_04.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Ocean handwritten text",
            defaultText: "home is where the ocean is",
          },
        ],
      },
      {
        key: "crew",
        label: "Crew",
        description: "Andrew and Morgane presentation section.",
        fields: ["title", "andrewDescription", "morganeDescription"],
        defaults: {
          title: "Meet the crew",
          andrewDescription: `Golden retriever energy, always up for the next adventure. Sporty, smiley and often the goofy one.

Serious when it comes to driving a boat or guiding divers, he loves capturing real, raw moments through film.

The ocean is his home.`,
          morganeDescription: `Photographer, dreamer and ocean lover. She sees beauty in the small details and seeks the magic in every place.

Passionate about marine life and conservation, she brings a sensitive eye to every story we tell.

Always chasing the light.`,
        },
        images: [
          {
            key: "andrew",
            label: "Andrew portrait",
            category: "photo",
            defaultSrc: "/images/about/crew_andrew_01.png",
          },
          {
            key: "morgane",
            label: "Morgane portrait",
            category: "photo",
            defaultSrc: "/images/about/crew_morgane_01.png",
          },
        ],
        drawings: [
          {
            key: "andrewWords",
            label: "Andrew handwritten traits",
            defaultText: "energetic · sporty · goofy · friendly · ambitious",
          },
          {
            key: "morganeWords",
            label: "Morgane handwritten traits",
            defaultText: "curious · sensitive · determined · adventurous · ocean lover",
          },
        ],
      },
      {
        key: "values",
        label: "Values",
        description: "Values section with background and icons.",
        fields: ["eyebrow", "title"],
        defaults: {
          eyebrow: "Our values",
          title: "What guides us",
          imageSrc: "/images/about/values_fond.png",
        },
        images: [
          {
            key: "background",
            label: "Values background",
            category: "background",
            defaultSrc: "/images/about/values_fond.png",
          },
          {
            key: "icon01",
            label: "Value icon 1",
            category: "icons",
            defaultSrc: "/images/about/values_icon_01.png",
          },
          {
            key: "icon02",
            label: "Value icon 2",
            category: "icons",
            defaultSrc: "/images/about/values_icon_02.png",
          },
          {
            key: "icon03",
            label: "Value icon 3",
            category: "icons",
            defaultSrc: "/images/about/values_icon_03.png",
          },
          {
            key: "icon04",
            label: "Value icon 4",
            category: "icons",
            defaultSrc: "/images/about/values_icon_04.png",
          },
          {
            key: "icon05",
            label: "Value icon 5",
            category: "icons",
            defaultSrc: "/images/about/values_icon_05.png",
          },
        ],
      },
      {
        key: "final-cta",
        label: "Final CTA",
        description: "Final contact call to action.",
        fields: ["ctaLabel", "title", "description"],
        defaults: {
          title: "Have a story to tell?",
          description: "we’d love to hear from you.",
          ctaLabel: "Get in touch",
          ctaHref: "/contact",
        },
        images: [
          {
            key: "leftPhoto",
            label: "Left sailboat photo",
            category: "photoframe",
            defaultSrc: "/images/home/cta_sailboat_01.png",
          },
          {
            key: "rightPhoto",
            label: "Right ocean cliff photo",
            category: "photoframe",
            defaultSrc: "/images/home/cta_ocean_cliff_01.png",
          },
          {
            key: "stamp",
            label: "CTA stamp",
            category: "ornamental",
            defaultSrc: "/images/home/cta_stamp_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Handwritten CTA text",
            defaultText: "let’s go somewhere beautiful",
          },
        ],
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
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Portfolio",
          title: "Photography shaped by movement, light and wild encounters.",
          description: "Explore a selection of visual stories from ocean, travel and nature.",
          imageSrc: "/images/portfolio/hero_landscape_01.png",
        },
        images: [
          {
            key: "background",
            label: "Hero background",
            category: "background",
            defaultSrc: "/images/portfolio/hero_landscape_01.png",
          },
          {
            key: "photo",
            label: "Hero photo",
            category: "photo",
            defaultSrc: "/images/portfolio/hero_portrait_01.png",
          },
        ],
      },
      {
        key: "gallery-intro",
        label: "Gallery intro",
        description: "Text displayed before the gallery or categories.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Selected work",
          title: "Visual stories",
          description: "Browse photography collections by mood, place and subject.",
        },
        images: [
          {
            key: "ornamental",
            label: "Gallery ornament",
            category: "ornamental",
            defaultSrc: "/images/admin/stamp_corner.png",
          },
        ],
      },
      {
        key: "final-cta",
        label: "Final CTA",
        description: "Final portfolio call to action.",
        fields: ["ctaLabel", "title"],
        defaults: {
          title: "Want to create a visual story together?",
          ctaLabel: "Contact us",
          ctaHref: "/contact",
        },
        images: [
          {
            key: "background",
            label: "CTA background",
            category: "background",
            defaultSrc: "/images/portfolio/cta_fond.png",
          },
        ],
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
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Stories",
          title: "Field notes, ocean encounters and wild memories.",
          description: "Read the stories behind the images.",
          imageSrc: "/images/stories/hero_fond.png",
        },
        images: [
          {
            key: "background",
            label: "Hero background",
            category: "background",
            defaultSrc: "/images/stories/hero_fond.png",
          },
          {
            key: "photo",
            label: "Hero photo",
            category: "photo",
            defaultSrc: "/images/stories/featured_elephants_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Handwritten text",
            defaultText: "field notes",
          },
        ],
      },
      {
        key: "archive-intro",
        label: "Archive intro",
        description: "Introduction above the story archive.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Journal",
          title: "Latest stories",
          description: "A collection of travel notes, wildlife encounters and visual essays.",
        },
        images: [
          {
            key: "ornamental",
            label: "Archive ornament",
            category: "ornamental",
            defaultSrc: "/images/admin/stamp_corner.png",
          },
        ],
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
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Videos",
          title: "Films from the ocean and the road.",
          description: "Short films, travel episodes and cinematic memories.",
          imageSrc: "/images/videos/hero_fond.png",
        },
        images: [
          {
            key: "background",
            label: "Hero background",
            category: "background",
            defaultSrc: "/images/videos/hero_fond.png",
          },
          {
            key: "photo",
            label: "Hero film still",
            category: "photo",
            defaultSrc: "/images/videos/featured_thailand_01.png",
          },
        ],
      },
      {
        key: "featured-film",
        label: "Featured film",
        description: "Featured video block introduction.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Featured film",
          title: "Latest episode",
          description: "A highlighted film from the collection.",
        },
        images: [
          {
            key: "photo",
            label: "Featured film poster",
            category: "photo",
            defaultSrc: "/images/videos/featured_thailand_01.png",
          },
        ],
      },
      {
        key: "collection-intro",
        label: "Collection intro",
        description: "Introduction above the video collection.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Collection",
          title: "All films",
          description: "Browse travel films, ocean films, recaps and behind the scenes.",
        },
        images: [
          {
            key: "ornamental",
            label: "Collection ornament",
            category: "ornamental",
            defaultSrc: "/images/admin/stamp_corner.png",
          },
        ],
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
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Client albums",
          title: "Your memories, beautifully preserved.",
          description: "Private galleries for clients, families, couples and brands.",
          imageSrc: "/images/client-albums/hero_fond.png",
        },
        images: [
          {
            key: "background",
            label: "Hero background",
            category: "background",
            defaultSrc: "/images/client-albums/hero_fond.png",
          },
          {
            key: "photo",
            label: "Hero client image",
            category: "photo",
            defaultSrc: "/images/client-albums/hero_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Handwritten text",
            defaultText: "for the moments that stay",
          },
        ],
      },
      {
        key: "intro",
        label: "Intro",
        description: "Introductory private gallery text.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Private & personal",
          title: "A gallery, just for you.",
          description: "A private space to download, share and cherish your images.",
        },
        images: [
          {
            key: "photoframe",
            label: "Intro photo frame",
            category: "photoframe",
            defaultSrc: "/images/client-albums/intro_01.png",
          },
        ],
      },
      {
        key: "access",
        label: "Access",
        description: "Password and access explanation.",
        fields: ["title", "description"],
        defaults: {
          title: "Access your private gallery",
          description: "Use your private password to enter your album.",
        },
        images: [
          {
            key: "background",
            label: "Access background",
            category: "background",
            defaultSrc: "/images/client-albums/access_fond.png",
          },
          {
            key: "photoframe",
            label: "Access card image",
            category: "photoframe",
            defaultSrc: "/images/client-albums/access_card.png",
          },
          {
            key: "iconPrivate",
            label: "Private gallery icon",
            category: "icons",
            defaultSrc: "/images/client-albums/access_icon_01.png",
          },
          {
            key: "iconDownload",
            label: "Download icon",
            category: "icons",
            defaultSrc: "/images/client-albums/access_icon_02.png",
          },
          {
            key: "iconShare",
            label: "Share icon",
            category: "icons",
            defaultSrc: "/images/client-albums/access_icon_03.png",
          },
        ],
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
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Contact",
          title: "Tell us about your next story.",
          description: "For visual projects, private galleries, travel work and creative collaborations.",
          imageSrc: "/images/contact/hero_fond.png",
        },
        images: [
          {
            key: "background",
            label: "Hero background",
            category: "background",
            defaultSrc: "/images/contact/hero_fond.png",
          },
          {
            key: "photo",
            label: "Contact visual",
            category: "photo",
            defaultSrc: "/images/contact/hero_01.png",
          },
        ],
      },
      {
        key: "form-intro",
        label: "Form intro",
        description: "Text above the contact form.",
        fields: ["title", "description"],
        defaults: {
          title: "Start the conversation",
          description: "Share a few details about your project and we will get back to you.",
        },
        images: [
          {
            key: "ornamental",
            label: "Form ornament",
            category: "ornamental",
            defaultSrc: "/images/admin/stamp_corner.png",
          },
        ],
      },
      {
        key: "details",
        label: "Contact details",
        description: "Email, location or practical contact information.",
        fields: ["title", "body"],
        defaults: {
          title: "Contact details",
          body: "Email, location and availability details can be edited here.",
        },
        images: [
          {
            key: "icons",
            label: "Contact icon",
            category: "icons",
            defaultSrc: "/images/contact/icon_01.png",
          },
        ],
      },
    ],
  },
];

export function getEditablePage(pageKey: string) {
  return editablePages.find((page) => page.key === pageKey);
}
