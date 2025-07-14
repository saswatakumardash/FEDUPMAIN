"use client"

import { motion } from "framer-motion"

const differences = [
  {
    emoji: "💬",
    text: "ChatGPT gives answers. FED UP gives truths you needed to hear.",
  },
  {
    emoji: "🧘",
    text: "Therapy is expensive. FED UP shows up at 2 AM — no judgment.",
  },
  {
    emoji: "⚠️",
    text: "Others avoid emotions. FED UP leans into them.",
  },
  {
    emoji: "💥",
    text: "No fake positivity. No hustle grind BS. Just raw support.",
  },
]

export default function Difference() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white dark:text-white light:text-slate-800 mb-8">
            Why FED UP is Different
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {differences.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 dark:bg-white/10 light:bg-slate-800/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-left"
              >
                <div className="text-3xl mb-3">{item.emoji}</div>
                <p className="text-white dark:text-white light:text-slate-800 text-lg leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-8"
          >
            <blockquote className="text-xl md:text-2xl font-medium text-white dark:text-white light:text-slate-800 italic">
              "This isn't AI for productivity. It's AI for pain, growth, and coming back stronger."
            </blockquote>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
