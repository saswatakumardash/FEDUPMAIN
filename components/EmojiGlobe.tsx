import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { useIsMobile } from "@/hooks/use-mobile"

// A diverse set of emotion emojis (expanded for all emotions, especially tired, crying, depressed, anxious, exhausted, etc.)
const EMOJIS = [
    "💔", "😂","😭","😒","☺️","😔","😊","😏","😉","😎","😴","😄","😀","😃","😜","😄","😁","😋","😌","👀","😑","😳","😩","❤️","😍","😘","😁","😌","😀","😃","😄","😁","😆","🥹","😅","😂","🤣","🥲","☺️","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","🙂‍↕️","😏","😒","🙂‍↔️","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😶‍🌫️","😱","😨","😰","😥","😓","🤗","🤔","🫣","🤭","🫢","🫡","🤫","🫠","🤥","😶","🫥","😐","🫤","😑","🫨","😬","🙄","😯","😦","😧","😮","😲","🥱","🫩","😴","🤤","😪","😮‍💨","😵","😵‍💫","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","💀","👾","❤️‍🩹","♥️","❤️‍🔥","🖤","💔","💗","🫶","💘","💜","💙","💚","💛","💝"
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
  const radius = 1.7
  const count = EMOJIS.length // show all emojis
  const positions = getSpherePositions(count, radius)
  return (
    <>
      {positions.map((pos, i) => (
        <Html
          key={i}
          position={pos as [number, number, number]}
          style={{
            fontSize: "2.2rem",
            filter: "drop-shadow(0 0 8px #7c3aedbb)",
            pointerEvents: "none",
            userSelect: "none",
            transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
          }}
          center
        >
          {EMOJIS[i]}
        </Html>
      ))}
    </>
  )
}

export default function EmojiGlobe() {
  const isMobile = useIsMobile()
  return (
    <div className="w-full h-[340px] md:h-[400px] xl:h-[520px] 2xl:h-[600px] max-w-[340px] md:max-w-[400px] xl:max-w-[520px] 2xl:max-w-[600px] aspect-square flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ borderRadius: "50%", background: "transparent", width: "100%", height: "100%" }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <Suspense fallback={null}>
          <group rotation={[0.3, 0.5, 0]}>
            <EmojiSphere />
          </group>
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.1} enablePan={isMobile} />
      </Canvas>
    </div>
  )
} 