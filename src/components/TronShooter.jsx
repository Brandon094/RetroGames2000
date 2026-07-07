import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { Heart, ShieldAlert, Target, Volume2, VolumeX } from 'lucide-react'

// --- MOTOR DE SONIDO ---
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator(); const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    const now = ctx.currentTime
    if (type === 'shoot') {
      osc.type = 'square'; osc.frequency.setValueAtTime(600, now); gain.gain.setValueAtTime(0.05, now); osc.start(); osc.stop(now + 0.1)
    } else if (type === 'hit') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); gain.gain.setValueAtTime(0.1, now); osc.start(); osc.stop(now + 0.05)
    } else if (type === 'damage') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(100, now); gain.gain.setValueAtTime(0.3, now); osc.start(); osc.stop(now + 0.2)
    }
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
  useFrame((state) => {
    if (ref.current) {
        ref.current.rotation.x += 0.02; ref.current.rotation.z += 0.01
        ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2 + data.id) * 0.1
    }
  })
  return (
    <mesh ref={ref} position={[data.x, 0.5, data.z]}>
      <octahedronGeometry args={[0.5]} />
      <meshBasicMaterial color="#ff0055" wireframe />
    </mesh>
  )
}

function GameEngine({ onGameOver, onScoreUpdate, onLivesUpdate, onShake, muted }) {
  const [bullets, setBullets] = useState([])
  const [enemies, setEnemies] = useState([])
  const playerRef = useRef();
  const lastShootTime = useRef(0);
  const lastSpawnTime = useRef(0);
  const score = useRef(0);
  const lives = useRef(5);
  const PLAYER_Z = 6

  // --- LÓGICA DE DISPARO ROBUSTA ---
  useEffect(() => {
    const triggerShoot = () => {
      const now = Date.now()
      if (now - lastShootTime.current < 150) return // Cooldown
      lastShootTime.current = now

      setBullets(prev => [...prev, {
        id: Math.random(),
        x: playerRef.current.position.x,
        z: playerRef.current.position.z - 1.5
      }])

      if (!muted) playSound('shoot')
      playerRef.current.position.z += 0.4 // Recoil visual
    }

    const handleInput = (e) => {
      if (e.code === 'Space' || e.type === 'mousedown' || e.type === 'touchstart') {
        triggerShoot()
      }
    }

    window.addEventListener('mousedown', handleInput)
    window.addEventListener('keydown', handleInput)
    window.addEventListener('touchstart', handleInput)
    return () => {
      window.removeEventListener('mousedown', handleInput)
      window.removeEventListener('keydown', handleInput)
      window.removeEventListener('touchstart', handleInput)
    }
  }, [muted])

  useFrame((state) => {
    if (lives.current <= 0) return

    // Movimiento Suave
    const targetX = (state.mouse.x * 8)
    if (playerRef.current) {
        playerRef.current.position.x = THREE.MathUtils.lerp(playerRef.current.position.x, targetX, 0.15)
        playerRef.current.rotation.z = THREE.MathUtils.lerp(playerRef.current.rotation.z, -state.mouse.x * 0.5, 0.1)
        playerRef.current.position.z = THREE.MathUtils.lerp(playerRef.current.position.z, PLAYER_Z, 0.1)
    }

    // Spawner
    if (state.clock.elapsedTime - lastSpawnTime.current > 1.2) {
      lastSpawnTime.current = state.clock.elapsedTime
      setEnemies(prev => [...prev, { id: Math.random(), x: (Math.random() - 0.5) * 16, z: -50 }])
    }

    // Actualizar Balas
    setBullets(prev => prev.map(b => ({ ...b, z: b.z - 1.5 })).filter(b => b.z > -65))

    // Actualizar Enemigos y Daño
    setEnemies(prev => {
      const active = []
      prev.forEach(e => {
        const nextZ = e.z + 0.35
        const dist = Math.sqrt(Math.pow(playerRef.current.position.x - e.x, 2) + Math.pow(playerRef.current.position.z - nextZ, 2))

        if (dist < 1.0) {
            lives.current -= 1.5; onShake(); if(!muted) playSound('damage');
        } else if (nextZ > 10) {
            lives.current -= 1; onShake(); if(!muted) playSound('damage');
        } else {
            active.push({ ...e, z: nextZ })
        }
      })
      if (lives.current <= 0) onGameOver()
      onLivesUpdate(Math.max(0, lives.current))
      return active
    })

    // Colisiones
    setBullets(curBullets => {
      const nextBullets = []
      curBullets.forEach(b => {
        let hit = false
        enemies.forEach(e => {
          const dist = Math.sqrt(Math.pow(b.x - e.x, 2) + Math.pow(b.z - e.z, 2))
          if (dist < 1.2 && !hit) {
            hit = true
            setEnemies(prev => prev.filter(en => en.id !== e.id))
            score.current += 100
            onScoreUpdate(score.current)
            if(!muted) playSound('hit')
          }
        })
        if (!hit) nextBullets.push(b)
      })
      return nextBullets
    })
  })

  return (
    <>
      <mesh ref={playerRef} position={[0, 0.5, PLAYER_Z]}>
        <coneGeometry args={[0.4, 1.2, 3]} /><meshBasicMaterial color="#00ffff" wireframe />
      </mesh>
      {bullets.map(b => <Bullet key={b.id} data={b} />)}
      {enemies.map(e => <Enemy key={e.id} data={e} />)}
    </>
  )
}

export default function TronShooter({ onExit }) {
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(5)
  const [gameKey, setGameKey] = useState(0)
  const [shake, setShake] = useState(false)
  const [muted, setMuted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 200); }

  return (
    <div
        onMouseMove={handleMouseMove}
        className={`fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 touch-none ${!gameOver ? 'cursor-none' : 'cursor-default'}`}
    >
      <motion.div animate={shake ? { x: [-15, 15, -10, 10, 0] } : {}} className="relative w-full lg:w-[85%] h-[85vh] bg-black border-2 border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,255,255,0.1)]">

        {!gameOver && (
            <div
                className="fixed z-50 pointer-events-none w-10 h-10 border-2 border-cyan-500/50 rounded-full flex items-center justify-center"
                style={{ left: mousePos.x, top: mousePos.y, transform: 'translate(-50%, -50%)' }}
            >
                <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,255,255,1)]" />
                <div className="absolute w-full h-[1px] bg-cyan-500/20" />
                <div className="absolute h-full w-[1px] bg-cyan-500/20" />
            </div>
        )}

        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-8">
                    <div className="bg-black/50 p-3 rounded-xl border border-white/5 backdrop-blur-md">
                        <p className="text-cyan-500/50 font-mono text-[7px] uppercase tracking-widest">Protocol_Clean</p>
                        <h2 className="text-2xl font-orbitron font-black text-white">{score}</h2>
                    </div>
                    <div className="bg-black/50 p-3 rounded-xl border border-white/5 backdrop-blur-md">
                        <p className="text-pink-500/50 font-mono text-[7px] uppercase tracking-widest">Integrity</p>
                        <div className="flex items-center gap-2">
                           <Heart size={18} className={lives < 2 ? "text-red-500 animate-pulse" : "text-pink-500"} fill="currentColor" />
                           <h2 className={`text-2xl font-orbitron font-black ${lives < 2 ? "text-red-500" : "text-white"}`}>{lives.toFixed(1)}</h2>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 pointer-events-auto">
                    <button onClick={() => setMuted(!muted)} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <button onClick={onExit} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                        <Target size={18} />
                    </button>
                </div>
            </div>

            {gameOver && (
                <div className="pointer-events-auto absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-50 animate-in fade-in duration-500">
                    <h3 className="text-5xl font-orbitron font-black text-red-600 mb-4 uppercase italic">Infection_Critical</h3>
                    <div className="flex gap-4">
                        <button onClick={() => { setGameOver(false); setScore(0); setLives(5); setGameKey(k => k+1); }} className="bg-red-600 text-white px-12 py-4 rounded-full font-black uppercase text-xs hover:bg-white hover:text-black transition-all">Reboot</button>
                        <button onClick={onExit} className="border-2 border-white/10 text-white/40 px-12 py-4 rounded-full font-black uppercase text-xs hover:border-white hover:text-white transition-all">Exit</button>
                    </div>
                </div>
            )}
        </div>

        <Canvas camera={{ position: [0, 4, 12], fov: 45 }}>
          <color attach="background" args={['#000']} />
          <fog attach="fog" args={['#000', 5, 35]} />
          <gridHelper args={[100, 50, 0x00ffff, 0x002222]} />
          <ambientLight intensity={0.5} />
          {!gameOver && <GameEngine key={gameKey} onGameOver={() => setGameOver(true)} onScoreUpdate={setScore} onLivesUpdate={setLives} onShake={triggerShake} muted={muted} />}
        </Canvas>
      </motion.div>
    </div>
  )
}
