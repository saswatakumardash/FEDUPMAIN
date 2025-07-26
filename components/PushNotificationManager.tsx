'use client'

import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bell, BellOff, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PushNotificationManager() {
  // Don't render if auth is not available
  if (!auth) return null
  
  const [user] = useAuthState(auth)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  // Friendly notification messages
  const welcomeMessages = [
    "Hey wassup! 💜 Just checking in to see how you're doing today!",
    "Yo! What's good? 🌟 Your bestie is here if you need to chat!",
    "Hey there! 💕 Hope you're having an amazing day! I'm here for you ✨",
    "Bestie check-in! 🌈 Remember I'm always here when you need me!"
  ]

  const reminderMessages = [
    "Hey! 💜 Just wanted to remind you I'm here if you need someone to talk to!",
    "Wassup bestie! 🌟 Taking a moment to check in - how are you feeling?",
    "Your digital bestie is thinking of you! 💕 I'm here whenever you need me ✨",
    "Hey friend! 🌈 Just a friendly reminder that I'm always here to listen!"
  ]

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator)
    
    if ('Notification' in window) {
      setPermission(Notification.permission)
      
      // Show permission prompt for logged-in users
      if (user && Notification.permission === 'default') {
        setTimeout(() => setShowPermissionPrompt(true), 3000) // Show after 3 seconds
      }
    }
  }, [user])

  useEffect(() => {
    if (user && permission === 'granted') {
      // Send welcome notification when user logs in
      sendWelcomeNotification()
      
      // Set up 2-hour reminder notifications
      setupReminderNotifications()
    }
  }, [user, permission])

  const requestPermission = async () => {
    if (!isSupported) return

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      setShowPermissionPrompt(false)
      
      if (result === 'granted') {
        sendWelcomeNotification()
        setupReminderNotifications()
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }

  const sendWelcomeNotification = () => {
    if (permission !== 'granted') return
    
    const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
    
    // Send both browser notification and service worker notification
    sendBrowserNotification('FED UP - Your Bestie 💜', message)
    sendServiceWorkerNotification('Welcome back!', message)
  }

  const sendBrowserNotification = (title: string, body: string) => {
    if (permission !== 'granted') return

    const notification = new Notification(title, {
      body,
      icon: '/fedup-logo.png',
      tag: 'fedup-reminder',
      requireInteraction: false,
      silent: false
    })

    notification.onclick = () => {
      window.focus()
      window.open('/chat', '_blank')
      notification.close()
    }

    // Auto close after 8 seconds
    setTimeout(() => notification.close(), 8000)
  }

  const sendServiceWorkerNotification = async (title: string, body: string) => {
    if (!('serviceWorker' in navigator) || permission !== 'granted') return

    try {
      const registration = await navigator.serviceWorker.ready
      
      await registration.showNotification(title, {
        body,
        icon: '/fedup-logo.png',
        tag: 'fedup-reminder',
        requireInteraction: false,
        data: {
          url: '/chat'
        }
      })
    } catch (error) {
      console.error('Error sending service worker notification:', error)
    }
  }

  const setupReminderNotifications = () => {
    if (permission !== 'granted') return

    // Clear any existing intervals
    const existingInterval = localStorage.getItem('fedup-reminder-interval')
    if (existingInterval) {
      clearInterval(parseInt(existingInterval))
    }

    // Set up 2-hour reminder (2 hours = 7200000 milliseconds)
    const intervalId = setInterval(() => {
      if (permission === 'granted' && user) {
        const message = reminderMessages[Math.floor(Math.random() * reminderMessages.length)]
        sendBrowserNotification('FED UP - Bestie Check-in 💜', message)
        sendServiceWorkerNotification('Hey there! 🌟', message)
      }
    }, 2 * 60 * 60 * 1000) // 2 hours

    // Store interval ID
    localStorage.setItem('fedup-reminder-interval', intervalId.toString())

    // Cleanup on component unmount
    return () => {
      clearInterval(intervalId)
      localStorage.removeItem('fedup-reminder-interval')
    }
  }

  const dismissPermissionPrompt = () => {
    setShowPermissionPrompt(false)
  }

  // Don't show anything if user is not logged in
  if (!user || !isSupported) return null

  return (
    <>
      {/* Permission Request Prompt */}
      <AnimatePresence>
        {showPermissionPrompt && permission === 'default' && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-4 left-4 right-4 z-50 flex justify-center"
          >
            <Card className="bg-gradient-to-r from-purple-600/95 to-pink-600/95 backdrop-blur-md border-purple-500/30 max-w-md w-full shadow-2xl">
              <div className="p-4 text-white relative">
                <Button
                  onClick={dismissPermissionPrompt}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Bell className="h-5 w-5 text-yellow-200" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Stay Connected! 💜</h3>
                    <p className="text-purple-100 text-sm opacity-90">Enable notifications for check-ins</p>
                  </div>
                </div>
                
                <p className="text-purple-50 text-sm leading-relaxed mb-4">
                  Hey! Want me to send you friendly check-ins every 2 hours? I'll send sweet "wassup" messages to make sure you're doing okay! 🌟
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={requestPermission}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
                    size="sm"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Yes, enable! 💜
                  </Button>
                  <Button
                    onClick={dismissPermissionPrompt}
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    size="sm"
                  >
                    Maybe later
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Status Indicator */}
      {permission === 'granted' && (
        <div className="fixed bottom-4 right-4 z-40">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/20 border border-green-500/30 rounded-full p-2 backdrop-blur-sm"
          >
            <Bell className="h-4 w-4 text-green-400" />
          </motion.div>
        </div>
      )}

      {permission === 'denied' && (
        <div className="fixed bottom-4 right-4 z-40">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-orange-500/20 border border-orange-500/30 rounded-full p-2 backdrop-blur-sm"
          >
            <BellOff className="h-4 w-4 text-orange-400" />
          </motion.div>
        </div>
      )}
    </>
  )
}
