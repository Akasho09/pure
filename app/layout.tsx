import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/layout/AuthProvider"
import { AppShell } from "@/components/layout/AppShell"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: {
    default: "Masjid Shareef Waripora",
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
  publisher: "Masjid Shareef Waripora",
  robots: "index, follow",
  icons: { icon: "/ak3.png" },


  twitter: {
    card: "summary_large_image",
    title: "Masjid Shareef Waripora",
    description:
      "Track donations, manage families, and handle masjid finances seamlessly.",
    images: ["https://waripora.vercel.app/masjid-icon.jpg"],
    creator: "@your_twitter", // optional
  },

openGraph: {
  title: "Masjid Shareef Waripora",
  description:
    "Manage masjid finances, families, donations and contributions with ease.",
  url: "https://waripora.vercel.app",
  siteName: "Masjid Shareef Waripora",
  images: [
    {
      url: "https://waripora.vercel.app/image.png", // ✅ FIXED
      width: 1200,
      height: 630,
      alt: "Masjid Shareef Waripora Dashboard",
    },
  ],
  locale: "en_US",
  type: "website",
},
};

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
      <Analytics></Analytics>
      <body className="max-w-screen ">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}