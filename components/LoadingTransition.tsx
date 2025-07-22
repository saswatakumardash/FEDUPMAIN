"use client"

import { motion } from "framer-motion"

export default function LoadingTransition() {
  return (
    <motion.div 
      className="fixed inset-0 bg-[#111318] flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, delay: 1.5 }}
    >
      <motion.div 
        className="relative w-32 h-32"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src="/fedup-logo.png" alt="FED UP Logo" className="w-full h-full" />
        <motion.div
          className="absolute inset-0 border-4 border-[#7c3aed] rounded-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      <motion.p 
        className="mt-8 text-white text-xl font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Preparing your safe space...
      </motion.p>
      <div className="mt-4 flex gap-3">
        {["😊", "💜", "✨"].map((emoji, i) => (
          <motion.span
            key={emoji}
            className="text-2xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.2 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}
