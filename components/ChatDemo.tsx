"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Mic } from "lucide-react"
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { Sparkles, Mail, User } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Message {
  id: number
  text: string
  isUser: boolean
}

interface UserData {
  uid: string
  name: string | null
  email: string | null
  photo: string | null
  provider: "google"
}

// Generate a unique device identifier for demo limits
const getDeviceId = () => {
  if (typeof window === "undefined") return "server";
  
  let deviceId = localStorage.getItem("fedup-device-id");
  if (!deviceId) {
    // Create unique device ID using multiple browser properties
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    deviceId = btoa(fingerprint).slice(0, 32);
    localStorage.setItem("fedup-device-id", deviceId);
  }
  return deviceId;
};

const CHAT_STORAGE_KEY = `fedup-chat-demo-global-${getDeviceId()}`
const CHAT_LIMIT = 5

export default function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLocked, setIsLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const chatCardRef = useRef<HTMLDivElement>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [isMicActive, setIsMicActive] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [isMicSupported, setIsMicSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const [isVoiceOutputOn, setIsVoiceOutputOn] = useState(false)
  const wasLastInputVoice = useRef(false)
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  // Load from localStorage on mount with device-specific demo key
  useEffect(() => {
    if (typeof window === "undefined") return
    const storageKey = `fedup-chat-demo-global-${getDeviceId()}`;
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setMessages(parsed.messages || [])
        setIsLocked(!!parsed.isLocked)
      } catch {}
    }
  }, [])

  // Save to localStorage on every update with device-specific demo key
  useEffect(() => {
    if (typeof window === "undefined") return
    const storageKey = `fedup-chat-demo-global-${getDeviceId()}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ messages, isLocked })
    )
  }, [messages, isLocked])

  // Count user turns
  const userTurns = messages.filter((m) => m.isUser).length

  // Wrapper for button onClick to avoid passing event object
  const handleSendClick = () => {
    handleSend({ fromVoice: false });
  }

  const handleSend = async (options?: { text?: string, fromVoice?: boolean }) => {
    const textToSend = options?.text || input;
    const inputIsFromVoice = options?.fromVoice || false;
    if (!textToSend.trim() || isLoading || isLocked) return;

    // If text was typed, mark input as not from voice
    if (!inputIsFromVoice) {
      wasLastInputVoice.current = false;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      isUser: true,
    };

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      // Build conversation history for Gemini
      const conversationHistory = newMessages.map((m) => `${m.isUser ? "User" : "FED UP"}: ${m.text}`)
      const res = await fetch("/api/gemini-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, conversationHistory }),
      })
      const data = await res.json()
      const aiResponseText = data.response || "Hey, I'm here for you. What's going on?"

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        isUser: false,
      }

      setMessages((prev) => [...prev, aiResponse])

      if (isVoiceOutputOn || wasLastInputVoice.current) {
        speak(aiResponseText);
      }

      // Lock after 3 user turns
      if (userTurns + 1 >= CHAT_LIMIT) {
        setTimeout(() => setIsLocked(true), 1200)
      }
    } catch (error) {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: "Hey, I'm here for you. What's going on?",
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

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("fedup_user")
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const handleLogin = async () => {
    if (!auth) return // or optionally show an error
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
      // Immediate redirect without setting state
      window.location.replace("/chat")
    } catch (e: any) {}
  }

  // Check for browser support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsMicSupported(true)
    }
  }, [])

  // Load voices on mount and when voice output is toggled on
  const loadVoices = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices.filter(v => v.lang.startsWith('en')))
    // Default to friendly female
    const defaultVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
      || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('samantha'))
      || voices.find(v => v.lang.startsWith('en'))
    if (defaultVoice) setSelectedVoice(defaultVoice.name)
  }
  useEffect(() => {
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [])
  useEffect(() => {
    if (isVoiceOutputOn) {
      loadVoices();
    }
  }, [isVoiceOutputOn])

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const chosen = voices.find(v => v.name === selectedVoice) || voices.find(v => v.lang.startsWith('en'));
    if (chosen) utterance.voice = chosen;
    utterance.pitch = 1.1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleMicClick = () => {
    if (!isMicSupported || isLoading) return
    
    if (isMicActive) {
      recognitionRef.current?.stop()
      setIsMicActive(false)
      return
    }

    setMicError(null)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition;

    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onstart = () => {
      setIsMicActive(true)
      wasLastInputVoice.current = true; // Mark input as voice
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInput(prev => prev + finalTranscript); // Append final results
      }
    };

    // Auto-send when the user stops talking
    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'denied') {
        setMicError('Microphone permission denied. Please allow mic access.')
      } else if (event.error === 'no-speech') {
        setMicError("I didn't hear anything. Please try again.")
      } else {
        setMicError('Voice input error. Try again.')
      }
    }
    
    recognition.onend = () => {
      setIsMicActive(false);
      // Use a timeout to ensure 'input' state is updated before sending
      setTimeout(() => {
        const currentInput = (document.querySelector('input[placeholder="Type anything..."]') as HTMLInputElement)?.value;
        if (currentInput && currentInput.trim().length > 0) {
          handleSend({ text: currentInput, fromVoice: true });
        }
      }, 100);
    };

    recognition.start();
  }

  // Reset mic state on send
  useEffect(() => {
    if (!isMicActive) return
    if (isLoading) {
      setIsMicActive(false)
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [isLoading])

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
            </div>
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
                  <p className="text-[#f85149] mb-2 text-lg font-semibold">You've reached the free limit. Please login to continue 💜</p>
                  <div className="flex flex-col gap-4 mt-6 w-full">
                    <Button
                      onClick={handleLogin}
                      className="w-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#8b5cf6] hover:to-[#f472b6] text-white font-semibold py-4 h-14 rounded-lg transition-all duration-300 text-lg flex items-center justify-center gap-3"
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 bg-white rounded-full" />
                      Continue with Google
                    </Button>
                  </div>
                </motion.div>
                </motion.div>
              )}
            {/* Controls: Input & Voice Toggle */}
            {!isLocked && (
              <div className="mt-4">
                <div className="flex gap-3 items-center">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendClick()}
                  placeholder="Type anything..."
                  disabled={isLoading}
                  className="bg-[#10131a] border-[#30363d] text-white placeholder:text-gray-500 focus:border-[#7c3aed] h-12"
                />
                  <div className="relative flex items-center group">
                    <Button
                      type="button"
                      onClick={handleMicClick}
                      disabled={!isMicSupported || isLoading}
                      className={`h-12 px-3 flex items-center justify-center ${isMicActive ? 'bg-[#7c3aed] animate-pulse' : 'bg-[#232946] hover:bg-[#30363d]'} text-white`}
                      aria-label="Start voice input"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                    {isMicActive && (
                      <span className="absolute -inset-2 rounded-full border-2 border-[#7c3aed] animate-ping pointer-events-none"></span>
                    )}
                    {!isMicSupported && (
                      <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 bg-[#232946] text-xs text-gray-300 px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 group-hover:block hidden">Voice input not supported in this browser</span>
                    )}
                  </div>
                <Button
                    onClick={handleSendClick}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#7c3aed] hover:bg-[#8b5cf6] disabled:opacity-50 h-12 px-4"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
                </div>
                {isMicActive && (
                  <div className="text-[#7c3aed] text-sm mt-2 font-mono animate-pulse text-center">Listening…</div>
                )}
                {micError && (
                  <div className="text-[#f85149] text-sm mt-2 font-mono text-center">{micError}</div>
                )}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Label htmlFor="voice-output" className="text-gray-400 font-medium">
                    🎧 Voice Responses
                  </Label>
                  <Switch
                    id="voice-output"
                    checked={isVoiceOutputOn}
                    onCheckedChange={setIsVoiceOutputOn}
                  />
                  {(user && (isVoiceOutputOn || wasLastInputVoice.current)) && (
                    availableVoices.length > 0 ? (
                      <select
                        className="ml-4 bg-[#232946] text-white border border-[#7c3aed] rounded px-2 py-1 text-sm"
                        value={selectedVoice}
                        onChange={e => setSelectedVoice(e.target.value)}
                      >
                        {availableVoices.map(v => (
                          <option key={v.name} value={v.name}>{v.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="ml-4 text-gray-400 text-sm">Loading voices…</span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {/* Call FED UP Button */}
      <div className="flex flex-col items-center mt-8">
        <Button
          className="w-full max-w-xs bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#8b5cf6] hover:to-[#f472b6] text-white font-semibold py-4 h-14 rounded-lg transition-all duration-300 text-lg flex items-center justify-center gap-3 shadow-lg"
          disabled
        >
          📞 Call FED UP
        </Button>
        <div className="mt-3 text-center text-base text-[#7c3aed] font-semibold">
          {!user ? (
            <>Please login to access voice calls with FED UP.</>
          ) : (
            <>Coming soon. You'll be the first to try our voice AI. 💜</>
          )}
        </div>
      </div>
    </section>
  )
}
