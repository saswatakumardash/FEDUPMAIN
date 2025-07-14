import React, { Suspense, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { useIsMobile } from "@/hooks/use-mobile"

// A diverse set of emotion emojis (expanded for all emotions, especially tired, crying, depressed, anxious, exhausted, etc.)
const RAW_EMOJIS = [
  "��", "😂","😭","😒","☺️","😔","😊","😏","😉","😎","😴","😄","😀","😃","😜","😄","😁","😋","😌","👀","😑","😳","😩","❤️","😍","😘","😁","😌","😀","😃","😄","😁","😆","🥹","😅","😂","🤣","🥲","☺️","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","🙂‍↕️","😏","😒","🙂‍↔️","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😶‍🌫️","😱","😨","😰","😥","😓","🤗","🤔","🫣","🤭","🫢","🫡","🤫","🫠","🤥","😶","🫥","😐","🫤","😑","🫨","😬","🙄","😯","😦","😧","😮","😲","🥱","🫩","😴","🤤","😪","😮‍💨","😵","😵‍💫","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","💀","👾","❤️‍🩹","♥️","❤️‍🔥","🖤","💔","💗","🫶","💘","💜","💙","💚","💛","💝"
]

function uniqueEmojis(arr: string[]): string[] {
  return Array.from(new Set(arr))
}

const EMOJIS = uniqueEmojis(RAW_EMOJIS)

const MOBILE_PRIORITY_EMOJIS = [
  // Heartbreak, sadness, depression, tired
  "💔", "😭", "😢", "😞", "😔", "😩", "😫", "😒", "😴", "😪", "😮‍💨", "😷", "😵", "😶‍🌫️", "😑", "😐", "😬", "😟", "😕", "🙁", "☹️",
  // Happy, love, comfort, support
  "😂", "😄", "😀", "😃", "😊", "☺️", "😍", "🥰", "😘", "❤️", "💗", "💜", "💙", "💚", "💛", "🤗", "🤔", "🫶"
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

interface EmojiSphereProps {
  emojiList: string[]
}

function EmojiSphere({ emojiList }: EmojiSphereProps) {
  const radius = 1.7
  const count = emojiList.length
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
          {emojiList[i]}
        </Html>
      ))}
    </>
  )
}

export default function EmojiGlobe() {
  const isMobile = useIsMobile()
  // On mobile, show a handpicked set of 36 important emotions; on desktop, show first 64 unique
  const emojiList = useMemo(() => isMobile ? MOBILE_PRIORITY_EMOJIS : EMOJIS.slice(0, 64), [isMobile])
  // For even more performance, consider a Canvas-based emoji renderer in the future
  return (
    <div className="w-full h-[340px] md:h-[400px] xl:h-[520px] 2xl:h-[600px] max-w-[340px] md:max-w-[400px] xl:max-w-[520px] 2xl:max-w-[600px] aspect-square flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ borderRadius: "50%", background: "transparent", width: "100%", height: "100%" }} performance={{ min: 0.7 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <Suspense fallback={null}>
          <group rotation={[0.3, 0.5, 0]}>
            <EmojiSphere emojiList={emojiList} />
          </group>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={true} autoRotate autoRotateSpeed={1.1} dampingFactor={0.22} />
      </Canvas>
    </div>
  )
} 