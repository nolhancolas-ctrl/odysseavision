const asset = (name: string) => ({
  src: `/images/videos/${name}`,
  label: name,
});

export const videosImages = {
  hero: asset("hero_fond.png"),
  heroCoast: asset("hero_coast_01.png"),
  heroTurtle: asset("hero_turtle_01.png"),
  heroRoadtrip: asset("hero_roadtrip_01.png"),
  featuredPoster: asset("featured_thailand_01.png"),
  inspiration01: asset("inspiration_01.png"),
  inspiration02: asset("inspiration_02.png"),
  inspiration03: asset("inspiration_03.png"),
  inspiration04: asset("inspiration_04.png"),
  inspiration05: asset("inspiration_05.png"),
  ctaFond: asset("cta_fond.png"),
  ctaDuo: asset("cta_duo_01.png"),
};

export const videoCategories = [
  "All films",
  "Travel films",
  "Ocean films",
  "Recaps",
  "Behind the scenes",
];

export const featuredFilm = {
  title: "Thailand episode 1",
  description:
    "Island life, underwater encounters and the beauty of slowing down.",
  poster: videosImages.featuredPoster.src,
  video: "/videos/thailand_episode_01.mp4",
};

export const videos = [
  {
    slug: "thailand-episode-1",
    title: "Thailand episode 1",
    category: "Travel films",
    description: "The first chapter of our Thailand series. Island hopping and ocean life.",
    image: asset("film_thailand_01.png"),
    duration: "06:48",
  },
  {
    slug: "indonesia-recap",
    title: "Indonesia recap",
    category: "Recaps",
    description: "Highlights from our months in Indonesia. Diving, wildlife and hidden gems.",
    image: asset("film_indonesia_01.png"),
    duration: "04:21",
  },
  {
    slug: "ocean",
    title: "Ocean",
    category: "Ocean films",
    description: "A tribute to the ocean and all the creatures we love.",
    image: asset("film_ocean_01.png"),
    duration: "05:37",
  },
  {
    slug: "whales-western-australia",
    title: "Whales of Western Australia",
    category: "Ocean films",
    description: "Humpback whales in the wild. A magical season in the west.",
    image: asset("film_whales_01.png"),
    duration: "03:58",
  },
  {
    slug: "australia-road-trip",
    title: "Australia road trip",
    category: "Travel films",
    description: "Dusty roads, national parks and endless horizons.",
    image: asset("film_roadtrip_01.png"),
    duration: "07:12",
  },
  {
    slug: "behind-the-lens",
    title: "Behind the lens",
    category: "Behind the scenes",
    description: "A look behind the scenes of our photo and video adventures.",
    image: asset("film_behind_lens_01.png"),
    duration: "02:45",
  },
];
