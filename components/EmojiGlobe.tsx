import React, { Suspense, useMemo, useEffect, useState } from "react"
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
  // On mobile, show a handpicked set of important emotions
  // On desktop, animate through all unique emojis in windows of 56
  const PAGE_SIZE = 56
  const ANIMATION_INTERVAL = 3000 // ms
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(EMOJIS.length / PAGE_SIZE)

  useEffect(() => {
    if (isMobile) return
    const interval = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages)
    }, ANIMATION_INTERVAL)
    return () => clearInterval(interval)
  }, [isMobile, totalPages])

  const emojiList = useMemo(() => {
    if (isMobile) return MOBILE_PRIORITY_EMOJIS
    const start = page * PAGE_SIZE
    const end = start + PAGE_SIZE
    return EMOJIS.slice(start, end).concat(
      EMOJIS.length < PAGE_SIZE ? Array(PAGE_SIZE - EMOJIS.length).fill("") : []
    )
  }, [isMobile, page])

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