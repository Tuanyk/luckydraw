"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SlotCardProps {
  spinning: boolean
  items: number[]
  initialValue: number
  currentValue: number
}

export default function SlotCard({ spinning, items, initialValue, currentValue }: SlotCardProps) {
  const [displayedValue, setDisplayedValue] = useState(initialValue)

  useEffect(() => {
    if (spinning) {
      const interval = setInterval(() => {
        setDisplayedValue(items[Math.floor(Math.random() * items.length)])
      }, 50)
      return () => clearInterval(interval)
    } else {
      setDisplayedValue(currentValue)
    }
  }, [spinning, items, currentValue])

  return (
    <div className="rounded-xl shadow-lg overflow-hidden flex items-center justify-center slot-card">
      <AnimatePresence mode="wait">
        <motion.div
          key={displayedValue}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: spinning ? 0.1 : 0.2 }}
          className={`relative ${spinning ? "blur-sm" : ""}`}
        >
          <div className="w-12 h-16 from-indigo-600 to-indigo-800 flex items-center justify-center shadow-xl">
            <span className="text-2xl font-bold">{displayedValue}</span>
          </div>
          {spinning && <div className="absolute inset-0 bg-indigo-500/20 backdrop-blur-sm rounded-full" />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

