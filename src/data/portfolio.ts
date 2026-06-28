const asset = (name: string) => ({
  src: `/images/portfolio/${name}`,
  label: name,
});

export const portfolioImages = {
  hero: asset("hero_fond.png"),
  heroElephants: asset("hero_elephants_01.png"),
  heroOcean: asset("hero_ocean_01.png"),
  heroLandscape: asset("hero_landscape_01.png"),
  newsletterFond: asset("newsletter_fond.png"),
  newsletterLeopard: asset("newsletter_leopard_01.png"),
  newsletterBird: asset("newsletter_bird_01.png"),
};

export const featuredImages = [
  asset("featured_elephants_01.png"),
  asset("featured_bird_01.png"),
  asset("featured_monkey_01.png"),
  asset("featured_chameleon_01.png"),
  asset("featured_antelope_01.png"),
  asset("featured_gecko_01.png"),
];

export const recentImages = [
  asset("recent_giraffes_01.png"),
  asset("recent_lion_01.png"),
  asset("recent_rhino_01.png"),
  asset("recent_leopard_01.png"),
];
