'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MessageCircle, Zap, Crown, Calendar } from 'lucide-react'

interface LimitReachedModalProps {
  isOpen: boolean
  onClose: () => void
  limitType: 'daily' | 'monthly'
  resetTime?: string
}

export default function LimitReachedModal({ 
  isOpen, 
  onClose, 
  limitType,
  resetTime = "next month"
}: LimitReachedModalProps) {
  const handleContactSupport = () => {
    window.open('mailto:contact@skds.site?subject=FED UP - Limit Upgrade Request&body=Hi, I would like to upgrade my FED UP limits. Please provide pricing information.', '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <MessageCircle className="h-7 w-7 text-amber-500" />
            Monthly Limit Reached
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300 mt-2">
            You've reached your free monthly limit of 150 messages. Contact us for upgrade options!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Usage */}
          <Card className="bg-gray-800/50 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Free Plan Usage</h3>
                  <p className="text-sm text-gray-400">Resets {resetTime}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                150/150 Used
              </Badge>
            </div>
          </Card>

          {/* Contact for Upgrade */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Crown className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Want More Messages?</h3>
                <p className="text-purple-200 text-sm leading-relaxed">
                  Get unlimited messages, priority support, and advanced features by upgrading your plan.
                  Contact our team for personalized pricing options!
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleContactSupport}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact for Upgrade - contact@skds.site
                </Button>
                <p className="text-xs text-gray-400">
                  We'll get back to you within 24 hours with pricing details
                </p>
              </div>
            </div>
          </Card>

          {/* What You Get */}
          <Card className="bg-gray-800/30 border-gray-700 p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Upgrade Benefits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Unlimited monthly messages
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Priority response times
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Advanced AI features
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                24/7 premium support
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleContactSupport}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              Get Unlimited Access
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
