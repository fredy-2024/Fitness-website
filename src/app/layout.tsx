import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "ZenFit Elite | High-Performance Fitness Platform",
  description:
    "Premium fitness coaching, personalized training plans, and advanced progress tracking for serious results.",
  keywords: ["fitness", "workouts", "personal training", "strength", "nutrition"],
  openGraph: {
    title: "ZenFit Elite",
    description:
      "Premium training programs and athlete-grade progress tools in one platform.",
    siteName: "ZenFit Elite",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
