"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Sparkles } from "lucide-react"
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default function WaitlistForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return;
    const submitted = localStorage.getItem("waitlist_submitted");
    if (submitted) setIsSubmitted(true);
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      // Check for duplicate email
      const q = query(collection(db, "waitlist"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError("This email is already on the waitlist.");
        setIsLoading(false);
        return;
      }
      await addDoc(collection(db, "waitlist"), { name, email, createdAt: new Date() });
      setIsSubmitted(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("waitlist_submitted", "1");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      // Removed auto-reset logic so thank you message persists
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#161b22] border border-[#238636] rounded-xl p-8 max-w-lg mx-auto text-center"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-semibold text-[#238636] mb-3">You're in! Welcome to the journey 💚</h3>
        <p className="text-gray-300">We'll reach out when it's time. Get ready for real support 🚀</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-lg mx-auto text-center"
    >
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8">
        {/* Emotional Header */}
        <div className="mb-6">
          <div className="text-5xl mb-4">💙</div>
          <h3 className="text-3xl font-bold text-white mb-3">Ready for Real Support?</h3>
          <p className="text-[#f85149] text-lg mb-2 font-semibold">Join the waitlist now — <span className="font-bold">30 early user spots left!</span> ⚡</p>
          <p className="text-gray-400">Early access to the first 30 people. No BS. No toxic optimism. Just truth and real help 💯</p>
        </div>

        {/* Emotional Benefits */}
        <div className="mb-6 space-y-2 text-left">
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-xl">🌙</span>
            <span>Available at 2 AM when you can't sleep</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-xl">💔</span>
            <span>Understands your pain without judgment</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-xl">🔥</span>
            <span>Gives you the truth you need to hear</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-xl">💪</span>
            <span>Helps you come back stronger</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-xl">📱</span>
            <span>For easy experience, an APK will also be provided.</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Your name (we'll remember you) 👋"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-gray-500 focus:border-[#7c3aed] h-12 text-center"
          />
          <Input
            type="email"
            placeholder="Your email (safe with us) 🔒"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-gray-500 focus:border-[#7c3aed] h-12 text-center"
          />

          {/* Emotional CTA Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#8b5cf6] hover:to-[#f472b6] text-white font-semibold py-4 h-14 rounded-lg transition-all duration-300 text-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                Joining the waitlist...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Join the Waitlist Now
              </span>
            )}
          </Button>
        </form>
        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
        {/* Urgency & Social Proof */}
        <div className="mt-6 space-y-2">
          <p className="text-[#f85149] font-medium">⚡ Early access to the first 30 people</p>
          <p className="text-gray-400 text-sm">Don't miss your spot for real support 🤝</p>
        </div>
      </div>
    </motion.div>
  )
}
