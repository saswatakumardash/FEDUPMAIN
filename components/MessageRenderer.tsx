'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import CodeBlock from './CodeBlock'

interface MessageRendererProps {
  text: string
  isUser: boolean
  chatMode?: 'professional' | 'bestie'
}

export default function MessageRenderer({ text, isUser, chatMode = 'bestie' }: MessageRendererProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyAll = async () => {
    try {
      // For professional mode, extract just the code if present
      let textToCopy = text
      if (chatMode === 'professional') {
        const codeBlockMatches = text.match(/```[\s\S]*?```/g)
        if (codeBlockMatches) {
          textToCopy = codeBlockMatches
            .map(block => block.replace(/```\w*\n?/g, '').replace(/```/g, ''))
            .join('\n\n')
        }
      }
      
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy message:', err)
    }
  }

  if (isUser) {
    return <span className="text-sm sm:text-base">{text}</span>
  }

  // Parse the message for code blocks
  const parseMessage = (message: string) => {
    const parts = []
    let lastIndex = 0
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
    let match

    while ((match = codeBlockRegex.exec(message)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = message.slice(lastIndex, match.index)
        if (textBefore.trim()) {
          parts.push({
            type: 'text',
            content: textBefore.trim()
          })
        }
      }

      // Add code block
      const language = match[1] || 'text'
      const code = match[2].trim()
      
      // Extract filename if present in the text before code block
      let filename = undefined
      const textBefore = message.slice(Math.max(0, match.index - 100), match.index)
      const filenameMatch = textBefore.match(/([a-zA-Z0-9_-]+\.[a-zA-Z0-9]+)\s*:?\s*$/i)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
      
      parts.push({
        type: 'code',
        content: code,
        language: language,
        filename: filename
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < message.length) {
      const remainingText = message.slice(lastIndex)
      if (remainingText.trim()) {
        parts.push({
          type: 'text',
          content: remainingText.trim()
        })
      }
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: message }]
  }

  const messageParts = parseMessage(text)
  const hasCodeBlocks = messageParts.some(part => part.type === 'code')

  return (
    <div className="text-sm sm:text-base relative group">
      {/* Global copy button for the entire message */}
      <Button
        onClick={handleCopyAll}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#2A2F3A] hover:bg-[#3A3F4A] h-6 w-6 p-0 rounded z-10"
        title={chatMode === 'professional' && hasCodeBlocks ? "Copy code" : "Copy message"}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-400" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>

      {/* Render message parts */}
      <div className="pr-8">
        {messageParts.map((part, index) => {
          if (part.type === 'code') {
            return (
              <CodeBlock
                key={index}
                code={part.content}
                language={part.language}
                filename={part.filename}
              />
            )
          } else {
            return (
              <div key={index} className="whitespace-pre-wrap mb-2">
                {part.content}
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}
