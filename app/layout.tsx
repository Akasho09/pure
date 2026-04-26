import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/layout/AuthProvider"
import { AppShell } from "@/components/layout/AppShell"

export const metadata: Metadata = {
  metadataBase: new URL("https://waripora.vercel.app"), // 🔥 change this

  title: {
    default: "Masjid Committee Management System",
    template: "%s | Waripora Masjid ",
  },

  description:
    "A modern system to manage masjid finances, families, donations, and monthly contributions efficiently.",

  keywords: [
    "Masjid management",
    "Mosque finance system",
    "Donation tracker",
    "Community management",
    "Islamic app",
  ],

  authors: [{ name: "Akash Malik" }],

  creator: "Akash Malik",
  publisher: "Masjid CMS",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    title: "Masjid Committee Management System",
    description:
      "Manage masjid finances, families, donations and contributions with ease.",
    url: "https://your-domain.com",
    siteName: "Masjid CMS",
    images: [
      {
        url: "/masjid-icon.jpg", // 🔥 create this width: 1200,
        height: 630,
        alt: "Masjid CMS Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Masjid Committee Management System",
    description:
      "Track donations, manage families, and handle masjid finances seamlessly.",
    images: ["/og-image.png"],
    creator: "@your_twitter", // optional
  },

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://your-domain.com",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=0.7, maximum-scale=0.7"
        />
      </head>

      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}