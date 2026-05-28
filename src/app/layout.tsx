import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://productpixl.com"),
  title: "ProductPixl — AI product imagery for marketplace sellers",
  description:
    "Upload one product photo. Get studio-quality listing images for Amazon, eBay, Etsy and EU marketplaces. No photoshoot. No designer.",
  openGraph: {
    title: "ProductPixl — AI product imagery for marketplace sellers",
    description:
      "Upload one product photo. Get studio-quality listing images for Amazon, eBay, Etsy and EU marketplaces. No photoshoot. No designer.",
    siteName: "ProductPixl",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProductPixl — AI product imagery for marketplace sellers",
    description:
      "Upload one product photo. Get studio-quality listing images for Amazon, eBay, Etsy and EU marketplaces.",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} antialiased`}>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
