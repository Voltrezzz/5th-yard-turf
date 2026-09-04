import type { Metadata } from "next";
import { Montserrat, Oswald } from "next/font/google";
import "aos/dist/aos.css";
import "./globals.css";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AOSProvider } from "@/components/ui/AOSProvider";
import { MouseGlow } from "@/components/ui/MouseGlow";
import { Toast } from "@/components/ui/Toast";
import { siteConfig } from "@/lib/site-config";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${oswald.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-screen flex-col bg-brand-dark font-sans text-brand-white antialiased">
        <AOSProvider />
        <Navbar />
        <main className="flex-1 pt-[5.75rem]">{children}</main>
        <Footer />
        <MouseGlow />
        <Toast />
      </body>
    </html>
  );
}
