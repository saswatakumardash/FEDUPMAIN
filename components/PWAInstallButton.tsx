'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice

    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  const handleDownloadAPK = () => {
    // Show coming soon message
    alert('Android APK is coming soon! 📱\n\nFor now, you can:\n• Add to Home Screen from your browser\n• Use the PWA install feature\n\nStay tuned for the Android app release!')
  }

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <Smartphone className="h-4 w-4" />
        App Installed
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {isInstallable && (
        <Button
          onClick={handleInstallClick}
          variant="outline"
          className="flex items-center gap-2 bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/30"
        >
          <Monitor className="h-4 w-4" />
          Install App
        </Button>
      )}
      
      <Button
        onClick={handleDownloadAPK}
        variant="outline"
        className="flex items-center gap-2 bg-green-600/20 border-green-500/30 hover:bg-green-600/30"
      >
        <Download className="h-4 w-4" />
        Download APK
      </Button>
    </div>
  )
}
