'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Heart, Sparkles } from 'lucide-react'

interface ChatModeProps {
  onModeChange: (mode: 'professional' | 'bestie') => void
  currentMode: 'professional' | 'bestie'
}

export default function ChatModeSelector({ onModeChange, currentMode }: ChatModeProps) {
  const modes = [
    {
      id: 'bestie' as const,
      name: 'Bestie Mode',
      icon: Heart,
      description: 'Casual, emotional support & friendship',
      features: ['Emotional support', 'Casual conversation', 'Personal advice', 'Empathetic responses'],
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'professional' as const,
      name: 'Professional Mode',
      icon: Briefcase,
      description: 'Career guidance & professional advice',
      features: ['Career guidance', 'Professional advice', 'Skill development', 'Goal setting'],
      color: 'from-blue-500 to-indigo-500'
    }
  ]

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-400" />
          Choose Your Chat Mode
        </h2>
        <p className="text-gray-400">
          Select how you'd like FED UP to interact with you
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {modes.map((mode) => {
          const Icon = mode.icon
          const isSelected = currentMode === mode.id
          
          return (
            <Card
              key={mode.id}
              className={`relative p-6 border-2 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-purple-500/50 bg-purple-500/10 scale-105'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
              }`}
              onClick={() => onModeChange(mode.id)}
            >
              {isSelected && (
                <Badge className="absolute -top-2 -right-2 bg-purple-600 text-white">
                  Active
                </Badge>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full bg-gradient-to-br ${mode.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{mode.name}</h3>
                  <p className="text-gray-400 text-sm">{mode.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Features:</h4>
                <ul className="space-y-1">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-purple-400 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`w-full mt-4 ${
                  isSelected
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => onModeChange(mode.id)}
              >
                {isSelected ? 'Currently Active' : `Switch to ${mode.name}`}
              </Button>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          You can switch between modes anytime during your conversation
        </p>
      </div>
    </div>
  )
}
