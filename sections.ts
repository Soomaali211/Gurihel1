// Qaybaha Admin-ka (WP9). Slug kasta wuxuu leeyahay bog "ku soo socota" ilaa la dhiso.
export const SECTIONS = [
  { slug: "listings", label: "Listings", wp: "WP3 / WP9.3" },
  { slug: "approvals", label: "Approvals", wp: "WP3 / WP9.3" },
  { slug: "users", label: "Users", wp: "WP2 / WP9.4" },
  { slug: "brokers", label: "Brokers & Companies", wp: "WP2 / WP9.4" },
  { slug: "projects", label: "Projects", wp: "WP6 / WP9.5" },
  { slug: "bookings", label: "Bookings", wp: "WP7 / WP9.6" },
  { slug: "payments", label: "Payments", wp: "WP7 / WP9.6" },
  { slug: "subscriptions", label: "Subscriptions", wp: "WP8 / WP9.7" },
  { slug: "reports", label: "Reports", wp: "WP9.9" },
  { slug: "settings", label: "Settings", wp: "WP9.8" },
] as const;

export type SectionSlug = (typeof SECTIONS)[number]["slug"];
