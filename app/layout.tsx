import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import BackgroundAnimation from "@/components/BackgroundAnimation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FED UP — For the Tired, the Lost, the Real",
  description: "An AI that listens, supports, and gives the truth. No filters. No toxic positivity.",
  keywords: "AI support, mental health, emotional AI, authentic conversations",
  openGraph: {
    title: "FED UP — For the Tired, the Lost, the Real",
    description: "An AI that listens, supports, and gives the truth. No filters. No toxic positivity.",
    url: "https://fedup.theallin.tech",
    siteName: "FED UP",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "FED UP Logo",
      },
    ],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  generator: 'v0.dev',
  twitter: {
    card: "summary",
    title: "FED UP — For the Tired, the Lost, the Real",
    description: "An AI that listens, supports, and gives the truth. No filters. No toxic positivity.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "FED UP Logo",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <BackgroundAnimation />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
