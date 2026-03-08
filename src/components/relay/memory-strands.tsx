"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const strands = [
  { id: "one", left: "-6%", top: "15%", width: "52%", rotate: -10, delay: 0 },
  { id: "two", left: "30%", top: "10%", width: "60%", rotate: 16, delay: 0.6 },
  { id: "three", left: "8%", top: "48%", width: "70%", rotate: -5, delay: 1.2 },
  { id: "four", left: "48%", top: "58%", width: "46%", rotate: 11, delay: 1.8 },
]

const orbs = [
  { id: "orb-a", left: "8%", top: "18%", size: 360, color: "rgba(45,211,191,0.12)" },
  { id: "orb-b", left: "72%", top: "12%", size: 280, color: "rgba(167,139,250,0.1)" },
  { id: "orb-c", left: "62%", top: "62%", size: 340, color: "rgba(251,191,36,0.08)" },
]

const waveBars = [22, 36, 18, 44, 28, 34, 16, 38, 26, 42, 24, 34]

type MemoryStrandsProps = {
  className?: string
}

export function MemoryStrands({ className }: MemoryStrandsProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(27,56,89,0.35),transparent_42%),linear-gradient(180deg,rgba(5,10,19,0.18),rgba(5,10,19,0.65))]" />

      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            background: orb.color,
          }}
          animate={{
            opacity: [0.35, 0.6, 0.35],
            scale: [0.96, 1.04, 0.96],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "mirror",
          }}
        />
      ))}

      {strands.map((strand) => (
        <div
          key={strand.id}
          className="absolute"
          style={{
            left: strand.left,
            top: strand.top,
            width: strand.width,
            transform: `rotate(${strand.rotate}deg)`,
          }}
        >
          <motion.div
            className="h-px rounded-full bg-[linear-gradient(90deg,rgba(58,145,177,0),rgba(116,241,233,0.42),rgba(179,133,255,0.24),rgba(58,145,177,0))]"
            animate={{ opacity: [0.4, 0.82, 0.4] }}
            transition={{
              duration: 8,
              delay: strand.delay,
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
          <motion.div
            className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border border-white/30 bg-[radial-gradient(circle_at_center,rgba(192,255,249,0.94),rgba(88,189,176,0.24)_58%,transparent_70%)] shadow-[0_0_28px_rgba(98,228,218,0.45)]"
            animate={{
              left: ["8%", "88%", "8%"],
              scale: [0.9, 1.15, 0.9],
              opacity: [0.55, 1, 0.55],
            }}
            transition={{
              duration: 14,
              delay: strand.delay,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,rgba(7,13,23,0),rgba(7,13,23,0.92))]" />

      <div className="absolute right-[6%] bottom-[10%] flex items-end gap-1 rounded-full border border-white/8 bg-[rgba(8,16,28,0.46)] px-4 py-3 backdrop-blur-sm">
        {waveBars.map((height, index) => (
          <motion.span
            key={`${height}-${index}`}
            className="w-1 rounded-full bg-[linear-gradient(180deg,rgba(181,148,255,0.36),rgba(104,240,229,0.9))]"
            style={{ height }}
            animate={{
              opacity: [0.35, 1, 0.35],
              scaleY: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2.4,
              delay: index * 0.08,
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        ))}
      </div>
    </div>
  )
}
