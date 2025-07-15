"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-10 px-4 border-t border-gray-800 w-full flex justify-center items-center bg-white/5 backdrop-blur-md shadow-inner">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full max-w-xl mx-auto flex flex-col items-center gap-3 text-center"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-400">
          <span className="text-base">Built with</span>
          <Heart className="w-5 h-5 text-red-400 fill-current mx-1" />
          <span className="text-base">by</span>
          <a
            href="https://skds.site"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors underline font-semibold text-base"
          >
            <span>Saswata Kumar Dash</span>
            <img src="/logo512.png" alt="SKD Logo" className="w-9 h-9 rounded-full border border-white/20 object-cover ml-1 align-middle shadow-lg bg-black/30" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
          </a>
        </div>
        <span className="text-xs text-gray-500 mt-1">© {new Date().getFullYear()} The AlLiN Tech. All rights reserved.</span>
      </motion.div>
    </footer>
  )
}
