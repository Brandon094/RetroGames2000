import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

function MovingGrid() {
  const gridRef = useRef()

  useFrame((state) => {
    if (gridRef.current) {
      // Velocidad reducida para un ambiente relajado (0.03 en lugar de 0.15)
      gridRef.current.position.z += 0.03
      if (gridRef.current.position.z > 10) {
        gridRef.current.position.z = 0
      }

      // Movimiento de flotación suave basado en el tiempo
      gridRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={gridRef}>
      <gridHelper args={[100, 50, 0x00ffff, 0x002222]} rotation={[0, 0, 0]} position={[0, 0, 0]} />
      <gridHelper args={[100, 50, 0x00ffff, 0x002222]} rotation={[0, 0, 0]} position={[0, 0, -50]} />
      <gridHelper args={[100, 50, 0x00ffff, 0x002222]} rotation={[0, 0, 0]} position={[0, 0, -100]} />
    </group>
  )
}

export default function TronWorld() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, backgroundColor: '#000' }}>
      <Canvas camera={{ position: [0, 1.5, 10], fov: 50 }}>
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 1, 20]} />
        <ambientLight intensity={0.5} />
        <MovingGrid />
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  )
}
