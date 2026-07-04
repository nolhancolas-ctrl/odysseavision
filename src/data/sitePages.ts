export type EditableFieldKey =
  | "ctaLabel"
  | "eyebrow"
  | "title"
  | "description"
  | "body"
  | "andrewDescription"
  | "morganeDescription"
  | "featuredVideoMode"
  | "featuredVideoId";

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
    featuredVideoMode?: string;
    featuredVideoId?: string;
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
    description: "Portfolio landing page, hero copy, galleries and visual sections.",
    sections: [
      {
        key: "hero",
        label: "Hero",
        description: "Top section of the Portfolio page with background, framed photos and handwritten text.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Portfolio",
          title: "Capturing wild beauty.",
          description:
            "A collection of our favorite moments from land and sea. Each image tells a story of wonder, respect and connection.",
          imageSrc: "/images/portfolio/hero_fond.png",
        },
        images: [
          {
            key: "background",
            label: "Hero background",
            category: "background",
            defaultSrc: "/images/portfolio/hero_fond.png",
          },
          {
            key: "heroElephants",
            label: "Hero elephants frame",
            category: "photoframe",
            defaultSrc: "/images/portfolio/hero_elephants_01.png",
          },
          {
            key: "heroOcean",
            label: "Hero ocean frame",
            category: "photoframe",
            defaultSrc: "/images/portfolio/hero_ocean_01.png",
          },
          {
            key: "heroLandscape",
            label: "Hero landscape frame",
            category: "photoframe",
            defaultSrc: "/images/portfolio/hero_landscape_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Hero handwritten text",
            defaultText: "see the world differently",
          },
        ],
      },
      {
        key: "categories",
        label: "Categories",
        description: "Portfolio category carousel intro.",
        fields: ["eyebrow"],
        defaults: {
          eyebrow: "Explore our categories",
        },
      },
      {
        key: "live-gallery",
        label: "Live gallery",
        description: "Admin-powered portfolio gallery introduction.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Published from admin",
          title: "Latest frames",
          description:
            "This gallery now reads published portfolio items from the admin platform.",
        },
      },
      {
        key: "featured",
        label: "Featured gallery",
        description: "Featured visual mosaic section.",
        fields: ["ctaLabel", "eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Featured gallery",
          title: "Wildlife",
          description:
            "Quiet encounters, fleeting moments and a deep respect for all living creatures.",
          ctaLabel: "View full gallery",
          ctaHref: "/portfolio/wildlife",
        },
        images: [
          {
            key: "featured01",
            label: "Featured image 1",
            category: "photo",
            defaultSrc: "/images/portfolio/featured_elephants_01.png",
          },
          {
            key: "featured02",
            label: "Featured image 2",
            category: "photo",
            defaultSrc: "/images/portfolio/featured_bird_01.png",
          },
          {
            key: "featured03",
            label: "Featured image 3",
            category: "photo",
            defaultSrc: "/images/portfolio/featured_monkey_01.png",
          },
          {
            key: "featured04",
            label: "Featured image 4",
            category: "photo",
            defaultSrc: "/images/portfolio/featured_chameleon_01.png",
          },
          {
            key: "featured05",
            label: "Featured image 5",
            category: "photo",
            defaultSrc: "/images/portfolio/featured_antelope_01.png",
          },
          {
            key: "featured06",
            label: "Featured image 6",
            category: "photo",
            defaultSrc: "/images/portfolio/featured_gecko_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Featured handwritten text",
            defaultText: "The best wildlife moments are the ones you never planned.",
          },
        ],
      },
      {
        key: "recent",
        label: "Recent shots",
        description: "Recent image grid section.",
        fields: ["ctaLabel", "eyebrow"],
        defaults: {
          eyebrow: "Recent shots from the wild",
          ctaLabel: "View more on Instagram",
        },
        images: [
          {
            key: "recent01",
            label: "Recent image 1",
            category: "photo",
            defaultSrc: "/images/portfolio/recent_giraffes_01.png",
          },
          {
            key: "recent02",
            label: "Recent image 2",
            category: "photo",
            defaultSrc: "/images/portfolio/recent_lion_01.png",
          },
          {
            key: "recent03",
            label: "Recent image 3",
            category: "photo",
            defaultSrc: "/images/portfolio/recent_rhino_01.png",
          },
          {
            key: "recent04",
            label: "Recent image 4",
            category: "photo",
            defaultSrc: "/images/portfolio/recent_leopard_01.png",
          },
        ],
      },
      {
        key: "newsletter",
        label: "Newsletter",
        description: "Newsletter call-to-action section.",
        fields: ["ctaLabel", "title"],
        defaults: {
          title: "Stay inspired",
          ctaLabel: "Subscribe",
          imageSrc: "/images/portfolio/newsletter_fond.png",
        },
        images: [
          {
            key: "background",
            label: "Newsletter background",
            category: "background",
            defaultSrc: "/images/portfolio/newsletter_fond.png",
          },
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
            label: "Newsletter stamp",
            category: "ornamental",
            defaultSrc: "/images/home/cta_stamp_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Newsletter handwritten subtitle",
            defaultText: "stories, new photos & adventures",
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
        description: "Top section of the Stories page with background, framed photos and ornaments.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Our stories",
          title: "Tales from the road & sea",
          description:
            "Stories, reflections and raw moments from our travels. From wildlife encounters to conservation, photography and life on the road.",
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
            key: "heroWhale",
            label: "Left whale frame",
            category: "photoframe",
            defaultSrc: "/images/stories/hero_whale_01.png",
          },
          {
            key: "heroManta",
            label: "Left manta frame",
            category: "photoframe",
            defaultSrc: "/images/stories/hero_manta_01.png",
          },
          {
            key: "heroElephants",
            label: "Right elephants frame",
            category: "photoframe",
            defaultSrc: "/images/stories/hero_elephants_01.png",
          },
          {
            key: "drawing",
            label: "Hero drawing",
            category: "drawing",
            defaultSrc: "/images/stories/hero_drawing_01.png",
          },
          {
            key: "stamp",
            label: "Hero stamp",
            category: "ornamental",
            defaultSrc: "/images/stories/hero_stamp_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Hero handwritten text",
            defaultText: "stories worth sharing",
          },
        ],
      },
      {
        key: "archive",
        label: "Archive",
        description: "Story archive controls and editorial listing.",
        fields: ["eyebrow", "ctaLabel"],
        defaults: {
          eyebrow: "Browse by category",
          ctaLabel: "Load more stories",
        },
        images: [
          {
            key: "ornament",
            label: "Archive drawing ornament",
            category: "ornamental",
            defaultSrc: "/images/about/hero_drawing_01.png",
          },
        ],
      },
      {
        key: "newsletter",
        label: "Newsletter",
        description: "Newsletter call-to-action section.",
        fields: ["ctaLabel", "title"],
        defaults: {
          title: "Stay inspired",
          ctaLabel: "Subscribe",
          imageSrc: "/images/portfolio/newsletter_fond.png",
        },
        images: [
          {
            key: "background",
            label: "Newsletter background",
            category: "background",
            defaultSrc: "/images/portfolio/newsletter_fond.png",
          },
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
            label: "Newsletter stamp",
            category: "ornamental",
            defaultSrc: "/images/home/cta_stamp_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Newsletter handwritten subtitle",
            defaultText: "stories, new photos & adventures",
          },
        ],
      },
    ],
  },
  {
    key: "videos",
    title: "Videos",
    href: "/videos",
    description: "Films page with hero, featured film, video collection, inspiration and final CTA.",
    sections: [
      {
        key: "hero",
        label: "Hero",
        description: "Top section of the Videos page with background, framed photos and intro text.",
        fields: ["ctaLabel", "eyebrow", "title", "description"],
        defaults: {
          ctaLabel: "Watch our films →",
          eyebrow: "Our films",
          title: "Films from the road.",
          description:
            "Short films, travel recaps and visual stories from land and sea. Cinematic moments, real emotions, wild places.",
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
            key: "heroCoast",
            label: "Coast photo frame",
            category: "photoframe",
            defaultSrc: "/images/videos/hero_coast_01.png",
          },
          {
            key: "heroTurtle",
            label: "Turtle photo frame",
            category: "photoframe",
            defaultSrc: "/images/videos/hero_turtle_01.png",
          },
          {
            key: "heroRoadtrip",
            label: "Roadtrip photo frame",
            category: "photoframe",
            defaultSrc: "/images/videos/hero_roadtrip_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Hero handwritten text",
            defaultText: "collect moments,\nnot things.",
          },
        ],
      },
      {
        key: "featured-film",
        label: "Featured film",
        description:
          "Automatically display the latest uploaded Vimeo video or select a specific uploaded video.",
        fields: [],
        defaults: {},
      },
      {
        key: "collection",
        label: "Collection",
        description: "Video archive heading and category filter area.",
        fields: ["eyebrow", "title"],
        defaults: {
          eyebrow: "Explore more films",
          title: "Our collection",
        },
      },
      {
        key: "inspiration",
        label: "Inspiration",
        description: "Editorial section with image strip and CTA.",
        fields: ["ctaLabel", "eyebrow", "title", "description"],
        defaults: {
          ctaLabel: "Follow our journey →",
          eyebrow: "What inspires us",
          title: "Stories, places & people.",
          description:
            "We love creating films that bring you closer to the wild places we explore and the stories that deserve to be told.",
        },
        images: [
          {
            key: "image01",
            label: "Inspiration image 01",
            category: "photo",
            defaultSrc: "/images/videos/inspiration_01.png",
          },
          {
            key: "image02",
            label: "Inspiration image 02",
            category: "photo",
            defaultSrc: "/images/videos/inspiration_02.png",
          },
          {
            key: "image03",
            label: "Inspiration image 03",
            category: "photo",
            defaultSrc: "/images/videos/inspiration_03.png",
          },
          {
            key: "image04",
            label: "Inspiration image 04",
            category: "photo",
            defaultSrc: "/images/videos/inspiration_04.png",
          },
          {
            key: "image05",
            label: "Inspiration image 05",
            category: "photo",
            defaultSrc: "/images/videos/inspiration_05.png",
          },
        ],
      },
      {
        key: "final-cta",
        label: "Final CTA",
        description: "Bottom call-to-action section.",
        fields: ["ctaLabel", "title", "description"],
        defaults: {
          ctaLabel: "Get in touch →",
          title: "Love visual storytelling?",
          description: "Let’s create something beautiful together.",
          imageSrc: "/images/videos/cta_fond.png",
        },
        images: [
          {
            key: "background",
            label: "CTA background",
            category: "background",
            defaultSrc: "/images/videos/cta_fond.png",
          },
          {
            key: "stamp",
            label: "CTA stamp",
            category: "ornamental",
            defaultSrc: "/images/videos/cta_stamp_01.png",
          },
          {
            key: "duo",
            label: "Duo photo frame",
            category: "photoframe",
            defaultSrc: "/images/videos/cta_duo_01.png",
          },
          {
            key: "leaf",
            label: "Leaf ornament",
            category: "ornamental",
            defaultSrc: "/images/videos/cta_leaf_01.png",
          },
        ],
      },
    ],
  },
  {
    key: "client-albums",
    title: "Client Albums",
    href: "/client-albums",
    description:
      "Private gallery landing page with hero, intro, recent albums, secure access and final CTA.",
    sections: [
      {
        key: "hero",
        label: "Hero",
        description:
          "Top section of the Client Albums page with background, framed photos and handwritten note.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Client albums",
          title: "Your memories, beautifully preserved.",
          description:
            "Private galleries for our incredible clients. Relive your adventures and share your moments with the people who matter most.",
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
            key: "hero01",
            label: "Left photo frame",
            category: "photoframe",
            defaultSrc: "/images/client-albums/hero_01.png",
          },
          {
            key: "hero02",
            label: "Small photo frame",
            category: "photoframe",
            defaultSrc: "/images/client-albums/hero_02.png",
          },
          {
            key: "stamp",
            label: "Hero stamp",
            category: "ornamental",
            defaultSrc: "/images/client-albums/hero_stamp_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Hero handwritten text",
            defaultText: "for the moments that stay",
          },
        ],
      },
      {
        key: "intro",
        label: "Intro",
        description:
          "Introductory section explaining the purpose of private galleries.",
        fields: ["ctaLabel", "eyebrow", "title", "description"],
        defaults: {
          ctaLabel: "How it works",
          eyebrow: "Private & personal",
          title: "A gallery, just for you.",
          description:
            "Whether it’s an elopement, a family adventure, a brand project or an unforgettable experience, your gallery is a space to download, share and cherish.",
        },
        images: [
          {
            key: "photo",
            label: "Intro photo",
            category: "photo",
            defaultSrc: "/images/client-albums/intro_01.png",
          },
        ],
      },
      {
        key: "recent",
        label: "Recent albums",
        description:
          "Recent published client albums from the Albums manager.",
        fields: ["ctaLabel", "eyebrow", "title", "description"],
        defaults: {
          ctaLabel: "Contact us",
          eyebrow: "Recent client albums",
          title: "Can’t find your gallery?",
          description: "Send us a message and we’ll help you out.",
        },
        images: [
          {
            key: "ornament",
            label: "Background ornament",
            category: "ornamental",
            defaultSrc: "/images/about/ocean_icon_04.png",
          },
        ],
      },
      {
        key: "access",
        label: "Secure access",
        description:
          "Access information section with feature list and password card.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Easy & secure access",
          title: "Your gallery, your way.",
          description:
            "Each gallery is designed to be simple, private and easy to share with the people who matter most.",
          imageSrc: "/images/client-albums/access_fond.png",
        },
        images: [
          {
            key: "background",
            label: "Access background",
            category: "background",
            defaultSrc: "/images/client-albums/access_fond.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Access card handwritten text",
            defaultText: "access your\ngallery",
          },
        ],
      },
      {
        key: "final-cta",
        label: "Final CTA",
        description:
          "Bottom call-to-action section for new projects.",
        fields: ["ctaLabel", "title", "description"],
        defaults: {
          ctaLabel: "Let’s connect",
          title: "Have a project in mind?",
          description: "Let’s create something unforgettable together.",
          imageSrc: "/images/client-albums/cta_fond.png",
        },
        images: [
          {
            key: "background",
            label: "CTA background",
            category: "background",
            defaultSrc: "/images/client-albums/cta_fond.png",
          },
          {
            key: "whale",
            label: "CTA whale frame",
            category: "photoframe",
            defaultSrc: "/images/client-albums/cta_01.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "CTA handwritten text",
            defaultText: "we’re here\nfor you!",
          },
        ],
      },
    ],
  },
  {
    key: "contact",
    title: "Contact",
    href: "/contact",
    description:
      "Contact page with hero, services, contact form, details panel and newsletter.",
    sections: [
      {
        key: "hero",
        label: "Hero",
        description:
          "Top section of the Contact page with background, framed photos and handwritten note.",
        fields: ["eyebrow", "title", "description"],
        defaults: {
          eyebrow: "Contact",
          title: "Let’s create something beautiful.",
          description:
            "Whether it’s a film, a private gallery, a wild adventure or a simple hello, we’d love to hear your story.",
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
            key: "hero01",
            label: "Large hero photo",
            category: "photoframe",
            defaultSrc: "/images/contact/hero_01.png",
          },
          {
            key: "hero02",
            label: "Small hero photo",
            category: "photoframe",
            defaultSrc: "/images/contact/hero_02.png",
          },
        ],
        drawings: [
          {
            key: "handwritten",
            label: "Hero handwritten text",
            defaultText: "stories begin with hello",
          },
        ],
      },
      {
        key: "services",
        label: "Services",
        description:
          "Services section with decorative photos and portfolio call-to-action.",
        fields: ["ctaLabel", "eyebrow", "title", "description"],
        defaults: {
          ctaLabel: "View portfolio",
          eyebrow: "What we do",
          title: "How can we work together?",
          description:
            "Photography, videography and collaborations for stories from land and sea.",
        },
        images: [
          {
            key: "leftTall",
            label: "Left tall photo",
            category: "photoframe",
            defaultSrc: "/images/contact/services_left_01.png",
          },
          {
            key: "leftSmall",
            label: "Left small photo",
            category: "photoframe",
            defaultSrc: "/images/contact/services_left_02.png",
          },
          {
            key: "rightTall",
            label: "Right tall photo",
            category: "photoframe",
            defaultSrc: "/images/contact/services_right_01.png",
          },
          {
            key: "rightSmall",
            label: "Right small photo",
            category: "photoframe",
            defaultSrc: "/images/contact/services_right_02.png",
          },
        ],
      },
      {
        key: "form",
        label: "Contact form",
        description:
          "Main contact form and dark contact information panel.",
        fields: ["ctaLabel", "eyebrow", "title", "description", "body"],
        defaults: {
          ctaLabel: "Send message",
          eyebrow: "Send us a message",
          title: "Tell us about your project",
          description: "We’ll do our best to get back to you within 48 hours.",
          body:
            "We believe in real connections,\nwild places and telling\nstories that matter.",
        },
        images: [
          {
            key: "ornament",
            label: "Form background ornament",
            category: "ornamental",
            defaultSrc: "/images/about/hero_drawing_01.png",
          },
          {
            key: "photo",
            label: "Contact panel photo",
            category: "photoframe",
            defaultSrc: "/images/contact/form_01.png",
          },
        ],
        drawings: [
          {
            key: "panelEyebrow",
            label: "Contact panel eyebrow",
            defaultText: "Get in touch",
          },
        ],
      },
      {
        key: "newsletter",
        label: "Newsletter",
        description:
          "Newsletter subscription section with image strip.",
        fields: ["ctaLabel", "title", "description"],
        defaults: {
          ctaLabel: "Subscribe",
          title: "Stay inspired",
          description:
            "Join our mailing list for new stories, photos and behind the scenes.",
        },
        images: [
          {
            key: "image01",
            label: "Newsletter image 01",
            category: "photo",
            defaultSrc: "/images/contact/newsletter_01.png",
          },
          {
            key: "image02",
            label: "Newsletter image 02",
            category: "photo",
            defaultSrc: "/images/contact/newsletter_02.png",
          },
          {
            key: "image03",
            label: "Newsletter image 03",
            category: "photo",
            defaultSrc: "/images/contact/newsletter_03.png",
          },
          {
            key: "image04",
            label: "Newsletter image 04",
            category: "photo",
            defaultSrc: "/images/contact/newsletter_04.png",
          },
        ],
      },
    ],
  },
];

export function getEditablePage(pageKey: string) {
  return editablePages.find((page) => page.key === pageKey);
}
