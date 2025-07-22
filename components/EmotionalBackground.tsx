"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useMemo } from "react"

const emotions = ["😊", "😔", "💜", "😡", "😮", "😌", "🥺", "😤", "😢", "💖", "✨", "🌟"]

const createGlobePoints = (count: number, radius: number) => {
  const points: { x: number; y: number; z: number }[] = []
  const phi = Math.PI * (3 - Math.sqrt(5)) // Golden angle
  
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2 // y goes from 1 to -1
    const r = Math.sqrt(1 - y * y) // radius at y
    const theta = phi * i // golden angle increment

    points.push({
      x: Math.cos(theta) * r * radius,
      y: y * radius,
      z: Math.sin(theta) * r * radius
    })
  }
  return points
}

export default function EmotionalBackground() {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const points = useMemo(() => createGlobePoints(30, 40), [])
  const [particles, setParticles] = useState(points.map((point, i) => ({
    id: i,
    ...point,
    emoji: emotions[Math.floor(Math.random() * emotions.length)]
  })))

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => ({
        x: r.x + 0.01,
        y: r.y + 0.02,
        z: r.z + 0.005
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const calculatePosition = (point: typeof particles[0]) => {
    const cosX = Math.cos(rotation.x)
    const sinX = Math.sin(rotation.x)
    const cosY = Math.cos(rotation.y)
    const sinY = Math.sin(rotation.y)

    const rotatedX = point.x * cosY - point.z * sinY
    const rotatedZ = point.x * sinY + point.z * cosY
    const rotatedY = point.y * cosX - rotatedZ * sinX
    const finalZ = point.y * sinX + rotatedZ * cosX

    return {
      x: rotatedX,
      y: rotatedY,
      scale: (finalZ + 50) / 100 // Scale based on z-position
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[80vh] h-[80vh]">
          {particles.map(particle => {
            const pos = calculatePosition(particle)
            return (
              <motion.div
                key={particle.id}
                className="absolute text-2xl"
                style={{
                  left: "50%",
                  top: "50%",
                  opacity: Math.max(0.05, pos.scale * 0.2)
                }}
                animate={{
                  x: pos.x,
                  y: pos.y,
                  scale: pos.scale,
                }}
                transition={{ duration: 0.1 }}
              >
                {particle.emoji}
              </motion.div>
            )
          })}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-[#111318]/80 to-[#111318] z-10" />
    </div>
  )
}
