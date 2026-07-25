import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${protocol}://${host}` : "https://localhost";
  const socialImage = `${origin}/og.png`;
  return {
    metadataBase: new URL(origin),
    title: "Landmark AI — Commercial real estate intelligence",
    description:
      "Evidence-backed market intelligence, property research, geospatial forecasting and responsible deal origination.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Landmark AI — See the market before it moves",
      description:
        "A commercial real estate intelligence workspace powered by hybrid RAG, a property knowledge graph and spatiotemporal forecasting.",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: "Landmark AI — Commercial real estate intelligence",
      description:
        "Research properties, forecast market movement and trace every insight to evidence.",
      images: [socialImage],
    },
  };
}

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
      </body>
    </html>
  );
}
