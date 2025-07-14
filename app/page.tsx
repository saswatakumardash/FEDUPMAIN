"use client"
import Hero from "@/components/Hero"
import ChatDemo from "@/components/ChatDemo"
import AboutFedUp from "@/components/AboutFedUp"
import Difference from "@/components/Difference"
import Footer from "@/components/Footer"

export default function Home() {
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
