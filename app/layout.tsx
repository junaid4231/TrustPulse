import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ UPDATE THIS:
export const metadata: Metadata = {
  title: "ProofPulse - Social Proof Widgets That Convert",
  description:
    "Increase conversions by 30% with real-time social proof notifications. Free during beta.",
  openGraph: {
    title: "ProofPulse - Social Proof Widgets",
    description:
      "Increase conversions by 30% with real-time social proof notifications",
    url: "https://proofpulse.vercel.app",
    siteName: "ProofPulse",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProofPulse",
    description: "Social proof widgets that actually convert",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        
        {/* ProofPulse Widget - For testing */}
        <Script
          src="http://localhost:3000/widget/widget.js"
          data-widget="e23aa8cb-5b75-4f1b-83e3-1eb7fbe63fad"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
