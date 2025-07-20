"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
// REMOVE: import { generateResponse } from "@/lib/gemini"

interface Message {
  id: number
  text: string
  isUser: boolean
}

const CHAT_STORAGE_KEY = "fedup-chat-demo-state"
const CHAT_LIMIT = 5

export default function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLocked, setIsLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const chatCardRef = useRef<HTMLDivElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem(CHAT_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setMessages(parsed.messages || [])
        setIsLocked(!!parsed.isLocked)
      } catch {}
    }
  }, [])

  // Save to localStorage on every update
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify({ messages, isLocked })
    )
  }, [messages, isLocked])

  // Count user turns
  const userTurns = messages.filter((m) => m.isUser).length

  const handleSend = async () => {
    if (!input.trim() || isLocked || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      // Build conversation history for Gemini
      const conversationHistory = newMessages.map((m) => `${m.isUser ? "User" : "FED UP"}: ${m.text}`)
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, conversationHistory }),
      })
      const data = await res.json()
      const aiResponseText = data.response || "I hear you. That sounds really tough. Want to tell me more about what's weighing on you?"

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        isUser: false,
      }

      setMessages((prev) => [...prev, aiResponse])

      // Lock after 5 user turns
      if (userTurns + 1 >= CHAT_LIMIT) {
        setTimeout(() => setIsLocked(true), 1200)
      }
    } catch (error) {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: "I hear you. That sounds really tough. Want to tell me more about what's weighing on you?",
        isUser: false,
      }
      setMessages((prev) => [...prev, aiResponse])
    } finally {
      setIsLoading(false)
    }
  }

  // Scroll to WaitlistForm in Hero
  const scrollToWaitlist = () => {
    const heroSection = document.querySelector("section")
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="demo" className="py-20 px-6 bg-[#10131a]">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">Try it out</h2>
          <p className="text-xl text-gray-400">See how FED UP responds differently</p>
        </motion.div>
        <motion.div
          ref={chatCardRef}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="relative rounded-2xl p-0 md:p-1 shadow-xl overflow-hidden w-full max-w-3xl z-10 flex items-center justify-center"
        >
          {/* Glow behind card, tightly wraps card */}
          <motion.div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 60% 40%, #7c3aed44 0%, #10131a 80%), radial-gradient(ellipse at 30% 80%, #ec489944 0%, #10131a 80%)",
              filter: "blur(60px)",
              opacity: 0.8,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          />
          <div className="relative z-10 bg-[#161b22]/90 border border-[#30363d] rounded-2xl p-6 md:p-10 w-full shadow-2xl backdrop-blur-sm">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto mb-6 space-y-4 scrollbar-thin scrollbar-thumb-[#7c3aed33] scrollbar-track-transparent">
              <AnimatePresence>
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-400 py-16"
                  >
                    <div className="text-5xl mb-4">💬</div>
                    <p className="text-lg">Start a conversation...</p>
                    <p className="text-sm text-gray-500 mt-2">Try: "I'm feeling overwhelmed lately"</p>
                  </motion.div>
                )}
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: message.isUser ? 20 : 10, scale: message.isUser ? 0.97 : 1 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, delay: index * 0.05, type: "spring", bounce: 0.3 }}
                    className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <motion.div
                      className={`max-w-sm px-5 py-3 rounded-2xl shadow-md transition-all text-base md:text-lg font-medium
                        ${message.isUser
                          ? "bg-gradient-to-br from-[#7c3aed] to-[#ec4899] text-white"
                          : "bg-[#232946] text-gray-100 border border-[#30363d]"}
                      `}
                      style={{
                        boxShadow: message.isUser
                          ? "0 2px 24px 0 #7c3aed88, 0 1.5px 8px 0 #ec489944"
                          : "0 2px 12px 0 #23294633",
                        filter: message.isUser
                          ? "drop-shadow(0 0 12px #7c3aed88)"
                          : "drop-shadow(0 0 8px #23294644)",
                      }}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.07, type: "spring" }}
                      whileHover={message.isUser ? { scale: 1.04, boxShadow: "0 2px 32px 0 #ec4899cc" } : {}}
                    >
                      {message.text}
                    </motion.div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#232946] border border-[#30363d] rounded-2xl px-5 py-3 flex items-center gap-2 text-white shadow-md">
                      <Loader2 className="w-4 h-4 animate-spin text-[#7c3aed]" />
                      <span className="text-gray-300">FED UP is thinking...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {isLocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8"
                >
                  <motion.div
                    className="bg-[#232946] border border-[#f85149] rounded-2xl p-8 shadow-lg flex flex-col items-center"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, boxShadow: "0 0 48px 0 #f8514944" }}
                    transition={{ duration: 0.6, type: "spring" }}
                  >
                    <div className="text-4xl mb-3 animate-pulse">😔</div>
                    <p className="text-[#f85149] mb-2 text-lg font-semibold">That's all for the demo...</p>
                    <p className="text-gray-300 mb-4">But you felt something different, didn't you? 💙</p>
                    <Button
                      onClick={scrollToWaitlist}
                      className="mt-4 w-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#8b5cf6] hover:to-[#f472b6] text-white font-semibold py-4 h-14 rounded-lg transition-all duration-300 text-lg shadow-md animate-pulse"
                    >
                      Join the Waitlist
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </div>
            {/* Input */}
            {!isLocked && (
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type anything..."
                  disabled={isLoading}
                  className="bg-[#10131a] border-[#30363d] text-white placeholder:text-gray-500 focus:border-[#7c3aed] h-12"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#7c3aed] hover:bg-[#8b5cf6] disabled:opacity-50 h-12 px-4"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
