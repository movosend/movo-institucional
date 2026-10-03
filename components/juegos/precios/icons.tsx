import type { CSSProperties, ReactNode } from "react"

/** Íconos del prototipo "Movo Feria", con los mismos paths y tamaños. */
function Svg({
  size,
  strokeWidth = 2,
  stroke = "currentColor",
  style,
  children,
}: {
  size: number
  strokeWidth?: number
  stroke?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

type IconProps = {
  size?: number
  strokeWidth?: number
  stroke?: string
  style?: CSSProperties
}

export const ArrowRight = ({
  size = 30,
  strokeWidth = 2.25,
  stroke,
  style,
}: IconProps) => (
  <Svg size={size} strokeWidth={strokeWidth} stroke={stroke} style={style}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Svg>
)

export const ArrowLeft = () => (
  <Svg size={32} strokeWidth={2.25}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </Svg>
)

export const SoundOn = () => (
  <Svg size={26}>
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M19 5a10 10 0 0 1 0 14" />
  </Svg>
)

export const SoundOff = () => (
  <Svg size={26}>
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="m22 9-6 6" />
    <path d="m16 9 6 6" />
  </Svg>
)

export const Restart = () => (
  <Svg size={22}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
)

export const Search = ({ style }: { style?: CSSProperties }) => (
  <Svg size={28} stroke="#8A8A93" style={style}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
)

export const Pin = () => (
  <Svg size={30} stroke="#C6F24A">
    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
)

export const ThumbUp = () => (
  <Svg size={26} stroke="#0A0A0B">
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </Svg>
)

export const Meh = () => (
  <Svg size={26} stroke="#0A0A0B">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 15h8" />
    <path d="M9 9h.01" />
    <path d="M15 9h.01" />
  </Svg>
)

export const ThumbDown = () => (
  <Svg size={26} stroke="#0A0A0B">
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
  </Svg>
)

export const Check = () => (
  <Svg size={56} strokeWidth={2.5}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
)

// --- Juego del optimizador ("Movo Optimizador") ----------------------------------------

export const CheckSmall = () => (
  <Svg size={30} strokeWidth={2.25}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
)

export const Clock = ({ stroke }: { stroke: string }) => (
  <Svg
    size={26}
    strokeWidth={2.25}
    stroke={stroke}
    style={{ position: "relative" }}
  >
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" />
    <path d="M10 2h4" />
  </Svg>
)

export const Grip = () => (
  <Svg size={28} strokeWidth={2} stroke="#8A8A93">
    <circle cx="9" cy="6" r="1" />
    <circle cx="15" cy="6" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="18" r="1" />
  </Svg>
)
