"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Mic, PhoneCall, LogOut, Settings, X, Copy, Plus, RotateCcw, Heart, Briefcase } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import LoadingTransition from "./LoadingTransition"
import EmotionalBackground from "./EmotionalBackground"
import EmojiGlobe from "./EmojiGlobe"
import BackgroundAnimation from "./BackgroundAnimation"
import FileUpload from "./FileUpload"
import LimitReachedModal from "./LimitReachedModal"

import ReminderNotification from "./ReminderNotification"
import MessageRenderer from "./MessageRenderer"
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  deleteField,
  updateDoc,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";

// Simple text display without typing effect - instant display
function DirectText({ text }: { text: string }) {
  return <span>{text}</span>
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
  const [showLoading, setShowLoading] = useState(false)
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
  const [isMobile, setIsMobile] = useState(false)
  // 1. WhatsApp-style hold-to-record mic button
  // Add state for recording
  const [isRecording, setIsRecording] = useState(false);
  
  // v1.1 Beta features
  const [chatMode, setChatMode] = useState<'professional' | 'bestie'>('bestie')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [monthlyMessageCount, setMonthlyMessageCount] = useState(0)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'premium'>('free')
  
  // New notification features

  const [lastReminderTime, setLastReminderTime] = useState<number>(0)
  const [showReminder, setShowReminder] = useState(false)
  
  // Monthly limits
  const MONTHLY_FREE_LIMIT = 150

  // New handlers for v1.1 features
  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files])
  }

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const checkMonthlyLimit = () => {
    if (userPlan === 'free' && monthlyMessageCount >= MONTHLY_FREE_LIMIT) {
      setShowLimitModal(true)
      return false
    }
    return true
  }

  const incrementMonthlyCount = () => {
    if (userPlan === 'free') {
      const currentMonth = new Date().getMonth() + '-' + new Date().getFullYear()
      const storedMonth = localStorage.getItem(`fedup-last-month-${user.uid}`)
      
      if (storedMonth !== currentMonth) {
        setMonthlyMessageCount(1)
        localStorage.setItem(`fedup-last-month-${user.uid}`, currentMonth)
        localStorage.setItem(`fedup-monthly-count-${user.uid}`, '1')
      } else {
        const newCount = monthlyMessageCount + 1
        setMonthlyMessageCount(newCount)
        localStorage.setItem(`fedup-monthly-count-${user.uid}`, newCount.toString())
      }
    }
  }

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
    
    // Load monthly count on component mount
    const currentMonth = new Date().getMonth() + '-' + new Date().getFullYear()
    const storedMonth = localStorage.getItem(`fedup-last-month-${user.uid}`)
    const storedCount = localStorage.getItem(`fedup-monthly-count-${user.uid}`)
    
    if (storedMonth === currentMonth && storedCount) {
      setMonthlyMessageCount(parseInt(storedCount))
    } else {
      setMonthlyMessageCount(0)
      localStorage.setItem(`fedup-last-month-${user.uid}`, currentMonth)
      localStorage.setItem(`fedup-monthly-count-${user.uid}`, '0')
    }

    // Load notification preferences - removed hide limits feature
    
    // Load last reminder time
    const lastReminder = localStorage.getItem(`fedup-last-reminder-${user.uid}`)
    if (lastReminder) {
      setLastReminderTime(parseInt(lastReminder))
    }
  }, [user.uid]);

  // 2-hour reminder logic
  useEffect(() => {
    const checkReminder = () => {
      const now = Date.now()
      const twoHours = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
      
      if (lastReminderTime === 0 || (now - lastReminderTime) >= twoHours) {
        setShowReminder(true)
        setLastReminderTime(now)
        localStorage.setItem(`fedup-last-reminder-${user.uid}`, now.toString())
      }
    }

    // Check every minute
    const interval = setInterval(checkReminder, 60000)
    return () => clearInterval(interval)
  }, [lastReminderTime, user.uid])

  // Create user-specific storage keys
  const CHAT_STATS_KEY = `fedup-chat-stats-${user.uid}`
  const CHAT_MESSAGES_KEY = `fedup-chat-messages-${user.uid}`

  // Function to add initial welcome message from FedUp
  const addWelcomeMessage = () => {
    // Check if user has been away (last message older than 1 hour)
    const lastMessageTime = localStorage.getItem(`fedup-last-active-${user.uid}`)
    const now = Date.now()
    const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
    const isReturningUser = lastMessageTime && (now - parseInt(lastMessageTime)) > oneHour
    
    let welcomeMessages = []
    
    if (chatMode === 'professional') {
      // Professional mode welcome messages
      if (isReturningUser) {
        welcomeMessages = [
          `Welcome back ${user.name?.split(' ')[0] || "there"}! Ready to tackle some work challenges? 💼`,
          `Hey ${user.name?.split(' ')[0] || "there"}! Good to see you again. What professional goals are we working on today? 🚀`,
          `${user.name?.split(' ')[0] || "Hello"}! Back for more productivity? Let's make things happen! 💻`
        ]
      } else {
        welcomeMessages = [
          `Hey ${user.name?.split(' ')[0] || "there"}! I'm your professional assistant. Ready to work on some coding, career, or startup challenges? 💼`,
          `Welcome ${user.name?.split(' ')[0] || "friend"}! Let's dive into some professional development, coding projects, or career planning! 🚀`,
          `Hi ${user.name?.split(' ')[0] || "there"}! I'm here to help with work, coding, college projects, and professional growth. What can we build today? 💻`
        ]
      }
    } else {
      // Bestie mode welcome messages
      if (isReturningUser) {
        welcomeMessages = [
          `Hey bestie ${user.name?.split(' ')[0] || "friend"}, welcome back! Wassup? 💙`,
          `Yooo ${user.name?.split(' ')[0] || "friend"}! You're back! What's been going on? 💜`,
          `Hey ${user.name?.split(' ')[0] || "friend"}! Good to see you again! What's on your mind? 🤗`,
          `Sup ${user.name?.split(' ')[0] || "friend"}! Missed you bestie! Ready to catch up? 💯`
        ]
      } else {
        welcomeMessages = [
          `Hey wassup best friend ${user.name?.split(' ')[0] || "bestie"}! 💙`,
          `Yooo ${user.name?.split(' ')[0] || "bestie"}! What's good? I'm here for you best friend 💜`,
          `Hey ${user.name?.split(' ')[0] || "bestie"}! What's on your mind today best friend? I'm all ears 🤗`,
          `Sup ${user.name?.split(' ')[0] || "bestie"}! Ready to spill the tea best friend? I'm here for whatever you need 💯`
        ]
      }
    }
    
    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
    
    const welcomeMessage: Message = {
      id: Date.now(),
      text: randomWelcome,
      isUser: false
    }
    
    setMessages([welcomeMessage])
    
    // Save to localStorage
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify([welcomeMessage]))
    // Update last active time
    localStorage.setItem(`fedup-last-active-${user.uid}`, now.toString())
  }

  // On load, fetch messages and turn counts from Firestore
  useEffect(() => {
    if (!user || !db) return;
    const dbInstance = db as import('firebase/firestore').Firestore;
    const fetchData = async () => {
      setShowLoading(true);
      try {
        // Fetch turn counts and user settings
        const userDoc = await getDoc(doc(dbInstance, "userStats", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserTurns(data.userTurns || 0);
          setVoiceUserTurns(data.voiceUserTurns || 0);
          
          // Restore user settings from Firestore for cross-device sync
          if (data.chatMode) setChatMode(data.chatMode);
          if (data.isVoiceEnabled !== undefined) setIsVoiceEnabled(data.isVoiceEnabled);
          if (data.selectedVoice) setSelectedVoice(data.selectedVoice);
        } else {
          setUserTurns(0);
          setVoiceUserTurns(0);
        }
        // Fetch messages
        const chatsRef = collection(dbInstance, "userChats", user.uid, "messages");
        const q = query(chatsRef, orderBy("id", "asc"));
        const chatSnap = await getDocs(q);
        const msgs = chatSnap.docs.map(doc => doc.data() as Message);
        setMessages(msgs);
        if (msgs.length === 0) {
          addWelcomeMessage();
        }
      } catch (e) {
        setMessages([]);
        setUserTurns(0);
        setVoiceUserTurns(0);
      } finally {
        setShowLoading(false);
      }
    };
    fetchData();
  }, [user, db]);

  // Real-time Firestore listener for messages
  useEffect(() => {
    if (!user || !db) return;
    const dbInstance = db as import('firebase/firestore').Firestore;
    const chatsRef = collection(dbInstance, "userChats", user.uid, "messages");
    const q = query(chatsRef, orderBy("id", "asc"));
    const unsubscribe = onSnapshot(q, (chatSnap) => {
      const msgs = chatSnap.docs.map(doc => doc.data() as Message);
      setMessages(msgs);
      if (msgs.length === 0) {
        addWelcomeMessage();
      }
    }, (error) => {
      setMessages([]);
    });
    return () => unsubscribe();
  }, [user, db]);

  // Refactor handleSend for robust Firestore and API flow
  const handleSend = async (options?: { text?: string, fromVoice?: boolean }) => {
    const textToSend = options?.text || input;
    const inputIsFromVoice = options?.fromVoice || false;
    if (!textToSend.trim() || isSending) return;
    if (!user || !db) return;
    
    // Check monthly limit for free users
    if (!checkMonthlyLimit()) {
      return;
    }
    
    // If text was typed, mark input as not from voice
    if (!inputIsFromVoice) {
      wasLastInputVoice.current = false;
    }
    
    setIsSending(true);
    
    // Increment monthly count for free users
    incrementMonthlyCount();
    
    try {
      const dbInstance = db as import('firebase/firestore').Firestore;
      // Get current turn counts from Firestore
      const userDocRef = doc(dbInstance, "userStats", user.uid);
      const userDoc = await getDoc(userDocRef);
      let newUserTurns = userTurns + 1;
      let newVoiceUserTurns = inputIsFromVoice ? voiceUserTurns + 1 : voiceUserTurns;
      if (userDoc.exists()) {
        const data = userDoc.data();
        newUserTurns = (data.userTurns || 0) + 1;
        newVoiceUserTurns = inputIsFromVoice ? (data.voiceUserTurns || 0) + 1 : (data.voiceUserTurns || 0);
      }
      // Check limits - 150 total messages per month, 80 voice messages max
      if (user.provider === "google") {
        if (newUserTurns > 150) {
          setIsSending(false);
          // Show limit reached message
          const limitMessage: Message = {
            id: Date.now(),
            text: `Hey bestie ${user.name?.split(' ')[0] || "friend"}, you've reached your monthly message limit of 150! 📱✨ For unlimited chatting and higher limits, please contact contact@skds.site for pricing. We're here to help! 💜`,
            isUser: false
          };
          await addDoc(collection(dbInstance, "userChats", user.uid, "messages"), limitMessage);
          return;
        }
        if (inputIsFromVoice && newVoiceUserTurns > 80) {
          setIsSending(false);
          // Show voice limit reached message
          const voiceLimitMessage: Message = {
            id: Date.now(),
            text: `Hey ${user.name?.split(' ')[0] || "bestie"}, you've used all 80 voice messages for this month! 🎙️✨ For unlimited voice chat and higher limits, please contact contact@skds.site for pricing. Text messages still work! 💙`,
            isUser: false
          };
          await addDoc(collection(dbInstance, "userChats", user.uid, "messages"), voiceLimitMessage);
          return;
        }
      }
      // Update counters and settings in Firestore
      await setDoc(userDocRef, {
        userTurns: newUserTurns,
        voiceUserTurns: newVoiceUserTurns,
        chatMode: chatMode,
        isVoiceEnabled: isVoiceEnabled,
        selectedVoice: selectedVoice,
        lastActiveTime: Date.now()
      }, { merge: true });
      setUserTurns(newUserTurns);
      if (inputIsFromVoice) setVoiceUserTurns(newVoiceUserTurns);
      // Add user message to Firestore and UI
      const userMessage: Message = {
        id: Date.now(),
        text: textToSend,
        isUser: true,
      };
      await addDoc(collection(dbInstance, "userChats", user.uid, "messages"), userMessage);
      setInput("");
      // Fetch AI response based on chat mode
      const conversationHistory = [...messages, userMessage].map((m) => `${m.isUser ? "User" : "FED UP"}: ${m.text}`);
      let aiResponseText = chatMode === 'professional' 
        ? "I'm here to help with your professional goals and coding challenges. What can I assist you with?"
        : "Hey, I'm here for you. What's going on?";
      
      try {
        // Use different API endpoints based on chat mode
        const apiEndpoint = chatMode === 'professional' ? "/api/gemini-demo" : "/api/gemini";
        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Type": chatMode === 'professional' ? "professional-chat" : "main-chat"
          },
          body: JSON.stringify({ 
            message: textToSend, 
            conversationHistory,
            mode: chatMode 
          }),
        });
        const data = await res.json();
        aiResponseText = data.response || aiResponseText;
      } catch (error) {
        // Fallback - if one API fails, try the other
        try {
          const fallbackEndpoint = chatMode === 'professional' ? "/api/gemini" : "/api/gemini-demo";
          const fallbackRes = await fetch(fallbackEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Type": "fallback-chat"
            },
            body: JSON.stringify({ 
              message: textToSend, 
              conversationHistory,
              mode: chatMode 
            }),
          });
          const fallbackData = await fallbackRes.json();
          aiResponseText = fallbackData.response || aiResponseText;
        } catch (fallbackError) {
          // Use default response
        }
      }
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        isUser: false,
      };
      await addDoc(collection(dbInstance, "userChats", user.uid, "messages"), aiResponse);
      // For bestie mode: voice input ALWAYS triggers voice output
      // For professional mode: only if voice mode is enabled
      const shouldSpeak = chatMode === 'bestie' 
        ? (inputIsFromVoice || wasLastInputVoice.current || isVoiceEnabled)
        : isVoiceEnabled;
        
      if (shouldSpeak) {
        speak(aiResponseText);
      }
      
      // Update voice input tracking for bestie mode
      if (inputIsFromVoice && chatMode === 'bestie') {
        wasLastInputVoice.current = true;
      }
    } catch (error) {
      // Optionally show error UI
    } finally {
      setIsSending(false);
      sessionStorage.setItem('lastActiveTime', Date.now().toString());
    }
  };

  // Sync user settings to Firestore for cross-device compatibility
  const syncSettingsToFirestore = async () => {
    if (!user || !db) return;
    
    try {
      const dbInstance = db as import('firebase/firestore').Firestore;
      const userDocRef = doc(dbInstance, "userStats", user.uid);
      
      await setDoc(userDocRef, {
        chatMode: chatMode,
        isVoiceEnabled: isVoiceEnabled,
        selectedVoice: selectedVoice,
        lastUpdated: Date.now()
      }, { merge: true });
    } catch (error) {
      console.error('Failed to sync settings to Firestore:', error);
    }
  };

  // Sync settings to Firestore when they change
  useEffect(() => {
    if (user) {
      syncSettingsToFirestore();
    }
  }, [chatMode, isVoiceEnabled, selectedVoice, user]);

  // On delete, remove all chat data but NEVER reset turn counts (limits are persistent)
  const handleDeleteAll = async () => {
    if (!user || !db) return;
    const dbInstance = db as import('firebase/firestore').Firestore;
    setShowLoading(true);
    try {
      // Delete all chat messages
      const chatsRef = collection(dbInstance, "userChats", user.uid, "messages");
      const chatSnap = await getDocs(chatsRef);
      for (const docu of chatSnap.docs) {
        await deleteDoc(docu.ref);
      }
      // DO NOT reset turn counts - limits are persistent and should never reset
      // Users must contact support@skds.site for higher limits
      setMessages([]);
      addWelcomeMessage();
    } catch (e) {
      // Optionally show error
    } finally {
      setShowLoading(false);
    }
  };

  // Close any dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showSettings && !target.closest('.settings-button') && !target.closest('.settings-menu')) {
        setShowSettings(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettings])

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize speech features - Chrome & Samsung Internet friendly
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Setup Speech Recognition - Chrome compatible
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsMicSupported(true);
    }

    // Setup Speech Synthesis - Chrome & Samsung Internet compatible
    if (window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        
        if (voices.length === 0) return; // Wait for voices to load
        
        // Filter for English voices with priority for female voices - including Microsoft
        const allEnglishVoices = voices.filter(voice => 
          voice.lang.startsWith('en')
        );
        
        // Prioritize female voices and sort them - more inclusive filtering
        const femaleVoices = allEnglishVoices.filter(voice => {
          const name = voice.name.toLowerCase();
          const isNotMaleVoice = !name.includes('david') && 
                                !name.includes('mark') && 
                                !name.includes('daniel') && 
                                !name.includes('tom') && 
                                !name.includes('paul') && 
                                !name.includes('james') && 
                                !name.includes('richard');
          
          const isFemaleVoice = name.includes('female') || 
                               name.includes('woman') ||
                               name.includes('samantha') ||
                               name.includes('karen') ||
                               name.includes('moira') ||
                               name.includes('tessa') ||
                               name.includes('alex') ||
                               name.includes('allison') ||
                               name.includes('ava') ||
                               name.includes('serena') ||
                               name.includes('aria') ||
                               name.includes('emma') ||
                               name.includes('jenny') ||
                               name.includes('google us') ||
                               name.includes('google uk') ||
                               name.includes('samsung') ||
                               name.includes('vicki') ||
                               name.includes('princess') ||
                               name.includes('victoria') ||
                               name.includes('eva') ||
                               name.includes('hazel') ||
                               name.includes('cortana') ||
                               name.includes('helena') ||
                               name.includes('julie') ||
                               name.includes('michelle') ||
                               name.includes('susan') ||
                               name.includes('heather') ||
                               name.includes('tracy') ||
                               name.includes('linda') ||
                               name.includes('amber') ||
                               name.includes('fiona') ||
                               name.includes('paige') ||
                               name.includes('zoey') ||
                               name.includes('claire') ||
                               name.includes('kimberly') ||
                               name.includes('jessica') ||
                               name.includes('zira') ||
                               name.includes('elena') ||
                               name.includes('mary') ||
                               name.includes('lisa') ||
                               name.includes('sarah');
          
          return isNotMaleVoice && (isFemaleVoice || isNotMaleVoice);
        });
        
        const maleVoices = allEnglishVoices.filter(voice => {
          const name = voice.name.toLowerCase();
          return name.includes('david') || 
                 name.includes('mark') || 
                 name.includes('daniel') || 
                 name.includes('tom') || 
                 name.includes('paul') || 
                 name.includes('james') || 
                 name.includes('richard') ||
                 name.includes('male');
        });
        
        // Combine with female voices first
        const sortedVoices = [...femaleVoices, ...maleVoices];
        
        setAvailableVoices(sortedVoices);
        
        // Find best default voice - prioritize sweet female voices
        let defaultVoice;
        
        // Priority order for sweet, friendly female voices - Chrome & Samsung Internet optimized
        defaultVoice = sortedVoices.find(v => 
          v.name.toLowerCase().includes('microsoft eva')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('microsoft hazel')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('microsoft aria')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('eva')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('hazel')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('samantha')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('karen')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('allison')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('ava')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('serena')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('female')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('samsung') && v.name.toLowerCase().includes('female')
        ) || 
        sortedVoices.find(v => 
          v.name.toLowerCase().includes('female')
        ) || 
        femaleVoices[0] ||
        sortedVoices[0];
        
        if (defaultVoice && !selectedVoice) {
          setSelectedVoice(defaultVoice.name);
        }
      };

      // Chrome & Samsung Internet specific loading with more attempts
      loadVoices();
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Multiple fallbacks for Chrome & Samsung Internet - more aggressive loading
      setTimeout(loadVoices, 10);
      setTimeout(loadVoices, 50);
      setTimeout(loadVoices, 100);
      setTimeout(loadVoices, 200);
      setTimeout(loadVoices, 500);
      setTimeout(loadVoices, 1000);
      setTimeout(loadVoices, 2000);
      
      // Force reload voices on user interaction for Chrome
      const forceLoadVoices = () => {
        if (window.speechSynthesis.getVoices().length > 0) {
          loadVoices();
        } else {
          // Try again after a short delay
          setTimeout(() => {
            if (window.speechSynthesis.getVoices().length > 0) {
              loadVoices();
            }
          }, 100);
        }
      };
      
      document.addEventListener('click', forceLoadVoices, { once: true });
      document.addEventListener('touchstart', forceLoadVoices, { once: true });
      document.addEventListener('keydown', forceLoadVoices, { once: true });
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
    // Only speak if voice mode is enabled (the calling function already handles the logic)
    
    try {
      // Stop any currently playing speech
      window.speechSynthesis.cancel();
      
      // Clean text for better speech synthesis - remove markdown and convert emojis
      let cleanText = text
        // Remove markdown formatting
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
        .replace(/__(.*?)__/g, '$1')     // Remove bold __text__
        .replace(/_(.*?)_/g, '$1')       // Remove italic _text_
        .replace(/`(.*?)`/g, '$1')       // Remove code `text`
        .replace(/~~(.*?)~~/g, '$1')     // Remove strikethrough ~~text~~
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links [text](url)
        .replace(/^#+\s*/gm, '')         // Remove headers # ## ###
        .replace(/^\s*[-*+]\s*/gm, '')   // Remove bullet points
        .replace(/^\s*\d+\.\s*/gm, '')   // Remove numbered lists
        .replace(/^\s*>\s*/gm, '')       // Remove blockquotes
        
        // Convert common emojis to speech-friendly text
        .replace(/�|💜|❤️|💖|💗|💓|💘|💕|💝/g, ' heart ')
        .replace(/🤗|🫂/g, ' hug ')
        .replace(/💯/g, ' amazing ')
        .replace(/😊|😌|😇|�|😍|😘/g, ' happy ')
        .replace(/😢|😭|�|🥲/g, ' sad ')
        .replace(/�|🤣/g, ' laughing ')
        .replace(/�/g, ' thank you ')
        .replace(/✨|🌟|⭐|�/g, ' sparkle ')
        .replace(/�/g, ' fire ')
        .replace(/�/g, ' strong ')
        .replace(/�|�|🙌/g, ' great ')
        .replace(/🎉|�|🎊/g, ' celebration ')
        .replace(/🌈/g, ' rainbow ')
        .replace(/☀️/g, ' sunshine ')
        .replace(/🌙/g, ' moon ')
        .replace(/�|🌸|🌺|🌻|🌹/g, ' beautiful ')
        .replace(/🎵|🎶/g, ' music ')
        .replace(/🎁/g, ' gift ')
        .replace(/🍀/g, ' luck ')
        .replace(/�/g, ' hello ')
        .replace(/�/g, ' cool ')
        .replace(/🤔/g, ' thinking ')
        .replace(/�|😲/g, ' surprised ')
        .replace(/�/g, ' wink ')
        .replace(/�|😅/g, ' nervous ')
        .replace(/😤|😠|😡/g, ' angry ')
        .replace(/😱|😨|�/g, ' scared ')
        .replace(/😴|�|🥱/g, ' tired ')
        .replace(/🤯/g, ' mind blown ')
        .replace(/🤭/g, ' giggle ')
        
        // Remove any remaining emojis that weren't converted
        .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
        
        // Clean up extra spaces and punctuation
        .replace(/\s+/g, ' ')           // Multiple spaces to single space
        .replace(/\s*([.!?])\s*/g, '$1 ') // Normalize punctuation spacing
        .trim();
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      
      // Chrome & Samsung Internet friendly voice selection
      let chosenVoice = voices.find(v => v.name === selectedVoice);
      
      if (!chosenVoice) {
        // Fallback priority for Chrome & Samsung Internet - Microsoft voices first
        chosenVoice = voices.find(v => 
          v.lang.startsWith('en') && v.name.toLowerCase().includes('microsoft eva')
        ) || 
        voices.find(v => 
          v.lang.startsWith('en') && v.name.toLowerCase().includes('microsoft hazel')
        ) || 
        voices.find(v => 
          v.lang.startsWith('en') && v.name.toLowerCase().includes('microsoft aria')
        ) || 
        voices.find(v => 
          v.lang.startsWith('en') && v.name.toLowerCase().includes('eva')
        ) || 
        voices.find(v => 
          v.lang.startsWith('en') && v.name.toLowerCase().includes('hazel')
        ) || 
        voices.find(v => 
          v.lang.startsWith('en') && v.name.toLowerCase().includes('google')
        ) || 
        voices.find(v => 
          v.lang.startsWith('en') && v.name.toLowerCase().includes('samsung')
        ) || 
        voices.find(v => 
          v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
        ) || 
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];
      }
      
      if (chosenVoice) utterance.voice = chosenVoice;
      
      // Chrome & Samsung Internet optimized settings
      utterance.pitch = 1.1;
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      
      utterance.onerror = (event) => {
        console.log('Speech synthesis error:', event.error);
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  // Simple voice recording - click to start/stop
  const handleMicClick = () => {
    if (!isMicSupported || isSending) return;
    
    if (isMicActive) {
      // Stop recording
      recognitionRef.current?.stop();
      setIsMicActive(false);
      setIsRecording(false);
      return;
    }

    // Start recording
    setMicError(null);
    setIsRecording(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsMicActive(true);
      wasLastInputVoice.current = true;
    };

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

    recognition.onerror = (event: any) => {
      setIsMicActive(false);
      setIsRecording(false);
      if (event.error === 'not-allowed' || event.error === 'denied') {
        setMicError('Microphone permission denied. Please allow mic access.');
      } else if (event.error === 'no-speech') {
        setMicError("I didn't hear anything. Please try again.");
      } else if (event.error === 'network') {
        setMicError('Network error. Check your connection.');
      } else {
        setMicError('Voice input error. Try again.');
      }
    };
    
    recognition.onend = () => {
      setIsMicActive(false);
      setIsRecording(false);
      // Auto-send when recording ends
      setTimeout(() => {
        const currentInput = (document.querySelector('input[placeholder="Type what\'s on your mind..."]') as HTMLInputElement)?.value;
        if (currentInput && currentInput.trim().length > 0) {
          handleSend({ text: currentInput, fromVoice: true });
        }
      }, 100);
    };

    try {
      recognition.start();
    } catch (error) {
      setMicError('Could not start voice input. Try again.');
      setIsMicActive(false);
      setIsRecording(false);
    }
  };

  const handleSendClick = () => {
    handleSend({ fromVoice: false });
  }
  
  // Function to delete chat history (legacy - limits remain persistent)
  const deleteChat = () => {
    if (typeof window === "undefined" || !user) return
    
    // Clear messages from state
    setMessages([])
    
    // Clear from localStorage
    localStorage.removeItem(CHAT_MESSAGES_KEY)
    
    // DO NOT reset stats - limits are persistent and should never reset
    // Users must contact support@skds.site for higher limits
    
    // Close the confirm dialog
    setShowDeleteConfirm(false)
  }

  // Reset mic state on send
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
            <h1 className="hidden sm:block text-xl font-semibold text-white">
              FEDUP
            </h1>
          </div>
          
          <div className="text-center flex-1 px-1 sm:px-4">
            <p className="text-gray-400 text-xs sm:text-base truncate">
              Hey {user.name?.split(' ')[0] || "friend"}, I'm here for you
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className={`px-2 py-0.5 rounded-full text-xs ${
                chatMode === 'bestie' 
                  ? 'bg-purple-500/20 text-purple-300' 
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                {chatMode === 'bestie' ? '💜 Bestie Mode' : '💼 Professional Mode'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white settings-button h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              {showSettings && (
                <div className="settings-menu absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-[#1E2128] border border-[#2A2F3A] shadow-lg z-50">
                  <div className="p-4 space-y-4">
                    <h4 className="text-sm font-medium text-white border-b border-[#2A2F3A] pb-2">Settings</h4>
                    
                    {/* Chat Mode Selector */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-medium text-gray-300">Chat Mode</h5>
                      <div className="grid gap-2">
                        <Button
                          onClick={() => {
                            setChatMode('bestie')
                            setShowSettings(false)
                          }}
                          className={`w-full justify-start text-left ${
                            chatMode === 'bestie' 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          💜 Bestie Mode
                          <span className="ml-auto text-xs opacity-75">Emotional Support</span>
                        </Button>
                        <Button
                          onClick={() => {
                            setChatMode('professional')
                            setShowSettings(false)
                          }}
                          className={`w-full justify-start text-left ${
                            chatMode === 'professional' 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          <Briefcase className="w-4 h-4 mr-2" />
                          💼 Professional Mode  
                          <span className="ml-auto text-xs opacity-75">Work & Coding</span>
                        </Button>
                      </div>
                    </div>

                    {/* Delete Chat Section */}
                    <div className="space-y-3 border-t border-[#2A2F3A] pt-3">
                      <h5 className="text-xs font-medium text-gray-300">Chat Management</h5>
                      <Button
                        variant="destructive"
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          setShowDeleteConfirm(true)
                          setShowSettings(false)
                        }}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="w-4 h-4 mr-2"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                        Delete Chat History
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
        {/* File Upload Area */}
        {showFileUpload && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <FileUpload
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              disabled={isSending}
            />
          </motion.div>
        )}
        
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
                <div className={`max-w-[85%] sm:max-w-[70%] ${message.isUser ? "ml-auto" : "mr-auto"}`}>
                  <div
                    className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg ${
                      message.isUser
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-none"
                        : "bg-[#1E2128] border border-[#2A2F3A] text-white rounded-tl-none relative group"
                    }`}
                  >
                    <MessageRenderer 
                      text={message.text}
                      isUser={message.isUser}
                      chatMode={chatMode}
                    />
                    <div 
                      className={`text-xs text-gray-300 opacity-80 ${
                        message.isUser ? "text-right" : "text-left"
                      } mt-1`}
                    >
                      {new Date().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: 'Asia/Kolkata'
                      })}
                    </div>
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
                <div className="max-w-[70%] mr-auto">
                  <div className="bg-[#1E2128] border border-[#2A2F3A] rounded-lg rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 text-sm animate-pulse">
                        {(isVoiceEnabled || wasLastInputVoice.current) ? "talking..." : "typing..."}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area - WhatsApp style */}
      <div className="fixed bottom-[40px] left-0 right-0 z-30 bg-[#1A1D24] border-t border-[#2A2F3A] p-2 sm:p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end gap-2 sm:gap-4">
            <div className="flex-1 bg-[#1E2128] rounded-full border border-[#2A2F3A] px-4 py-1">
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
                    onClick={() => alert("Coming soon 💜 - Upload images, videos, and documents!")}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full flex items-center justify-center shadow-md"
                    title="Upload files (Coming Soon)"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleMicClick}
                    disabled={!isMicSupported || isSending}
                    className={`relative h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full transition-colors ${
                      isMicActive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#7c3aed] hover:bg-[#8b5cf6]'
                    }`}
                    aria-label={isMicActive ? "Stop recording" : "Start recording"}
                    title={isMicActive ? "🎙️ Click to stop recording" : "🎙️ Click to start recording"}
                  >
                    {isMicActive ? (
                      <span className="text-white font-bold">●</span>
                    ) : (
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                    {isMicActive && (
                      <span className="absolute -inset-2 rounded-full border-2 border-red-500 animate-ping pointer-events-none"></span>
                    )}
                  </Button>
                  <Button
                    onClick={handleSendClick}
                    disabled={!input.trim() || isSending}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full flex items-center justify-center shadow-md"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <Button
                    onClick={() => alert("Coming soon 💜")}
                    className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full flex items-center justify-center shadow-lg"
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
                        className={`bg-[#2A2F3A] text-white border border-[#7c3aed] rounded px-2 py-1 text-xs truncate focus:outline-none focus:ring-1 focus:ring-[#7c3aed] ${
                          isMobile ? 'max-w-[100px]' : 'max-w-[120px] sm:max-w-[180px]'
                        }`}
                        value={selectedVoice}
                        onChange={e => setSelectedVoice(e.target.value)}
                        style={{ 
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none'
                        }}
                      >
                        {availableVoices.map(v => (
                          <option key={v.name} value={v.name} className="bg-[#2A2F3A] text-white">
                            {isMobile ? 
                              (v.name.length > 10 ? v.name.substring(0, 10) + '...' : v.name) :
                              (v.name.length > 15 ? v.name.substring(0, 15) + '...' : v.name)
                            }
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-purple-400 text-xs animate-pulse">🎵 Loading sweet voices...</span>
                    )
                  )}
                  <div className="text-xs text-gray-400 ml-auto sm:ml-0 flex items-center">
                    <span className="mr-1">Messages: {messages.length}</span>
                    <span>•</span>
                    <span className="mx-1">💬 {150 - userTurns}</span>
                    <span>•</span>
                    <span className="ml-1">🎙 {80 - voiceUserTurns}</span>
                  </div>
                </div>
              </div>
              {micError && (
                <div className="mt-1 text-[#f85149] text-xs text-center">
                  {isMobile ? (
                    micError.includes('permission') ? 
                      '🎙️ Please allow microphone access in browser settings' :
                    micError.includes('network') ?
                      '📶 Check your internet connection' :
                      '🎙️ Voice input failed - try again'
                  ) : micError}
                </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E2128] border border-[#2A2F3A] rounded-lg p-6 max-w-sm mx-4">
            <h4 className="text-lg font-medium text-white mb-2">Delete chat history?</h4>
            <p className="text-sm text-gray-400 mb-4">This will permanently delete all messages in this conversation.</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-gray-400 hover:text-white bg-transparent border-gray-700 hover:bg-gray-800"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteAll}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5-Hour Reminder Notification */}
      <ReminderNotification
        isVisible={showReminder}
        onDismiss={() => setShowReminder(false)}
        userName={user.name?.split(' ')[0] || "friend"}
      />

    </div>
  );
}
