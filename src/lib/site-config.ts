export const siteConfig = {
  name: "5TH YARD TURF",
  tagline: "Premium Football & Cricket Arena",
  description:
    "The City's Premier Football & Cricket Arena. Premium 4G Turf. Pure Adrenaline.",
  copyrightYear: 2026,

  bottomGalleryImages: [
    { src: "/assets/media_1788502538677.jpg", alt: "5th Yard Turf Night Match" },
    { src: "/assets/media_1788502538683.jpg", alt: "5th Yard Turf Team Photo" },
    { src: "/assets/media_1788502538689.jpg", alt: "5th Yard Turf Pets on Field" },
    { src: "/assets/media_1788502538698.jpg", alt: "5th Yard Turf Trophy Celebration" },
    { src: "/assets/media_1788502538710.jpg", alt: "5th Yard Turf Night Tournament" },
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
