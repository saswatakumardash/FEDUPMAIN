'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Download, Smartphone, Chrome, Info, Globe } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface PWAInstallNotificationProps {
  isOpen: boolean
  onClose: () => void
  onDismiss: () => void
  userName?: string
}

export default function PWAInstallNotification({ 
  isOpen, 
  onClose, 
  onDismiss,
  userName = "friend"
}: PWAInstallNotificationProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  const handleInstallClick = async () => {
    // Check if browser supports PWA install
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        onClose()
      }
    } else {
      // Show manual instructions
      setShowInstructions(true)
    }
  }

  const handleDownloadAPK = () => {
    // For now, show a message that APK is coming soon
    alert('Android APK is coming soon! 📱\n\nFor now, you can:\n• Add to Home Screen from your browser\n• Use the PWA install feature\n\nStay tuned for the Android app release!')
  }

  const getInstallInstructions = () => {
    const isChrome = /Chrome/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isAndroid && isChrome) {
      return {
        icon: <Chrome className="h-6 w-6 text-blue-400" />,
        title: "Install on Android (Chrome)",
        steps: [
          "Tap the menu button (⋮) in Chrome",
          "Select 'Add to Home screen'",
          "Confirm by tapping 'Add'",
          "FED UP will appear on your home screen!"
        ]
      }
    } else if (isIOS && isSafari) {
      return {
        icon: <Globe className="h-6 w-6 text-blue-400" />,
        title: "Install on iPhone/iPad (Safari)",
        steps: [
          "Tap the Share button (⬆️) at the bottom",
          "Scroll down and tap 'Add to Home Screen'",
          "Edit the name if needed, then tap 'Add'",
          "FED UP will appear on your home screen!"
        ]
      }
    } else {
      return {
        icon: <Smartphone className="h-6 w-6 text-purple-400" />,
        title: "Install as App",
        steps: [
          "Look for an 'Install' or 'Add to Home Screen' option in your browser menu",
          "For Chrome: Menu (⋮) → 'Install app' or 'Add to Home screen'",
          "For Edge: Menu (⋯) → 'Apps' → 'Install this site as an app'",
          "For Firefox: Use the + icon in the address bar if available"
        ]
      }
    }
  }

  const instructions = getInstallInstructions()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-purple-500/30 text-white backdrop-blur-md">
        {!showInstructions ? (
          <>
            <DialogHeader className="relative">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2 pr-8">
                <Smartphone className="h-6 w-6 text-purple-400" />
                Get the FED UP App!
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute -top-1 -right-1 h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-purple-100 mb-4">
                  Hey {userName}! 👋 Want quick access to FED UP? Install it as an app on your device for a better experience! 💜
                </p>
                
                <div className="grid gap-3">
                  <Button
                    onClick={handleInstallClick}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 py-3"
                  >
                    <Smartphone className="h-4 w-4" />
                    Add to Home Screen
                  </Button>
                  
                  <Button
                    onClick={handleDownloadAPK}
                    variant="outline"
                    className="w-full border-emerald-500/30 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 flex items-center gap-2 py-3"
                  >
                    <Download className="h-4 w-4" />
                    Download Android APK (Soon!)
                  </Button>
                  
                  <Button
                    onClick={() => setShowInstructions(true)}
                    variant="ghost"
                    className="w-full text-purple-200 hover:text-white hover:bg-purple-500/20 flex items-center gap-2"
                  >
                    <Info className="h-4 w-4" />
                    Show me how
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-purple-500/30">
                <Button
                  onClick={onDismiss}
                  variant="outline"
                  className="flex-1 border-gray-500/30 text-gray-300 hover:bg-gray-500/20 text-sm"
                >
                  Don't Show Again
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="flex-1 text-purple-200 hover:bg-purple-500/20 text-sm"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="relative">
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2 pr-8">
                {instructions.icon}
                {instructions.title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(false)}
                className="absolute -top-1 -right-1 h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
              >
                ←
              </Button>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-3">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-purple-100 text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  💡 Once installed, you can access FED UP like any other app on your device!
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={onDismiss}
                  variant="outline"
                  className="flex-1 border-gray-500/30 text-gray-300 hover:bg-gray-500/20 text-sm"
                >
                  Don't Show Again
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="flex-1 text-purple-200 hover:bg-purple-500/20 text-sm"
                >
                  Got It!
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
