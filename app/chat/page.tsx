"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MainChat from "@/components/MainChat"
import EmotionalBackground from "@/components/EmotionalBackground"
import { auth } from "@/lib/firebase"

interface UserData {
  uid: string
  name: string | null
  email: string | null
  photo: string | null
  provider: "google"
}

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      router.replace("/")
      return
    }

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser || firebaseUser.providerData[0]?.providerId !== "google.com") {
        setIsLoading(false)
        router.replace("/")
      } else {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
          provider: "google",
        })
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    try {
      localStorage.removeItem("fedup_user")
      const deviceId = localStorage.getItem("fedup-device-id")
      if (deviceId) {
        localStorage.removeItem(`fedup-chat-demo-global-${deviceId}`)
      }
      await auth.signOut()
      router.replace("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Show a nice loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111318] flex flex-col items-center justify-center">
        <div className="text-center">
          <img src="/fedup-logo.png" alt="FED UP" className="w-20 h-20 mx-auto mb-6 animate-pulse" />
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">Hey bestie! 💜</h2>
            <p className="text-gray-300 text-lg">Setting up your safe space...</p>
          </div>
          <div className="flex justify-center gap-2">
            {["💙", "✨", "🤗"].map((emoji, i) => (
              <span
                key={emoji}
                className="text-2xl animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <EmotionalBackground />
      <MainChat user={user} onLogout={handleLogout} />
    </>
  )
}