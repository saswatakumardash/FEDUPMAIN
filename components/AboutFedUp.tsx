"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

const introLines = [
  "❓ What’s FED UP About?",
  "FED UP is an AI-powered emotional support platform for people who are mentally tired, emotionally drained, or just done pretending everything's okay. 🧠💔",
  "",
  "It’s for:",
  "🌙 The one silently breaking down at night",
  "📩 The jobseeker who’s tired of rejection emails",
  "🚀 The startup builder doubting every decision",
  "📚 The student who can’t tell if they’re burnt out or just broken",
  "",
  "Unlike normal AI tools, FED UP doesn’t give productivity tips or fake positivity.",
  "It listens. It understands. It talks like someone who’s been there.",
  "",
  "You don’t need to ask the right question.",
  "You just vent.",
  "And it replies like a late-night friend who gets it — softly, sometimes bluntly, but always real.",
  "",
  "It’s not about fixing you. It’s about standing by you when you feel broken. 💙"
]

function useNaturalTyping(lines: string[], minSpeed = 16, maxSpeed = 32, lineDelay = 900) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const timeoutRef = useRef<any>(null)

  useEffect(() => {
    if (currentLine >= lines.length) return
    let charIndex = 0
    setCurrentText("")
    function typeChar() {
      if (charIndex < lines[currentLine].length) {
        setCurrentText(lines[currentLine].slice(0, charIndex + 1))
        charIndex++
        const delay = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed
        timeoutRef.current = setTimeout(typeChar, delay)
      } else {
        setDisplayedLines((prev) => [...prev, lines[currentLine]])
        setCurrentText("")
        timeoutRef.current = setTimeout(() => setCurrentLine((prev) => prev + 1), lineDelay)
      }
    }
    typeChar()
    return () => clearTimeout(timeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLine])

  const isTyping = currentLine < lines.length && currentText.length > 0 && currentText.length < lines[currentLine].length + 1
  return { displayedLines, currentText, isTyping, currentLine }
}

export default function AboutFedUp() {
  const isMobile = useIsMobile()
  const { displayedLines, currentText, isTyping, currentLine } = useNaturalTyping(introLines)
  const allLines = introLines
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2, type: "spring" }}
      viewport={{ once: true }}
      className="w-full max-w-3xl mx-auto mt-16 mb-8 px-4"
    >
      <div
        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12 glass-card"
        style={{ boxShadow: "0 8px 48px 0 #7c3aed33, 0 1.5px 8px 0 #fff2" }}
      >
        <AnimatePresence>
          {isMobile
            ? allLines.map((line, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.04 }}
                  className={
                    idx === 0
                      ? "text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight drop-shadow-[0_2px_32px_#7c3aed44] flex items-center gap-2"
                      : line.startsWith("🌙") || line.startsWith("📩") || line.startsWith("🚀") || line.startsWith("📚")
                      ? "pl-4 md:pl-8 text-base md:text-lg text-[#7c3aed] font-semibold mb-1 flex items-center gap-2"
                      : "mb-3 font-mono text-lg md:text-xl text-gray-100"
                  }
                  style={{ fontFamily: idx === 0 ? 'inherit' : 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                >
                  {line}
                </motion.div>
              ))
            : <>
                {displayedLines.map((line, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, delay: idx * 0.04 }}
                    className={
                      idx === 0
                        ? "text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight drop-shadow-[0_2px_32px_#7c3aed44] flex items-center gap-2"
                        : line.startsWith("🌙") || line.startsWith("📩") || line.startsWith("🚀") || line.startsWith("📚")
                        ? "pl-4 md:pl-8 text-base md:text-lg text-[#7c3aed] font-semibold mb-1 flex items-center gap-2"
                        : "mb-3 font-mono text-lg md:text-xl text-gray-100"
                    }
                    style={{ fontFamily: idx === 0 ? 'inherit' : 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                  >
                    {line}
                  </motion.div>
                ))}
                {isTyping && currentLine < introLines.length && currentText && (
                  <motion.div
                    key={displayedLines.length}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, delay: displayedLines.length * 0.04 }}
                    className={
                      displayedLines.length === 0
                        ? "text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight drop-shadow-[0_2px_32px_#7c3aed44] flex items-center gap-2"
                        : introLines[displayedLines.length].startsWith("🌙") || introLines[displayedLines.length].startsWith("📩") || introLines[displayedLines.length].startsWith("🚀") || introLines[displayedLines.length].startsWith("📚")
                        ? "pl-4 md:pl-8 text-base md:text-lg text-[#7c3aed] font-semibold mb-1 flex items-center gap-2"
                        : "mb-3 font-mono text-lg md:text-xl text-gray-100"
                    }
                    style={{ fontFamily: displayedLines.length === 0 ? 'inherit' : 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                  >
                    {currentText}
                    <span className="animate-pulse text-[#ec4899] ml-1">|</span>
                  </motion.div>
                )}
              </>}
        </AnimatePresence>
      </div>
      <style jsx global>{`
        .glass-card {
          background: rgba(24, 28, 35, 0.72);
          border: 1.5px solid rgba(255,255,255,0.13);
          box-shadow: 0 8px 48px 0 #7c3aed33, 0 1.5px 8px 0 #fff2;
        }
      `}</style>
    </motion.section>
  )
} 