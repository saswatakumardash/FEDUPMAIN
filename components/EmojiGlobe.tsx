import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"

// A diverse set of emotion emojis
const EMOJIS = [
  "😀", "😂", "😍", "🥰", "😎", "😭", "😡", "😱", "😴", "🤔", "😇", "😤", "😢", "😅", "😬", "🥳", "😜", "😳", "😏", "😌", "😞", "😃", "😆", "😋", "😐", "😕", "😲", "😤", "😡", "🥺", "🤩", "😈", "😇", "😔", "😝", "😪", "😷", "🤒", "🤕", "🤠", "🥶", "🥵", "🤯", "😵", "🤗", "😶", "😬", "😑", "😒", "😔", "😟", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖"
]

// Distribute emojis on a sphere using spherical coordinates
function getSpherePositions(count: number, radius: number) {
  const positions = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2 // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = goldenAngle * i
    const x = Math.cos(theta) * radiusAtY
    const z = Math.sin(theta) * radiusAtY
    positions.push([x * radius, y * radius, z * radius])
  }
  return positions
}

function EmojiSphere() {
  const radius = 1.5
  const count = 32
  const positions = getSpherePositions(count, radius)
  return (
    <>
      {positions.map((pos, i) => (
        <Html
          key={i}
          position={pos as [number, number, number]}
          style={{
            fontSize: "2.2rem",
            filter: "drop-shadow(0 0 12px #7c3aedcc)",
            pointerEvents: "none",
            userSelect: "none",
            transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
          }}
          center
        >
          {EMOJIS[i % EMOJIS.length]}
        </Html>
      ))}
    </>
  )
}

export default function EmojiGlobe() {
  return (
    <div className="w-full h-[340px] md:h-[400px] flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ borderRadius: "50%", background: "transparent" }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <Suspense fallback={null}>
          <group rotation={[0.3, 0.5, 0]}>
            <EmojiSphere />
          </group>
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.7} enablePan={false} />
      </Canvas>
    </div>
  )
} 