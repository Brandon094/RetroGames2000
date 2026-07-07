import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const lines = [
  "INITIALIZING_MEMORY_CORE...",
  "CONNECTING_TO_DATABASE_V2.0...",
  "LOADING_TRON_VISUAL_ASSETS...",
  "SCANNING_RETRO_PROTOCOLS...",
  "SYSTEM_READY."
]

export default function Intro({ onComplete }) {
  const [currentLine, setCurrentLine] = useState(0)

  useEffect(() => {
    if (currentLine < lines.length) {
      const timeout = setTimeout(() => {
        setCurrentLine(prev => prev + 1)
      }, 400)
      return () => clearTimeout(timeout)
    } else {
      setTimeout(onComplete, 1000)
    }
  }, [currentLine, onComplete])

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center font-mono p-4"
    >
      {/* Efecto de Escaneo de líneas (CRT) */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-[1001]" />

      <div className="w-full max-w-md">
        {/* Logo Glitchy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0, 1] }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-orbitron font-black text-cyan-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] italic text-center">
            RETROPIXEL
          </h1>
        </motion.div>

        {/* Líneas de Terminal */}
        <div className="space-y-2">
          {lines.slice(0, currentLine + 1).map((line, i) => (
            <motion.p
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`text-[10px] tracking-[0.2em] ${i === lines.length - 1 ? "text-cyan-400 font-bold" : "text-cyan-900"}`}
            >
              <span className="mr-2">{">"}</span>
              {line}
            </motion.p>
          ))}
        </div>

        {/* Barra de Progreso */}
        <div className="mt-8 h-[2px] w-full bg-cyan-950 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,1)]"
          />
        </div>

        <div className="mt-2 flex justify-between text-[8px] text-cyan-900 font-bold uppercase tracking-widest">
            <span>Auth_Check</span>
            <span>Kernel_v2.0.4</span>
        </div>
      </div>
    </motion.div>
  )
}
