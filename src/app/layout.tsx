import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site-url";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "ProductPixl — AI listing studio for Amazon sellers",
  description:
    "One product photo → Amazon gallery images and RUFUS-ready copy. Pay per generation. No ASIN required.",
  openGraph: {
    title: "ProductPixl — AI listing studio for Amazon sellers",
    description:
      "One product photo → Amazon gallery images and RUFUS-ready copy. Pay per generation. No ASIN required.",
    siteName: "ProductPixl",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProductPixl — AI listing studio for Amazon sellers",
    description:
      "One product photo → Amazon gallery images and RUFUS-ready copy. Pay per generation. No ASIN required.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${instrument.variable} antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--ink)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
