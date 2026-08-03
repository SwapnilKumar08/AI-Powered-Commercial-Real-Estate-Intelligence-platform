import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const owner = process.env.GITHUB_REPOSITORY_OWNER ?? "SwapnilKumar08";
const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPagesBuild && repository ? `/${repository}` : "";
const siteUrl = isGitHubPagesBuild && repository
  ? `https://${owner}.github.io/${repository}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Landmark-AI-Data-Search — Commercial real estate intelligence",
  description:
    "Evidence-backed market intelligence, property research, geospatial forecasting and responsible deal origination.",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
  openGraph: {
    title: "Landmark-AI-Data-Search — See the market before it moves",
    description:
      "A commercial real estate intelligence workspace powered by hybrid RAG, a property knowledge graph and spatiotemporal forecasting.",
    type: "website",
    images: [`${basePath}/og.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Landmark-AI-Data-Search — Commercial real estate intelligence",
    description:
      "Research properties, forecast market movement and trace every insight to evidence.",
    images: [`${basePath}/og.png`],
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
      </body>
    </html>
  );
}
