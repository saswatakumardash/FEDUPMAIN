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

  useEffect(() => {
    if (!auth) {
      router.push("/")
      return
    }

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser || firebaseUser.providerData[0]?.providerId !== "google.com") {
        router.push("/")
      } else {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
          provider: "google",
        })
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
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (!user) return null

  return (
    <>
      <EmotionalBackground />
      <MainChat user={user} onLogout={handleLogout} />
    </>
  )
}