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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
  }, []);

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
    
    if (isReturningUser) {
      // Returning user messages
      welcomeMessages = [
        `Hey bestie ${user.name?.split(' ')[0] || "friend"}, welcome back! Wassup? 💙`,
        `Yooo ${user.name?.split(' ')[0] || "friend"}! You're back! What's been going on? 💜`,
        `Hey ${user.name?.split(' ')[0] || "friend"}! Good to see you again! What's on your mind? 🤗`,
        `Sup ${user.name?.split(' ')[0] || "friend"}! Missed you bestie! Ready to catch up? 💯`
      ]
    } else {
      // First time or recent user messages - ALWAYS show for login/reload/revisit
      welcomeMessages = [
        `Hey wassup best friend ${user.name?.split(' ')[0] || "bestie"}! 💙`,
        `Yooo ${user.name?.split(' ')[0] || "bestie"}! What's good? I'm here for you best friend 💜`,
        `Hey ${user.name?.split(' ')[0] || "bestie"}! What's on your mind today best friend? I'm all ears 🤗`,
        `Sup ${user.name?.split(' ')[0] || "bestie"}! Ready to spill the tea best friend? I'm here for whatever you need 💯`
      ]
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
        // Fetch turn counts
        const userDoc = await getDoc(doc(dbInstance, "userStats", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserTurns(data.userTurns || 0);
          setVoiceUserTurns(data.voiceUserTurns || 0);
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
    setIsSending(true);
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
      // Check limits
      if (user.provider === "google") {
        if (newUserTurns > 100) {
          setIsSending(false);
          return;
        }
        if (inputIsFromVoice && newVoiceUserTurns > 80) {
          setIsSending(false);
          return;
        }
      }
      // Update counters in Firestore
      await setDoc(userDocRef, {
        userTurns: newUserTurns,
        voiceUserTurns: newVoiceUserTurns
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
      // Fetch AI response
      const conversationHistory = [...messages, userMessage].map((m) => `${m.isUser ? "User" : "FED UP"}: ${m.text}`);
      let aiResponseText = "Hey, I'm here for you. What's going on?";
      try {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Type": "main-chat"
          },
          body: JSON.stringify({ message: textToSend, conversationHistory }),
        });
        const data = await res.json();
        aiResponseText = data.response || aiResponseText;
      } catch (error) {
        // Optionally show error UI
      }
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        isUser: false,
      };
      await addDoc(collection(dbInstance, "userChats", user.uid, "messages"), aiResponse);
      if (isVoiceEnabled || wasLastInputVoice.current || inputIsFromVoice) {
        speak(aiResponseText);
      }
    } catch (error) {
      // Optionally show error UI
    } finally {
      setIsSending(false);
      sessionStorage.setItem('lastActiveTime', Date.now().toString());
    }
  };

  // On delete, remove all chat data and reset turn counts in Firestore
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
      // Reset turn counts
      await setDoc(doc(dbInstance, "userStats", user.uid), {
        userTurns: 0,
        voiceUserTurns: 0
      }, { merge: true });
      setMessages([]);
      setUserTurns(0);
      setVoiceUserTurns(0);
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
    if (!isVoiceEnabled && !wasLastInputVoice.current) return;
    
    try {
      // Stop any currently playing speech
      window.speechSynthesis.cancel();
      
      // Clean text for better speech synthesis (convert ALL emojis to words)
      const cleanText = text
        .replace(/💙/g, ' blue heart ')
        .replace(/💜/g, ' purple heart ')
        .replace(/🤗/g, ' hugging face ')
        .replace(/💯/g, ' hundred points ')
        .replace(/😊/g, ' smiling face ')
        .replace(/😢/g, ' sad face ')
        .replace(/😭/g, ' crying loudly ')
        .replace(/❤️/g, ' red heart ')
        .replace(/💕/g, ' two hearts ')
        .replace(/🥺/g, ' pleading face ')
        .replace(/😌/g, ' relieved face ')
        .replace(/🙏/g, ' folded hands ')
        .replace(/✨/g, ' sparkles ')
        .replace(/🌟/g, ' star ')
        .replace(/💖/g, ' sparkling heart ')
        .replace(/🔥/g, ' fire ')
        .replace(/💪/g, ' flexed bicep ')
        .replace(/👍/g, ' thumbs up ')
        .replace(/👎/g, ' thumbs down ')
        .replace(/😂/g, ' laughing ')
        .replace(/🤣/g, ' rolling on floor laughing ')
        .replace(/😍/g, ' heart eyes ')
        .replace(/🥰/g, ' smiling face with hearts ')
        .replace(/😘/g, ' face blowing kiss ')
        .replace(/😉/g, ' winking face ')
        .replace(/😎/g, ' cool sunglasses ')
        .replace(/🤔/g, ' thinking face ')
        .replace(/😮/g, ' open mouth ')
        .replace(/😲/g, ' astonished face ')
        .replace(/🎉/g, ' party popper ')
        .replace(/🎊/g, ' confetti ball ')
        .replace(/🌈/g, ' rainbow ')
        .replace(/☀️/g, ' sun ')
        .replace(/🌙/g, ' moon ')
        .replace(/⭐/g, ' star ')
        .replace(/💫/g, ' dizzy star ')
        .replace(/🎵/g, ' musical note ')
        .replace(/🎶/g, ' musical notes ')
        .replace(/🎤/g, ' microphone ')
        .replace(/📱/g, ' mobile phone ')
        .replace(/💻/g, ' laptop ')
        .replace(/🖥️/g, ' desktop computer ')
        .replace(/⚡/g, ' lightning bolt ')
        .replace(/🌸/g, ' cherry blossom ')
        .replace(/🌺/g, ' hibiscus ')
        .replace(/🌻/g, ' sunflower ')
        .replace(/🌹/g, ' rose ')
        .replace(/🦋/g, ' butterfly ')
        .replace(/🐱/g, ' cat ')
        .replace(/🐶/g, ' dog ')
        .replace(/🎁/g, ' gift ')
        .replace(/🍀/g, ' four leaf clover ')
        .replace(/💝/g, ' heart with ribbon ')
        .replace(/💗/g, ' growing heart ')
        .replace(/💓/g, ' beating heart ')
        .replace(/💘/g, ' heart with arrow ')
        .replace(/💋/g, ' kiss mark ')
        .replace(/👋/g, ' waving hand ')
        .replace(/🤝/g, ' handshake ')
        .replace(/👏/g, ' clapping hands ')
        .replace(/🙌/g, ' raising hands ')
        .replace(/🤲/g, ' palms up together ')
        .replace(/😇/g, ' smiling face with halo ')
        .replace(/🥳/g, ' partying face ')
        .replace(/🤗/g, ' hugging face ')
        .replace(/🤭/g, ' face with hand over mouth ')
        .replace(/🤫/g, ' shushing face ')
        .replace(/🤯/g, ' exploding head ')
        .replace(/🥹/g, ' face holding back tears ')
        .replace(/😤/g, ' huffing face ')
        .replace(/😠/g, ' angry face ')
        .replace(/😡/g, ' pouting face ')
        .replace(/🤬/g, ' face with symbols over mouth ')
        .replace(/😱/g, ' face screaming in fear ')
        .replace(/😨/g, ' fearful face ')
        .replace(/😰/g, ' anxious face with sweat ')
        .replace(/😥/g, ' sad but relieved face ')
        .replace(/😓/g, ' downcast face with sweat ')
        .replace(/🤤/g, ' drooling face ')
        .replace(/😪/g, ' sleepy face ')
        .replace(/😴/g, ' sleeping face ')
        .replace(/🥱/g, ' yawning face ')
        .replace(/😷/g, ' face with medical mask ')
        .replace(/🤒/g, ' face with thermometer ')
        .replace(/🤕/g, ' face with head bandage ')
        .replace(/🤮/g, ' face vomiting ')
        .replace(/🤧/g, ' sneezing face ')
        .replace(/🥴/g, ' woozy face ')
        .replace(/😵/g, ' dizzy face ')
        .replace(/🤐/g, ' zipper mouth face ')
        .replace(/🥶/g, ' cold face ')
        .replace(/🥵/g, ' hot face ')
        .replace(/😬/g, ' grimacing face ')
        .replace(/😑/g, ' expressionless face ')
        .replace(/😐/g, ' neutral face ')
        .replace(/🙄/g, ' face with rolling eyes ')
        .replace(/😏/g, ' smirking face ')
        .replace(/😒/g, ' unamused face ')
        .replace(/🙃/g, ' upside down face ')
        .replace(/😔/g, ' pensive face ')
        .replace(/😟/g, ' worried face ')
        .replace(/😕/g, ' confused face ')
        .replace(/☹️/g, ' frowning face ')
        .replace(/🙁/g, ' slightly frowning face ')
        .replace(/😣/g, ' persevering face ')
        .replace(/😖/g, ' confounded face ')
        .replace(/😫/g, ' tired face ')
        .replace(/😩/g, ' weary face ')
        .replace(/😤/g, ' huffing with anger ')
        .replace(/😠/g, ' angry red face ')
        .replace(/😳/g, ' flushed face ')
        .replace(/🥲/g, ' smiling face with tear ')
        .replace(/🤪/g, ' zany face ')
        .replace(/😜/g, ' winking face with tongue ')
        .replace(/😝/g, ' squinting face with tongue ')
        .replace(/😛/g, ' face with tongue ')
        .replace(/🤑/g, ' money mouth face ')
        .replace(/🤠/g, ' cowboy hat face ')
        .replace(/😈/g, ' smiling face with horns ')
        .replace(/👿/g, ' angry face with horns ')
        .replace(/👹/g, ' ogre ')
        .replace(/👺/g, ' goblin ')
        .replace(/💀/g, ' skull ')
        .replace(/☠️/g, ' skull and crossbones ')
        .replace(/👻/g, ' ghost ')
        .replace(/👽/g, ' alien ')
        .replace(/🤖/g, ' robot ')
        .replace(/🎭/g, ' performing arts ')
        .replace(/🤡/g, ' clown face ');
      
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
                        onClick={handleDeleteAll}
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
                <div className={`max-w-[85%] sm:max-w-[70%] ${message.isUser ? "ml-auto" : "mr-auto"}`}>
                  <div
                    className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg ${
                      message.isUser
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-none"
                        : "bg-[#1E2128] border border-[#2A2F3A] text-white rounded-tl-none"
                    }`}
                  >
                    {message.isUser ? (
                      <span className="text-sm sm:text-base">{message.text}</span>
                    ) : (
                      <span className="text-sm sm:text-base"><TypeWriter text={message.text} /></span>
                    )}
                    <div 
                      className={`text-xs text-gray-300 opacity-80 ${
                        message.isUser ? "text-right" : "text-left"
                      } mt-1`}
                    >
                      {new Date().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit'
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
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
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
                    <span className="mx-1">💬 {100 - userTurns}</span>
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
    </div>
  );
}
