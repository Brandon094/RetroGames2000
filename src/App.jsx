import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Gamepad2, Sword, Target, Map, Trophy, ChevronRight, HardDrive, Info, MessageSquare, AlertTriangle, Terminal as TerminalIcon, LogIn } from 'lucide-react'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth'
import { db, auth, googleProvider } from './firebase/config'
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
  const [user, setUser] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])

  const genres = [
    { id: 'todos', label: 'TODOS', icon: <Gamepad2 size={14} /> },
    { id: 'estrategia', label: 'ESTRATEGIA', icon: <Sword size={14} /> },
    { id: 'shooter', label: 'SHOOTER', icon: <Target size={14} /> },
    { id: 'aventura', label: 'AVENTURA', icon: <Map size={14} /> },
    { id: 'simulacion', label: 'CARRERAS', icon: <Trophy size={14} /> },
  ]

  useEffect(() => {
    try {
        const qGames = query(collection(db, "games"), orderBy("year", "desc"));
        const unsubGames = onSnapshot(qGames, (snap) => {
            setGames(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (err) => { console.error("Firestore Games Error:", err); setLoading(false); });

        const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));

        const qLeader = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(5));
        const unsubLeader = onSnapshot(qLeader, (snap) => {
            setLeaderboard(snap.docs.map(doc => doc.data()));
        }, (err) => console.warn("Leaderboard not ready yet"));

        return () => { unsubGames(); unsubAuth(); unsubLeader(); };
    } catch(e) {
        console.error("Init Error:", e);
        setLoading(false);
    }
  }, [])

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); notifyTask("ACCESO_AUTORIZADO"); }
    catch (e) { notifyTask("FALLO_DE_AUTENTICACION"); }
  }

  const notifyTask = (msg) => {
    setTerminalMsg(msg);
    setTimeout(() => setTerminalMsg(''), 3000);
  }

  const filteredGames = games.filter(g =>
    (activeGenre === 'todos' || g.genre === activeGenre) &&
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen text-white font-chakra overflow-x-hidden bg-transparent">
      <AnimatePresence>{!isReady && <Intro onComplete={() => { setIsReady(true); notifyTask("SISTEMA_OPERATIVO_ONLINE"); }} />}</AnimatePresence>
      <TronWorld />
      {isReady && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {showGame && <TronShooter user={user} onExit={() => setShowGame(false)} />}
          <AnimatePresence>
            {terminalMsg && (
              <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} className="fixed top-10 right-10 z-[200] bg-black border-l-4 border-cyan-500 p-4 shadow-[0_0_20px_rgba(0,255,255,0.2)] font-mono text-[10px] text-cyan-400">
                <div className="flex items-center gap-3"><TerminalIcon size={14} /><span>{">"} {terminalMsg}</span></div>
              </motion.div>
            )}
          </AnimatePresence>
          <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 bg-transparent">
            <div className="flex justify-end mb-8">
                {user ? (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                        <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full border border-cyan-500" />
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{user.displayName}</span>
                        <button onClick={() => signOut(auth)} className="text-[8px] text-white/20 hover:text-red-500 uppercase font-black">Logout</button>
                    </div>
                ) : (
                    <button onClick={handleLogin} className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-lg"><LogIn size={14} />Google Login</button>
                )}
            </div>
            <header className="text-center mb-20 relative">
              <div className="flex justify-center mb-4">
                 <button onClick={() => setShowGame(true)} className="group flex items-center gap-2 bg-cyan-500/5 border border-cyan-500/20 px-4 py-1.5 rounded-full hover:bg-cyan-500 hover:text-black transition-all">
                   <Target size={12} className="group-hover:animate-spin" /><span className="text-[9px] font-black tracking-[0.2em] uppercase">Simulador_Defensa</span>
                 </button>
              </div>
              <h1 className="text-6xl md:text-8xl font-orbitron font-black tracking-tighter mb-2 text-white drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]"><span className="text-cyan-400 italic">RETRO</span>PIXEL</h1>
            </header>
            {leaderboard.length > 0 && (
                <div className="mb-20 max-w-md mx-auto bg-black/40 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md">
                    <h3 className="text-center text-[10px] font-black text-cyan-500 mb-4 tracking-[0.4em] uppercase underline">Top_Rank_Scores</h3>
                    <div className="space-y-3">
                        {leaderboard.map((p, i) => (
                            <div key={i} className="flex justify-between items-center text-[11px] font-mono border-b border-white/5 pb-2">
                                <span className={i === 0 ? "text-yellow-400" : "text-white/60"}>{i+1}. {p.userName.toUpperCase()}</span>
                                <span className="text-cyan-400 font-bold">{p.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="mb-20 space-y-8">
              <div className="max-w-xl mx-auto relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors"><Search size={20} /></div>
                <input type="text" placeholder="BUSCAR EN EL ARCHIVO..." className="w-full bg-black/60 border-2 border-white/5 p-5 pl-14 rounded-xl outline-none focus:border-cyan-500/50 transition-all text-sm tracking-widest font-mono" onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {genres.map((g) => (
                  <button key={g.id} onClick={() => setActiveGenre(g.id)} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${activeGenre === g.id ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(0,255,255,0.4)] scale-105' : 'bg-black/40 border-white/5 text-white/40 hover:border-white/20'}`}>{g.icon}{g.label}</button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="text-center py-20 animate-pulse text-cyan-500 font-mono uppercase tracking-[0.5em]">Sync_Database...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <AnimatePresence mode='popLayout'>
                  {filteredGames.map((game, index) => (
                    <GameCard key={game.id} game={game} index={index} onDownload={() => notifyTask(`DESC_INIT_${game.name.toUpperCase()}`)} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </motion.div>
      )}
    </div>
  )
}

export default App
