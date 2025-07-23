"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, Mail, User } from "lucide-react"
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useEffect, useRef } from "react"

interface UserData {
  uid: string
  name: string | null
  email: string | null
  photo: string | null
  provider: "google"
}

const TYPING_PHRASES = [
  "Real emotional support.",
  "No toxic optimism.",
  "Just truth and real help.",
  "Your bestfriend."
];

export default function WaitlistForm() {
  const [user, setUser] = useState<UserData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // State for the dynamic typing animation
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Typing animation effect
  useEffect(() => {
    const handleTyping = () => {
      const currentPhrase = TYPING_PHRASES[phraseIndex];
      const newText = isDeleting
        ? currentPhrase.substring(0, typingText.length - 1)
        : currentPhrase.substring(0, typingText.length + 1);

      setTypingText(newText);

      if (!isDeleting && newText === currentPhrase) {
        // Pause at the end of a phrase, then start deleting
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && newText === '') {
        setIsDeleting(false);
        // Move to the next phrase
        setPhraseIndex((prev) => (prev + 1) % TYPING_PHRASES.length);
      }
    };

    const typingSpeed = isDeleting ? 50 : 100;
    const timeout = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, phraseIndex]);

  // Check localStorage for user on mount and listen to auth changes
  React.useEffect(() => {
    if (typeof window === "undefined") return
    
    // Listen to auth state changes
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser && firebaseUser.providerData[0]?.providerId === 'google.com') {
          const userData: UserData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photo: firebaseUser.photoURL,
            provider: 'google'
          }
          setUser(userData)
          localStorage.setItem("fedup_user", JSON.stringify(userData))
        } else {
          // User is logged out or not Google, clear everything
          setUser(null)
          localStorage.removeItem("fedup_user")
        }
      })
      
      return () => unsubscribe()
    } else {
      // Fallback: check localStorage if auth is not available
      const saved = localStorage.getItem("fedup_user")
      if (saved) setUser(JSON.parse(saved))
    }
  }, [])

  // Send user data to backend
  const sendUserToBackend = async (userData: UserData) => {
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
    } catch (e) {
      // Ignore backend errors for now
    }
  }

  const handleLogin = async () => {
    setError(null)
    if (!auth) {
      setError("Auth service is not available. Please try again later.")
      return
    }
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const userData: UserData = {
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL,
        provider: "google",
      }
      localStorage.setItem("fedup_user", JSON.stringify(userData))
      sendUserToBackend(userData)
      
      // Immediate redirect to chat - no loading, no delays
      window.location.replace("/chat")
    } catch (e: any) {
      setError(e.message || "Login failed. Please try again.")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-lg mx-auto text-center"
    >
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8">
        <div className="mb-6">
          <div className="text-5xl mb-4">💙</div>
          <h3 className="text-3xl font-bold text-white mb-3">Welcome to FED UP</h3>
          <p className="text-[#f85149] text-lg mb-2 font-semibold">Get started instantly.</p>
          <p className="text-[#7c3aed] text-base min-h-[24px] font-mono h-6">{typingText}<span className="animate-ping">|</span></p>
          <p className="text-gray-400">Sign in to unlock your emotional AI support. No toxic optimism. Just truth and real help 💯</p>
        </div>
        <div className="flex flex-col gap-4 mt-8">
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#8b5cf6] hover:to-[#f472b6] text-white font-semibold py-4 h-14 rounded-lg transition-all duration-300 text-lg flex items-center justify-center gap-3"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 bg-white rounded-full" />
            Continue with Google
          </Button>
        </div>
        {error && <div className="text-red-500 mt-4 text-sm">{error}</div>}
      </div>
    </motion.div>
  )
}
