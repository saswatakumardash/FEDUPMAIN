"use client"

import { useEffect, useState } from "react"

interface VisitorCounterProps {
  className?: string
}

export default function VisitorCounter({ className = "" }: VisitorCounterProps) {
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Increment visitor count when component mounts
    const incrementVisitor = async () => {
      try {
        const response = await fetch('/api/visitor-count', {
          method: 'POST',
        })
        const data = await response.json()
        setCount(data.count)
      } catch (error) {
        console.error('Error incrementing visitor count:', error)
        // Fallback to just getting the current count
        try {
          const response = await fetch('/api/visitor-count')
          const data = await response.json()
          setCount(data.count)
        } catch (fallbackError) {
          console.error('Error fetching visitor count:', fallbackError)
          setCount(0)
        }
      } finally {
        setLoading(false)
      }
    }

    incrementVisitor()
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-400">Loading visitors...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span className="text-sm text-gray-400">
        {count.toLocaleString()} visitors
      </span>
    </div>
  )
}
