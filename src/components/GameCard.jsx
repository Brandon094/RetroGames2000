import { motion } from 'framer-motion'
import { Download, Calendar, Cpu, Tag } from 'lucide-react'

export default function GameCard({ game, index, onDownload }) {
  const variants = {
    hidden: { opacity: 0, x: index % 2 === 0 ? -30 : 30, y: 20 },
    visible: {
      opacity: 1, x: 0, y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15, delay: (index % 3) * 0.1 }
    }
  }

  const handleDownloadClick = (e) => {
    onDownload(); // Dispara el mensaje en la terminal central
  }

  return (
    <motion.div
      layout
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group relative bg-black/60 border border-white/5 hover:border-cyan-500/40 rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-sm"
    >
      <div className="relative aspect-video overflow-hidden border-b border-white/5">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

        <div className="absolute bottom-3 left-3 flex gap-2">
            <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[8px] font-black uppercase text-cyan-400">
                <Cpu size={10} /> PC_ROM
            </div>
            <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[8px] font-black uppercase text-pink-500">
                <Calendar size={10} /> {game.year}
            </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
            <Tag size={10} className="text-cyan-500/50" />
            <span className="text-[9px] text-cyan-500/50 font-black uppercase tracking-[0.3em]">{game.genre}</span>
            <div className="h-[1px] flex-grow bg-white/5"></div>
        </div>

        <h3 className="text-xl font-orbitron font-black text-white group-hover:text-cyan-400 transition-colors mb-6 uppercase italic tracking-tight leading-tight">
          {game.name}
        </h3>

        <motion.a
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          href={game.mediafireUrl}
          target="_blank"
          onClick={handleDownloadClick}
          className="flex items-center justify-center gap-3 w-full bg-cyan-500 text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300"
        >
          <Download size={14} strokeWidth={3} />
          DOWN_LOAD_DATA
        </motion.a>
      </div>
    </motion.div>
  )
}
