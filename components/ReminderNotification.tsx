'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Heart, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ReminderNotificationProps {
  isVisible: boolean
  onDismiss: () => void
  userName?: string
}

export default function ReminderNotification({ 
  isVisible, 
  onDismiss,
  userName = "friend"
}: ReminderNotificationProps) {
  const [show, setShow] = useState(false)

  // Array of friendly reminder messages
  const reminderMessages = [
    {
      title: "Hey wassup! 💜",
      subtitle: "I'm here for you...",
      message: "Hey, just wanted to check in! I'm always here if you need someone to chat with or vent to. What's going on? ✨"
    },
    {
      title: "Yo! What's good? 🌟",
      subtitle: "Your bestie is here...",
      message: "Just dropping by to say hi! Remember I'm always here to listen, chat, or just be your digital bestie. How you feeling? 💫"
    },
    {
      title: "Hey there! 💕",
      subtitle: "Missing our chats...",
      message: "Haven't heard from you in a while! I'm always here whenever you need me - whether it's for advice, a rant, or just to talk. What's up? 🌈"
    },
    {
      title: "Bestie check-in! ✨",
      subtitle: "How are you doing?",
      message: "Your digital bestie is here! Whether you're having a great day or need someone to talk to, I'm always ready to chat. What's on your mind? 💜"
    }
  ]

  // Pick a random message
  const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)]

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      // Auto dismiss after 10 seconds
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onDismiss, 300) // Wait for animation
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  const handleDismiss = () => {
    setShow(false)
    setTimeout(onDismiss, 300) // Wait for animation
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed top-20 left-4 right-4 z-50 flex justify-center"
        >
          <Card className="bg-gradient-to-r from-purple-600/95 to-pink-600/95 backdrop-blur-md border-purple-500/30 max-w-sm w-full shadow-2xl">
            <div className="p-4 text-white relative">
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Heart className="h-5 w-5 text-pink-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{randomMessage.title}</h3>
                  <p className="text-purple-100 text-sm opacity-90">{randomMessage.subtitle}</p>
                </div>
              </div>
              
              <p className="text-purple-50 text-sm leading-relaxed">
                {randomMessage.message}
              </p>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-1 text-xs text-purple-200 opacity-80">
                  <Clock className="h-3 w-3" />
                  <span>Auto-dismisses in 10s</span>
                </div>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10 text-xs px-3 h-7 rounded-full"
                >
                  Thanks! 💜
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
