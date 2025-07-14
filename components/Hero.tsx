"use client"

import { motion } from "framer-motion"
import EmojiGlobe from "./EmojiGlobe"
import WaitlistForm from "./WaitlistForm"


export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-[#10131a] w-full overflow-hidden">
      {/* Glowing animated background, now more to the left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.1 }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 60%, #7c3aed55 0%, #10131a 60%), radial-gradient(ellipse at 80% 30%, #ec489955 0%, #10131a 70%)",
          filter: "blur(60px)",
        }}
      />
      <div className="w-full max-w-7xl flex flex-col items-center justify-center px-4 py-12 relative z-10">
        {/* Logo */}
        <motion.img
          src="/fedup-logo.png"
          alt="FED UP"
          className="w-44 h-44 mb-8 drop-shadow-[0_0_48px_#7c3aed88]"
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
        />
        {/* Main heading */}
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold mb-4 text-white tracking-tight leading-none text-center drop-shadow-[0_2px_32px_#7c3aed44]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
        >
          FED UP
        </motion.h1>
        <motion.p
          className="text-2xl md:text-4xl text-gray-300 mb-2 font-medium leading-tight text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, type: "spring" }}
        >
          For the Tired, the Lost, the Real
        </motion.p>
        <motion.p
          className="text-lg md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, type: "spring" }}
        >
          An AI that listens, supports, and gives the truth. No filters. No toxic positivity.
        </motion.p>
        {/* EmojiGlobe and WaitlistForm side by side, centered */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 md:gap-16 w-full mt-2 md:mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
        >
          <div className="flex-shrink-0 min-w-0 overflow-visible max-w-full md:max-w-[48%] xl:max-w-[44%] 2xl:max-w-[40%] flex items-center justify-center">
            <EmojiGlobe />
          </div>
          <motion.div
            className="w-full max-w-lg flex flex-col items-center md:max-w-[52%] xl:max-w-[56%] 2xl:max-w-[60%]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7, type: "spring" }}
          >
            <WaitlistForm />
          </motion.div>
        </motion.div>
      </div>
   
    </section>
  )
}
