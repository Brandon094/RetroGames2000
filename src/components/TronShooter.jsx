import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { Heart, ShieldAlert, Target, Volume2, VolumeX, Play, Trophy, X } from 'lucide-react'
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

// --- MOTOR DE SONIDO ---
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator(); const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination); const now = ctx.currentTime
    if (type === 'shoot') { osc.type = 'square'; osc.frequency.setValueAtTime(600, now); gain.gain.setValueAtTime(0.05, now); osc.start(); osc.stop(now + 0.1) }
    else if (type === 'hit') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); gain.gain.setValueAtTime(0.1, now); osc.start(); osc.stop(now + 0.05) }
    else if (type === 'damage') { osc.type = 'triangle'; osc.frequency.setValueAtTime(100, now); gain.gain.setValueAtTime(0.3, now); osc.start(); osc.stop(now + 0.2) }
  } catch(e) {}
}

function Bullet({ data }) {
  return (
    <group position={[data.x, 0.5, data.z]}>
      <mesh><boxGeometry args={[0.08, 0.08, 1.2]} /><meshBasicMaterial color="#00ffff" /></mesh>
      <pointLight color="#00ffff" intensity={0.5} distance={3} />
    </group>
  )
}

function Enemy({ data }) {
  const ref = useRef()
  useFrame((state) => { if (ref.current) { ref.current.rotation.x += 0.02; ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2 + data.id) * 0.1 } })
  return ( <mesh ref={ref} position={[data.x, 0.5, data.z]}><octahedronGeometry args={[0.5]} /><meshBasicMaterial color="#ff0055" wireframe /> </mesh> )
}

function GameEngine({ onGameOver, onScoreUpdate, onLivesUpdate, onShake, muted }) {
  const [bullets, setBullets] = useState([]); const [enemies, setEnemies] = useState([])
  const playerRef = useRef(); const lastShootTime = useRef(0); const lastSpawnTime = useRef(0)
  const score = useRef(0); const lives = useRef(5); const PLAYER_Z = 6
  const { mouse } = useThree() // Acceso directo al mouse de R3F

  useEffect(() => {
    const triggerShoot = () => {
      const now = Date.now(); if (now - lastShootTime.current < 150) return; lastShootTime.current = now
      setBullets(prev => [...prev, { id: Math.random(), x: playerRef.current.position.x, z: PLAYER_Z - 1.5 }])
      if (!muted) playSound('shoot'); playerRef.current.position.z += 0.4
    }
    const handleInput = (e) => { if (e.code === 'Space' || e.type === 'mousedown' || e.type === 'touchstart') triggerShoot() }
    window.addEventListener('mousedown', handleInput); window.addEventListener('keydown', handleInput); window.addEventListener('touchstart', handleInput)
    return () => { window.removeEventListener('mousedown', handleInput); window.removeEventListener('keydown', handleInput); window.removeEventListener('touchstart', handleInput) }
  }, [muted])

  useFrame((state) => {
    if (lives.current <= 0) return

    // MOVIMIENTO REPARADO: Usamos state.pointer que es más fiable en nuevas versiones
    const targetX = (state.pointer.x * 10)
    if (playerRef.current) {
        playerRef.current.position.x = THREE.MathUtils.lerp(playerRef.current.position.x, targetX, 0.2)
        playerRef.current.rotation.z = THREE.MathUtils.lerp(playerRef.current.rotation.z, -state.pointer.x * 0.8, 0.1)
        playerRef.current.position.z = THREE.MathUtils.lerp(playerRef.current.position.z, PLAYER_Z, 0.1)
    }

    if (state.clock.elapsedTime - lastSpawnTime.current > 1.2) {
      lastSpawnTime.current = state.clock.elapsedTime
      setEnemies(prev => [...prev, { id: Math.random(), x: (Math.random() - 0.5) * 20, z: -50 }])
    }

    setBullets(prev => prev.map(b => ({ ...b, z: b.z - 1.5 })).filter(b => b.z > -65))

    setEnemies(prev => {
      const active = []; let livesToLose = 0
      prev.forEach(e => {
        const nextZ = e.z + 0.4; const dist = Math.sqrt(Math.pow(playerRef.current.position.x - e.x, 2) + Math.pow(PLAYER_Z - nextZ, 2))
        if (dist < 1.2 || nextZ > 10) { livesToLose += (dist < 1.2 ? 1.5 : 1.0); onShake(); if(!muted) playSound('damage'); }
        else active.push({ ...e, z: nextZ })
      })
      if (livesToLose > 0) {
        lives.current -= livesToLose; onLivesUpdate(Math.max(0, lives.current))
        if (lives.current <= 0) onGameOver(score.current)
      }
      return active
    })

    setBullets(curBullets => {
      const nextBullets = []
      curBullets.forEach(b => {
        let hit = false
        enemies.forEach(e => {
          const dist = Math.sqrt(Math.pow(b.x - e.x, 2) + Math.pow(b.z - e.z, 2))
          if (dist < 1.5 && !hit) { hit = true; setEnemies(prev => prev.filter(en => en.id !== e.id)); score.current += 100; onScoreUpdate(score.current); if(!muted) playSound('hit') }
        })
        if (!hit) nextBullets.push(b)
      })
      return nextBullets
    })
  })

  return ( <> <mesh ref={playerRef} position={[0, 0.5, PLAYER_Z]}> <coneGeometry args={[0.5, 1.5, 3]} /><meshBasicMaterial color="#00ffff" wireframe /> </mesh> {bullets.map(b => <Bullet key={b.id} data={b} />)} {enemies.map(e => <Enemy key={e.id} data={e} />)} </> )
}

export default function TronShooter({ onExit, user }) {
  const [gameState, setGameState] = useState('menu')
  const [score, setScore] = useState(0); const [lives, setLives] = useState(5)
  const [gameKey, setGameKey] = useState(0); const [shake, setShake] = useState(false); const [muted, setMuted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); const [saving, setSaving] = useState(false)
  const [localLeaderboard, setLocalLeaderboard] = useState([])

  useEffect(() => {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(5));
    return onSnapshot(q, (snap) => setLocalLeaderboard(snap.docs.map(d => d.data())));
  }, [])

  const handleGameOver = async (finalScore) => {
    setGameState('gameover');
    if (user && finalScore > 0) {
        setSaving(true)
        try { await addDoc(collection(db, "leaderboard"), { userId: user.uid, userName: user.displayName, score: finalScore, timestamp: serverTimestamp() }); } catch (e) {}
        setSaving(false)
    }
  }

  return (
    <div onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })} className={`fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 touch-none ${gameState === 'playing' ? 'cursor-none' : 'cursor-default'}`}>
      <motion.div animate={shake ? { x: [-15, 15, -10, 10, 0] } : {}} className="relative w-full lg:w-[85%] h-[85vh] bg-black border-2 border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,255,255,0.1)]">

        {gameState === 'playing' && ( <div className="fixed z-50 pointer-events-none w-12 h-12 border-2 border-cyan-500 rounded-full flex items-center justify-center" style={{ left: mousePos.x, top: mousePos.y, transform: 'translate(-50%, -50%)' }}> <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(0,255,255,1)]" /> </div> )}

        <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 pointer-events-none">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-8">
                    <div className="bg-black/50 p-3 rounded-xl border border-white/5"><h2 className="text-2xl font-orbitron font-black text-white">{score}</h2></div>
                    <div className="bg-black/50 p-3 rounded-xl border border-white/5"><div className="flex items-center gap-2"><Heart size={18} className="text-pink-500" fill="currentColor" /><h2 className="text-2xl font-orbitron font-black text-white">{lives.toFixed(1)}</h2></div></div>
                </div>
                <div className="flex gap-3 pointer-events-auto">
                    <button onClick={() => setMuted(!muted)} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
                    <button onClick={onExit} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all"><X size={18} /></button>
                </div>
            </div>

            <AnimatePresence>
                {gameState === 'menu' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center p-8 pointer-events-auto">
                        <h2 className="text-5xl font-orbitron font-black text-cyan-400 mb-2 italic tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">PROTOCOL_DEFENSE</h2>
                        <p className="text-cyan-900 font-mono text-[10px] tracking-[0.5em] mb-12 uppercase">Accessing Core Security</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                                <div className="flex items-center gap-2 mb-6 text-cyan-500 font-black uppercase text-[10px] tracking-widest"><Trophy size={14} /> Leaderboard</div>
                                <div className="space-y-4">
                                    {localLeaderboard.map((p, i) => (
                                        <div key={i} className="flex justify-between font-mono text-xs border-b border-white/5 pb-2">
                                            <span className="text-white/40">0{i+1}. {p.userName.toUpperCase()}</span>
                                            <span className="text-cyan-400 font-bold">{p.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center gap-4">
                                <button onClick={() => { setGameState('playing'); setScore(0); setLives(5); setGameKey(k=>k+1); }} className="bg-cyan-500 text-black py-6 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,255,0.3)]">INITIALIZE</button>
                                <button onClick={onExit} className="text-white/20 hover:text-white uppercase text-[10px] font-black tracking-widest mt-4">Abort</button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {gameState === 'gameover' && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-black/95 z-20 flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
                        <ShieldAlert size={60} className="text-red-600 mb-6 animate-pulse" />
                        <h3 className="text-5xl font-orbitron font-black text-red-600 mb-2 italic">CORE_CRASH</h3>
                        <p className="text-white font-mono text-xs mb-10 uppercase tracking-[0.3em]">{user ? (saving ? "Saving..." : "Data Synced") : "Login to Rank"} // Final: {score}</p>
                        <div className="flex gap-4">
                            <button onClick={() => setGameState('menu')} className="bg-white text-black px-12 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-cyan-500 transition-all">Menu</button>
                            <button onClick={() => { setGameState('playing'); setScore(0); setLives(5); setGameKey(k => k+1); }} className="bg-red-600 text-white px-12 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all shadow-lg shadow-red-600/30">Restart</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <Canvas camera={{ position: [0, 4, 12], fov: 45 }} style={{ pointerEvents: 'none' }}>
          <color attach="background" args={['#000']} />
          <fog attach="fog" args={['#000', 5, 35]} />
          <gridHelper args={[100, 40, 0x00ffff, 0x002222]} />
          <ambientLight intensity={0.5} />
          {gameState === 'playing' && <GameEngine key={gameKey} onGameOver={handleGameOver} onScoreUpdate={setScore} onLivesUpdate={setLives} onShake={() => { setShake(true); setTimeout(()=>setShake(false),200); }} muted={muted} />}
        </Canvas>
      </motion.div>
    </div>
  )
}
