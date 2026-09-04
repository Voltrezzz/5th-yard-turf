import type { Metadata } from "next";

import { TurfGallery } from "@/components/turf/TurfGallery";
import { TurfSpecs } from "@/components/turf/TurfSpecs";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "The Arena",
  description: `Explore ${siteConfig.name}: ${siteConfig.turf.surface}, ${siteConfig.turf.lighting}, and a match-ready venue for ${siteConfig.turf.sports.join(" and ")}.`,
  openGraph: {
    title: `The Arena | ${siteConfig.name}`,
    description: `Explore the premium 4G playing surface, floodlights, facilities, and match-day experience at ${siteConfig.name}.`,
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `The Arena | ${siteConfig.name}`,
    description: `Explore the premium 4G playing surface, floodlights, facilities, and match-day experience at ${siteConfig.name}.`,
    images: ["/og.png"],
  },
};

export default function TurfPage() {
  return (
    <>
      <TurfGallery />
      <TurfSpecs />
    </>
  );
}
