import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Player() {
  const mesh = useRef()

  useFrame((state) => {
    if (!mesh.current) return
    const targetX = (state.mouse.x * 6)
    mesh.current.position.x += (targetX - mesh.current.position.x) * 0.1
    mesh.current.rotation.z = -mesh.current.position.x * 0.2
    mesh.current.rotation.y = Math.PI
  })

  return (
    <mesh ref={mesh} position={[0, 0.2, 0]}>
      <coneGeometry args={[0.3, 0.8, 4]} />
      <meshBasicMaterial color="#00ffff" wireframe />
    </mesh>
  )
}

function Obstacle({ position, onHit }) {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.z += 0.25

    const playerX = state.mouse.x * 6
    const distZ = Math.abs(ref.current.position.z - 0)
    const distX = Math.abs(ref.current.position.x - playerX)

    if (distZ < 0.4 && distX < 0.6) {
      onHit()
    }

    ref.current.rotation.x += 0.02
    ref.current.rotation.y += 0.02
  })

  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.5]} />
      <meshBasicMaterial color="#ff0055" wireframe />
    </mesh>
  )
}

function GameManager({ onGameOver, onScoreUpdate }) {
  const [obstacles, setObstacles] = useState([])
  const active = useRef(true)
  const lastSpawn = useRef(0)

  useFrame((state) => {
    if (!active.current) return

    onScoreUpdate(Math.floor(state.clock.elapsedTime * 10))

    if (state.clock.elapsedTime - lastSpawn.current > 0.4) {
      lastSpawn.current = state.clock.elapsedTime
      setObstacles(prev => [
        ...prev.filter(o => o.z < 5),
        { id: Math.random(), x: (Math.random() - 0.5) * 12, z: -25 }
      ])
    }
  })

  const handleHit = () => {
    if (active.current) {
      active.current = false
      onGameOver()
    }
  }

  return (
    <>
      {obstacles.map(o => (
        <Obstacle key={o.id} position={[o.x, 0.5, o.z]} onHit={handleHit} />
      ))}
      <Player />
    </>
  )
}

export default function TronRace({ onExit }) {
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [gameKey, setGameKey] = useState(0) // Llave para reiniciar

  const handleRestart = () => {
    setGameOver(false);
    setScore(0);
    setGameKey(prev => prev + 1); // Forzar a React a recrear el GameManager
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-12 z-[110]">
        <div className="text-center">
          <p className="text-cyan-500 font-mono text-[10px] tracking-[0.5em] uppercase mb-2">Simulador de Emergencia</p>
          <h2 className="text-6xl font-orbitron font-black text-white">{score}</h2>
        </div>

        {!gameOver && (
          <p className="text-cyan-400 font-mono animate-pulse uppercase tracking-[0.2em] text-[10px]">
             Usa el mouse para esquivar los sectores corruptos
          </p>
        )}

        {gameOver && (
          <div className="pointer-events-auto bg-black border-2 border-red-500 p-8 rounded-xl text-center backdrop-blur-xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-orbitron font-black text-red-500 mb-2 italic tracking-tighter">SISTEMA_COLAPSADO</h3>
            <p className="text-white font-mono text-xs mb-6 uppercase tracking-[0.2em]">Puntos de infiltración: {score}</p>
            <div className="flex flex-col gap-2">
               <button
                onClick={handleRestart}
                className="bg-red-500 text-white px-8 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Volver a Intentar
              </button>
              <button
                onClick={onExit}
                className="border border-white/10 text-white/40 px-8 py-3 font-black uppercase text-[10px] tracking-widest hover:border-white hover:text-white transition-all"
              >
                Cerrar Simulador
              </button>
            </div>
          </div>
        )}
      </div>

      <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
        <color attach="background" args={['#000']} />
        <fog attach="fog" args={['#000', 2, 18]} />
        <gridHelper args={[100, 50, 0x00ffff, 0x002222]} rotation={[0, 0, 0]} />
        <ambientLight intensity={0.5} />
        {!gameOver && (
            <GameManager
                key={gameKey} // Aquí ocurre la magia del reinicio
                onGameOver={() => setGameOver(true)}
                onScoreUpdate={setScore}
            />
        )}
      </Canvas>
    </div>
  )
}
