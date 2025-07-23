"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Mic, PhoneCall, LogOut, Settings } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import LoadingTransition from "./LoadingTransition"
import EmotionalBackground from "./EmotionalBackground"
import EmojiGlobe from "./EmojiGlobe"
import BackgroundAnimation from "./BackgroundAnimation"

// TypeWriter component for animated text
function TypeWriter({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 30) // Adjust speed here
      return () => clearTimeout(timer)
    }
  }, [currentIndex, text])

  useEffect(() => {
    setDisplayText("")
    setCurrentIndex(0)
  }, [text])

  return (
    <span>
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse">▋</span>
      )}
    </span>
  )
}

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

export default function MainChat({ user, onLogout }: { 
  user: UserData;
  onLogout: () => void 
}) {
  const [showLoading, setShowLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isMicActive, setIsMicActive] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [isMicSupported, setIsMicSupported] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const recognitionRef = useRef<any>(null)
  const wasLastInputVoice = useRef(false)
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [userTurns, setUserTurns] = useState(0)
  const [voiceUserTurns, setVoiceUserTurns] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  // Create user-specific storage keys
  const CHAT_STATS_KEY = `fedup-chat-stats-${user.uid}`
  const CHAT_MESSAGES_KEY = `fedup-chat-messages-${user.uid}`

  // Load messages and stats from localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !user) return
    
    // Load chat stats (turns count)
    const savedStats = localStorage.getItem(CHAT_STATS_KEY)
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats)
        setUserTurns(parsed.userTurns || 0)
        setVoiceUserTurns(parsed.voiceUserTurns || 0)
      } catch {}
    }
    
    // Load chat messages
    const savedMessages = localStorage.getItem(CHAT_MESSAGES_KEY)
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        setMessages(parsedMessages || [])
      } catch (error) {
        console.error("Error loading chat messages:", error)
      }
    }
  }, [user, CHAT_STATS_KEY, CHAT_MESSAGES_KEY])

  // Save turns count to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !user) return
    localStorage.setItem(
      CHAT_STATS_KEY,
      JSON.stringify({ userTurns, voiceUserTurns })
    )
  }, [userTurns, voiceUserTurns, user, CHAT_STATS_KEY])
  
  // Save messages to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !user || messages.length === 0) return
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages))
  }, [messages, user, CHAT_MESSAGES_KEY])

  // Show loading screen on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 1000) // Reduced from 2500ms to 1000ms
    return () => clearTimeout(timer)
  }, [])

  // Close any dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showSettings && !target.closest('.settings-button') && !target.closest('.settings-menu')) {
        setShowSettings(false)
      }
      if (showDeleteConfirm && !target.closest('.delete-button') && !target.closest('.delete-menu')) {
        setShowDeleteConfirm(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettings, showDeleteConfirm])

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize speech features
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsMicSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;
    }

    // Setup Speech Synthesis
    if (window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter(voice => 
          voice.lang.startsWith('en-') && 
          !voice.name.toLowerCase().includes('zira')
        );
        
        setAvailableVoices(englishVoices);
        
        // Find best voice (prefer natural-sounding female voices)
        const defaultVoice = englishVoices.find(v => 
          (v.name.toLowerCase().includes('samantha') || 
           v.name.toLowerCase().includes('natural') ||
           v.name.toLowerCase().includes('enhanced')) &&
          v.name.toLowerCase().includes('female')
        ) || englishVoices.find(v => v.name.toLowerCase().includes('female')) || 
           englishVoices[0];
        
        if (defaultVoice && !selectedVoice) {
          setSelectedVoice(defaultVoice.name);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedVoice]);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    if (!isVoiceEnabled && !wasLastInputVoice.current) return;
    
    try {
      // Stop any currently playing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const chosen = voices.find(v => v.name === selectedVoice) || 
                    voices.find(v => v.lang.startsWith('en-') && v.name.toLowerCase().includes('female')) ||
                    voices.find(v => v.lang.startsWith('en-'));
      
      if (chosen) utterance.voice = chosen;
      utterance.pitch = 1.1;
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  const handleSendClick = () => {
    handleSend({ fromVoice: false });
  }
  
  // Function to delete chat history
  const deleteChat = () => {
    if (typeof window === "undefined" || !user) return
    
    // Clear messages from state
    setMessages([])
    
    // Clear from localStorage
    localStorage.removeItem(CHAT_MESSAGES_KEY)
    
    // Reset stats but keep track of them in localStorage
    localStorage.setItem(CHAT_STATS_KEY, JSON.stringify({ userTurns: 0, voiceUserTurns: 0 }))
    setUserTurns(0)
    setVoiceUserTurns(0)
    
    // Close the confirm dialog
    setShowDeleteConfirm(false)
  }

  const handleSend = async (options?: { text?: string, fromVoice?: boolean }) => {
    const textToSend = options?.text || input;
    const inputIsFromVoice = options?.fromVoice || false;
    if (!textToSend.trim() || isSending) return;

    // Update turn counts BEFORE sending
    const newUserTurns = userTurns + 1;
    const newVoiceUserTurns = inputIsFromVoice ? voiceUserTurns + 1 : voiceUserTurns;
    
    // Check limits
    if (user.provider === "google") {
      if (newUserTurns > 100) return;
      if (inputIsFromVoice && newVoiceUserTurns > 80) return;
    }

    // Update counters
    setUserTurns(newUserTurns);
    if (inputIsFromVoice) {
      setVoiceUserTurns(newVoiceUserTurns);
    }

    if (!inputIsFromVoice) {
      wasLastInputVoice.current = false;
    } else {
      wasLastInputVoice.current = true;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      isUser: true,
    };

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsSending(true)

    try {
      const conversationHistory = newMessages.map((m) => `${m.isUser ? "User" : "FED UP"}: ${m.text}`)
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-API-Type": "main-chat"
        },
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

      // Voice response logic: speak if voice is enabled OR if input was from microphone
      if (isVoiceEnabled || wasLastInputVoice.current || inputIsFromVoice) {
        speak(aiResponseText);
      }
    } catch (error) {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: "Hey, I'm here for you. What's going on?",
        isUser: false,
      }
      setMessages((prev) => [...prev, aiResponse])
      
      // Voice response logic: speak if voice is enabled OR if input was from microphone
      if (isVoiceEnabled || wasLastInputVoice.current || inputIsFromVoice) {
        speak("Hey, I'm here for you. What's going on?");
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleMicClick = () => {
    if (!isMicSupported || isSending) return
    
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
      wasLastInputVoice.current = true;
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInput(prev => prev + finalTranscript);
      }
    };

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
      setTimeout(() => {
        const currentInput = (document.querySelector('input[placeholder="Type what\'s on your mind..."]') as HTMLInputElement)?.value;
        if (currentInput && currentInput.trim().length > 0) {
          handleSend({ text: currentInput, fromVoice: true });
        }
      }, 100);
    };

    recognition.start();
  };

  useEffect(() => {
    if (!isMicActive) return
    if (isSending) {
      setIsMicActive(false)
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [isSending, isMicActive])

  if (showLoading) {
    return <LoadingTransition />
  }

  return (
    <div className="relative min-h-screen bg-[#111318] text-white overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <EmotionalBackground />
        <BackgroundAnimation />
      </div>
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-[#1A1D24] border-b border-[#2A2F3A] p-2 sm:p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-3">
            <img src="/fedup-logo.png" alt="FED UP" className="w-7 h-7 sm:w-10 sm:h-10" />
            <h1 className="text-base sm:text-xl font-semibold bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-transparent bg-clip-text">
              FED UP<span className="hidden sm:inline"> Chat</span>
            </h1>
          </div>
          
          <div className="text-center flex-1 px-1 sm:px-4">
            <p className="text-gray-400 text-xs sm:text-base truncate">
              Hey {user.name?.split(' ')[0] || "friend"}, I'm here for you
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-400 delete-button h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                title="Delete chat history"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-4 h-4 sm:w-5 sm:h-5"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </Button>
              {showDeleteConfirm && (
                <div className="delete-menu absolute right-0 mt-2 w-64 sm:w-64 rounded-lg bg-[#1E2128] border border-[#2A2F3A] shadow-lg z-50">
                  <div className="p-3 sm:p-4 space-y-3">
                    <h4 className="text-sm font-medium text-white">Delete chat history?</h4>
                    <p className="text-xs text-gray-400">This will permanently delete all messages in this conversation.</p>
                    <div className="flex justify-between gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-400 hover:text-white bg-transparent border-gray-700 hover:bg-gray-800 flex-1"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white flex-1"
                        onClick={deleteChat}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white h-8 w-8 sm:h-10 sm:w-10"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <img 
              src={user.photo || "/placeholder-user.jpg"}
              alt="Profile"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#2A2F3A]"
            />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="pt-16 sm:pt-20 pb-36 sm:pb-40 px-2 sm:px-4 max-w-6xl mx-auto">
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] sm:max-w-xl ${message.isUser ? "ml-2 sm:ml-12" : "mr-2 sm:mr-12"}`}>
                  <div
                    className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl ${
                      message.isUser
                        ? "bg-[#7c3aed] text-white"
                        : "bg-[#1E2128] border border-[#2A2F3A]"
                    }`}
                  >
                    {message.isUser ? (
                      <span className="text-sm sm:text-base">{message.text}</span>
                    ) : (
                      <span className="text-sm sm:text-base"><TypeWriter text={message.text} /></span>
                    )}
                  </div>
                  <div 
                    className={`mt-1 text-xs text-gray-500 ${
                      message.isUser ? "text-right" : "text-left"
                    }`}
                  >
                    {new Date().toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-[#1E2128] border border-[#2A2F3A] rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[40px] left-0 right-0 z-30 bg-[#1A1D24] border-t border-[#2A2F3A] p-2 sm:p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end gap-2 sm:gap-4">
            <div className="flex-1 bg-[#1E2128] rounded-xl border border-[#2A2F3A] p-2">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendClick()}
                  placeholder="Type what's on your mind..."
                  className="bg-transparent border-0 focus:ring-0 text-white placeholder:text-gray-500 text-sm sm:text-base h-9 sm:h-10"
                  disabled={isSending}
                />
                <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                  <Button
                    type="button"
                    onClick={handleMicClick}
                    disabled={!isMicSupported || isSending}
                    className={`relative h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full transition-colors ${
                      isMicActive 
                        ? 'bg-[#7c3aed] text-white' 
                        : 'bg-transparent hover:bg-[#2A2F3A] text-gray-400 hover:text-white'
                    }`}
                    aria-label={isMicActive ? "Stop voice input" : "Start voice input"}
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    {isMicActive && (
                      <span className="absolute inset-0 rounded-full border-2 border-[#7c3aed] animate-ping" />
                    )}
                  </Button>
                  <Button
                    onClick={handleSendClick}
                    disabled={!input.trim() || isSending}
                    className="bg-[#7c3aed] hover:bg-[#6d28d9] h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <Button
                    onClick={() => alert("Coming soon 💜")}
                    className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#6d28d9] hover:to-[#db2777] h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 px-1 sm:px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm gap-1 sm:gap-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-xs">🎧 Voice</span>
                    <Switch
                      checked={isVoiceEnabled}
                      onCheckedChange={setIsVoiceEnabled}
                      className="scale-70"
                    />
                  </div>
                  {(isVoiceEnabled || wasLastInputVoice.current) && (
                    availableVoices.length > 0 ? (
                      <select
                        className="bg-[#2A2F3A] text-white border border-[#7c3aed] rounded px-1 py-1 text-xs max-w-[110px] sm:max-w-none truncate"
                        value={selectedVoice}
                        onChange={e => setSelectedVoice(e.target.value)}
                      >
                        {availableVoices.map(v => (
                          <option key={v.name} value={v.name}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-400 text-xs">Loading voices…</span>
                    )
                  )}
                  <div className="text-xs text-gray-400 ml-auto sm:ml-0 flex items-center">
                    <span className="mr-1">Messages: {messages.length}</span>
                    <span>•</span>
                    <span className="mx-1">💬 {100 - userTurns}</span>
                    <span>•</span>
                    <span className="ml-1">🎙 {80 - voiceUserTurns}</span>
                  </div>
                </div>
              </div>
              {micError && (
                <div className="mt-1 text-[#f85149] text-xs text-center">{micError}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 w-full">
        <div className="bg-[#1A1D24] border-t border-[#2A2F3A]">
          <div className="max-w-6xl mx-auto">
            <div className="py-1 sm:py-2 flex items-center justify-center">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>Made with 💜 by</span>
                <a 
                  href="https://skds.site" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#7c3aed] hover:text-[#6d28d9] transition-colors"
                >
                  <span className="hidden sm:inline">Saswata Kumar Dash</span>
                  <span className="sm:hidden">SKDS</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
