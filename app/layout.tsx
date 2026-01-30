import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Analytics } from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clips.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Clips - Replay Your Solana Trades for CT Content",
    template: "%s | Clips",
  },
  description: "Turn your memecoin trades into shareable chart replays. Paste transaction hashes, watch your entry and exit play back, and create content that goes viral on Crypto Twitter. Free forever.",
  keywords: ["solana", "chart replay", "trade videos", "memecoin", "content creation", "trading tool", "solana trading", "crypto content"],
  authors: [{ name: "Clips" }],
  creator: "Clips",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Clips",
    title: "Clips - Replay Your Solana Trades",
    description: "Hit a 10x but forgot to record? Replay any Solana trade with perfect entry/exit markers. Free forever.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clips - Chart Replay Video Tool for Solana Traders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clips - Replay Your Solana Trades",
    description: "Hit a 10x but forgot to record? Replay any Solana trade with perfect entry/exit markers. Free forever.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white min-h-screen`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
