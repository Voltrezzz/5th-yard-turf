import type { Metadata } from "next";

import { AboutSection } from "@/components/home/AboutSection";
import { BottomGalleryMarquee } from "@/components/home/BottomGalleryMarquee";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { GalleryMarquee } from "@/components/home/GalleryMarquee";
import { HeroSection } from "@/components/home/HeroSection";
import { PricingSection } from "@/components/home/PricingSection";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Premium Football & Cricket Arena",
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/og.png"],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <PricingSection />
      <GalleryMarquee />
      <BottomGalleryMarquee />
    </>
  );
}
