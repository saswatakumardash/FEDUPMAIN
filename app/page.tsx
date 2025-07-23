"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import Hero from "@/components/Hero"
import ChatDemo from "@/components/ChatDemo"
import AboutFedUp from "@/components/AboutFedUp"
import Difference from "@/components/Difference"
import Footer from "@/components/Footer"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, redirect to chat immediately
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      if (user && user.providerData[0]?.providerId === "google.com") {
        router.replace("/chat")
      }
    })

    return () => unsubscribe?.()
  }, [router])

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Logo */}
      <div className="fixed top-6 left-6 z-50">
        <img src="/fedup-logo.png" alt="FED UP" className="w-12 h-12" />
      </div>

      <main className="relative">
        <Hero />
        <ChatDemo />
        <AboutFedUp />
        <Difference />
        <Footer />
      </main>
    </div>
  )
}
