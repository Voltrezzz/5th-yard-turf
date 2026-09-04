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
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${oswald.variable}`}>
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
