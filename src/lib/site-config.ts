export const siteConfig = {
  name: "5TH YARD TURF",
  tagline: "Premium Football & Cricket Arena",
  description:
    "The City's Premier Football & Cricket Arena. Premium 4G Turf. Pure Adrenaline.",
  copyrightYear: 2026,

  bottomGalleryImages: [
    { src: "/assets/media_1788502538677.jpg", alt: "Trophy-winning football team at 5th Yard Turf" },
    { src: "/assets/media_1788502538683.jpg", alt: "Football team celebrating together under the arena lights" },
    { src: "/assets/media_1788502538689.jpg", alt: "Two dogs relaxing beside the goal on 5th Yard Turf" },
    { src: "/assets/media_1788502538698.jpg", alt: "Tournament winners holding their trophy under the floodlights" },
    { src: "/assets/media_1788502538710.jpg", alt: "Football squad posing with trophies at 5th Yard Turf" },
  ],

  contact: {
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    mapUrl: "",
  },

  turf: {
    dimensions: "",
    surface: "Premium 4G Artificial Synthetic Grass",
    lighting: "500-lux Anti-Glare LED Floodlights",
    sports: ["Football", "Cricket"],
    facilities: [
      "On-site Parking",
      "Washrooms & Changing Rooms",
      "Spectator Seating with Mesh Protection",
      "First-Aid Kit",
    ],
  },

  booking: {
    openHour: 9,
    closeHour: 22,
    chunkMinutes: 30,
    holdDurationMinutes: 10,
    checkoutTimeoutSeconds: 480,
    maxDurationMinutes: 120,
    minDurationMinutes: 60,
    daysInAdvance: 30,
    cancellationPolicy:
      "The booking advance is non-refundable when a confirmed booking is cancelled.",
  },

  pricing: {
    weekday: { baseRate: 1100, extensionRate: 550 },
    weekend: { baseRate: 1300, extensionRate: 650 },
    advanceAmount: 500,
  },

  social: {
    instagram: "",
    facebook: "",
  },
} as const;
