import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Excel Academy",
    template: "%s · Excel Academy",
  },
  description:
    "A hands-on, five-level Excel curriculum for professionals — from cell references and SUM to XLOOKUP, dynamic arrays, and macros. Practice in a live grid, offline, on any device.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Excel Academy",
  },
  // Next.js 15 stopped emitting the legacy "apple-mobile-web-app-capable" tag from
  // appleWebApp.capable (it now only emits the newer "mobile-web-app-capable").
  // iOS Safari doesn't yet honor the new tag for full-screen home-screen launches,
  // so we add the legacy one back explicitly. See vercel/next.js#74524.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7ef" },
    { media: "(prefers-color-scheme: dark)", color: "#141311" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
