import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import BackgroundAnimation from "@/components/BackgroundAnimation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FED UP – AI for the emotionally tired",
  description: "A supportive, emotionally intelligent AI for when you’re fed up. Join the waitlist for early access.",
  openGraph: {
    title: "FED UP – AI for the emotionally tired",
    description: "A supportive, emotionally intelligent AI for when you’re fed up. Join the waitlist for early access.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "FED UP Logo",
      },
    ],
    type: "website",
    siteName: "FED UP",
  },
  twitter: {
    card: "summary_large_image",
    title: "FED UP – AI for the emotionally tired",
    description: "A supportive, emotionally intelligent AI for when you’re fed up. Join the waitlist for early access.",
    images: [
      {
        url: "/icon.png",
        alt: "FED UP Logo",
      },
    ],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta property="og:image" content="/icon.png" />
        <meta name="twitter:image" content="/icon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <BackgroundAnimation />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
