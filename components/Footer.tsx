"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <span>Built with</span>
          <Heart className="w-4 h-4 text-red-400 fill-current" />
          <span>by</span>
          <a
            href="https://skds.site"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors underline"
          >
            <span>Saswata Kumar Dash</span>
            <img src="/logo512.png" alt="SKD Logo" className="w-10 h-10 rounded-full border border-white/20 object-cover ml-1 align-middle shadow-lg" style={{ display: 'inline-block', verticalAlign: 'middle', background: 'none' }} />
          </a>
        </div>
      </motion.div>
    </footer>
  )
}
