import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Gamepad2, Sword, Target, Map, Trophy, ChevronRight, HardDrive, Info, MessageSquare, AlertTriangle, Terminal as TerminalIcon } from 'lucide-react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from './firebase/config'
import TronWorld from './components/TronWorld'
import GameCard from './components/GameCard'
import TronShooter from './components/TronShooter'
import Intro from './components/Intro'

function App() {
  const [games, setGames] = useState([])
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [showGame, setShowGame] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [terminalMsg, setTerminalMsg] = useState('')

  const genres = [
    { id: 'todos', label: 'TODOS', icon: <Gamepad2 size={14} /> },
    { id: 'estrategia', label: 'ESTRATEGIA', icon: <Sword size={14} /> },
    { id: 'shooter', label: 'SHOOTER', icon: <Target size={14} /> },
    { id: 'aventura', label: 'AVENTURA', icon: <Map size={14} /> },
    { id: 'simulacion', label: 'CARRERAS', icon: <Trophy size={14} /> },
  ]

  useEffect(() => {
    const q = query(collection(db, "games"), orderBy("year", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setGames(docs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [])

  const filteredGames = games.filter(g =>
    (activeGenre === 'todos' || g.genre === activeGenre) &&
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  // Función para mostrar mensajes de terminal cuando se completan tareas
  const notifyTask = (msg) => {
    setTerminalMsg(msg)
    setTimeout(() => setTerminalMsg(''), 3000)
  }

  return (
    <div className="min-h-screen text-white font-chakra overflow-x-hidden bg-transparent">

      <AnimatePresence>
        {!isReady && <Intro onComplete={() => { setIsReady(true); notifyTask("SISTEMA_OPERATIVO_ONLINE"); }} />}
      </AnimatePresence>

      <TronWorld />

      {isReady && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>

          {showGame && <TronShooter onExit={() => setShowGame(false)} />}

          {/* Notificación de Terminal Flotante para Tareas Reales */}
          <AnimatePresence>
            {terminalMsg && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="fixed top-10 right-10 z-[200] bg-black border-l-4 border-cyan-500 p-4 shadow-[0_0_20px_rgba(0,255,255,0.2)] font-mono text-[10px] text-cyan-400"
              >
                <div className="flex items-center gap-3">
                  <TerminalIcon size={14} />
                  <span>{">"} {terminalMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 bg-transparent">
            <header className="text-center mb-20 relative">
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <div className="flex justify-center mb-4">
                   <button
                    onClick={() => { setShowGame(true); notifyTask("ACCEDIENDO_AL_SIMULADOR..."); }}
                    className="group flex items-center gap-2 bg-cyan-500/5 border border-cyan-500/20 px-4 py-1.5 rounded-full hover:bg-cyan-500 hover:text-black transition-all"
                   >
                     <Target size={12} className="group-hover:animate-spin" />
                     <span className="text-[9px] font-black tracking-[0.2em] uppercase">Ejectuar_Simulador</span>
                   </button>
                </div>
                <h1 className="text-6xl md:text-8xl font-orbitron font-black tracking-tighter mb-2 text-white drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]">
                    <span className="text-cyan-400 italic">RETRO</span>PIXEL
                </h1>
                <p className="text-cyan-400/60 uppercase tracking-[0.6em] text-[9px] font-black">Digital_Storage_v2.0 // CLOUD_SYNC</p>
              </motion.div>
            </header>

            <div className="mb-20 space-y-8">
              <div className="max-w-xl mx-auto relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="BUSCAR EN LA BASE DE DATOS..."
                  className="w-full bg-black/60 border-2 border-white/5 p-5 pl-14 rounded-xl outline-none focus:border-cyan-500/50 transition-all text-sm tracking-widest font-mono"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => { setActiveGenre(genre.id); notifyTask(`FILTRANDO_POR_${genre.id.toUpperCase()}`); }}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                      activeGenre === genre.id
                      ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(0,255,255,0.4)] scale-105'
                      : 'bg-black/40 border-white/5 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {genre.icon}
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 animate-pulse text-cyan-500 font-mono uppercase tracking-[0.5em]">
                CONECTANDO CON EL SATÉLITE...
              </div>
            ) : (
              <>
                {filteredGames.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode='popLayout'>
                      {filteredGames.map((game, index) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          index={index}
                          onDownload={() => notifyTask(`DESCARGANDO_${game.name.replace(/\s/g, '_').toUpperCase()}...`)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-cyan-500/5 rounded-3xl border border-dashed border-cyan-500/20"
                  >
                    <p className="text-xl text-cyan-400 font-mono italic mb-8 uppercase tracking-widest">SISTEMA_VACÍO: SIN_DATOS_EN_ESTA_FRECUENCIA</p>
                    <button
                      onClick={() => { setShowGame(true); notifyTask("PROTOCOLO_DEFENSA_INICIADO"); }}
                      className="bg-cyan-500 text-black font-black px-10 py-4 rounded-xl hover:bg-white transition-all uppercase tracking-tighter shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                    >
                      EJECUTAR PROTOCOLO DE DEFENSA
                    </button>
                  </motion.div>
                )}
              </>
            )}

            <section className="mt-40 py-20 border-t border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <a href="#" className="group flex items-center gap-4 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-cyan-500/30">
                  <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><Info size={24} /></div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-1">Guía_Técnica</h4>
                    <p className="text-[10px] text-white/40 uppercase">Instalación y parches</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-white/20 group-hover:text-cyan-400" />
                </a>
                <a href="#" onClick={() => notifyTask("ACCEDIENDO_AL_FORMULARIO...")} className="group flex items-center gap-4 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-cyan-500/30">
                  <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><MessageSquare size={24} /></div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-1">Solicitar_Data</h4>
                    <p className="text-[10px] text-white/40 uppercase">Pide tu juego clásico</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-white/20 group-hover:text-purple-400" />
                </a>
                <a href="#" onClick={() => notifyTask("REGISTRANDO_REPORTE_DE_FALLO...")} className="group flex items-center gap-4 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-cyan-500/30">
                  <div className="p-3 bg-red-500/10 rounded-xl text-red-400"><AlertTriangle size={24} /></div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-1">Reportar_Link</h4>
                    <p className="text-[10px] text-white/40 uppercase">Servidor caído o error</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-white/20 group-hover:text-red-400" />
                </a>
              </div>
            </section>
          </main>
        </motion.div>
      )}

      <footer className="py-10 text-center flex flex-col items-center gap-4 relative z-10">
         <div className="h-[1px] w-20 bg-white/10"></div>
         <span className="text-white/20 text-[9px] font-bold tracking-[0.6em] uppercase flex items-center gap-2">
            <HardDrive size={12} /> RetroPixel // Archive Protocol 2024
         </span>
      </footer>
    </div>
  )
}

export default App
