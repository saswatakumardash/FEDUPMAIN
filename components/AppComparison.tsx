"use client"

import { motion } from "framer-motion"
import { Download, Globe, Smartphone, Cloud, Users, Zap, Shield, RotateCcw, HardDrive, Wifi } from "lucide-react"
import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function AppComparison() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleDownloadAPK = () => {
    // Check if APK is available in public folder
    const apkUrl = '/fedup-app.apk' // You can change this filename when you add the APK
    
    // Try to download APK, if not available show coming soon
    const link = document.createElement('a')
    link.href = apkUrl
    link.download = 'FedUp-App.apk'
    
    // Check if APK exists
    fetch(apkUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          // APK exists, start download
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else {
          // APK not found, show coming soon message
          alert('Android APK is coming soon! 📱\n\nFor now, you can:\n• Add to Home Screen from your browser\n• Use the PWA install feature\n\nStay tuned for the Android app release!')
        }
      })
      .catch(() => {
        // APK not found, show coming soon message
        alert('Android APK is coming soon! 📱\n\nFor now, you can:\n• Add to Home Screen from your browser\n• Use the PWA install feature\n\nStay tuned for the Android app release!')
      })
  }

  const handleUseWebApp = async () => {
    if (isInstallable && deferredPrompt) {
      // If installable, prompt for PWA installation
      try {
        deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice
        
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null)
          setIsInstallable(false)
        }
      } catch (error) {
        console.error('Error installing PWA:', error)
        // Fallback: redirect to app
        window.location.href = '/chat'
      }
    } else {
      // If not installable or already installed, go to app
      window.location.href = '/chat'
    }
  }
  return (
    <section className="relative py-20 bg-[#0d1117] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#10131a] via-[#0d1117] to-[#10131a] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Choose Your Experience
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Download our APK for quick access or use the Web App for full cross-device sync. Both offer the same powerful AI experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* APK Version */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1c2128] to-[#161b22] border border-[#30363d] rounded-2xl p-8 hover:border-[#7c3aed] transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] p-3 rounded-xl mr-4">
                <Download className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Download APK</h3>
                <p className="text-[#7c3aed] font-semibold">Quick & Simple</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-[#7c3aed] mr-3" />
                <span className="text-gray-300">Instant access, no account needed</span>
              </div>
              <div className="flex items-center">
                <HardDrive className="w-5 h-5 text-[#7c3aed] mr-3" />
                <span className="text-gray-300">Messages stored locally on device</span>
              </div>
              <div className="flex items-center">
                <Smartphone className="w-5 h-5 text-[#7c3aed] mr-3" />
                <span className="text-gray-300">Works offline after download</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-[#7c3aed] mr-3" />
                <span className="text-gray-300">Guest mode with usage limits</span>
              </div>
            </div>

            <div className="bg-[#0d1117] rounded-lg p-4 mb-6">
              <h4 className="text-white font-semibold mb-3">Perfect for:</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Quick emotional support sessions</li>
                <li>• Private, device-only conversations</li>
                <li>• Users who prefer not to sign in</li>
                <li>• Single device usage</li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadAPK}
              className="w-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#8b5cf6] hover:to-[#f472b6] text-white font-semibold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download APK
            </motion.button>
          </motion.div>

          {/* Web App Version */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1c2128] to-[#161b22] border border-[#30363d] rounded-2xl p-8 hover:border-[#ec4899] transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-[#ec4899] to-[#7c3aed] p-3 rounded-xl mr-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Web App</h3>
                <p className="text-[#ec4899] font-semibold">Full Experience</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Cloud className="w-5 h-5 text-[#ec4899] mr-3" />
                <span className="text-gray-300">Cross-device sync with Google login</span>
              </div>
              <div className="flex items-center">
                <RotateCcw className="w-5 h-5 text-[#ec4899] mr-3" />
                <span className="text-gray-300">Access conversations anywhere</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-[#ec4899] mr-3" />
                <span className="text-gray-300">No usage limits with account</span>
              </div>
              <div className="flex items-center">
                <Wifi className="w-5 h-5 text-[#ec4899] mr-3" />
                <span className="text-gray-300">PWA - Add to home screen</span>
              </div>
            </div>

            <div className="bg-[#0d1117] rounded-lg p-4 mb-6">
              <h4 className="text-white font-semibold mb-3">Perfect for:</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Long-term emotional support journey</li>
                <li>• Multiple device usage</li>
                <li>• Building ongoing conversation history</li>
                <li>• Premium features and unlimited access</li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUseWebApp}
              className="w-full bg-gradient-to-r from-[#ec4899] to-[#7c3aed] hover:from-[#f472b6] hover:to-[#8b5cf6] text-white font-semibold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Globe className="w-5 h-5" />
              {isInstallable ? 'Install Web App' : 'Use Web App'}
            </motion.button>
          </motion.div>
        </div>

        {/* Safari Installation Guide */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-[#1c2128] to-[#161b22] border border-[#30363d] rounded-2xl p-8 max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            📱 Add to iPhone Home Screen (Safari)
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-[#7c3aed] w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <p className="text-gray-300">Open fedup.skds.site in Safari</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-[#ec4899] w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <p className="text-gray-300">Tap Share button (bottom center)</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-[#7c3aed] w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <p className="text-gray-300">Select "Add to Home Screen"</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Works like a native app with offline support and push notifications! 
            </p>
          </div>
        </motion.div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 text-lg">
            Same AI, same support, choose what works best for you 💜
          </p>
        </motion.div>
      </div>
    </section>
  )
}
