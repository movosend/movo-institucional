/** Íconos del prototipo (trazos de lucide copiados del diseño). */
interface IconProps {
  size: number
  color: string
  width?: number
  style?: React.CSSProperties
}

const svg = (
  { size, color, width = 2, style }: IconProps,
  children: React.ReactNode
) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    {children}
  </svg>
)

export const Check = (p: IconProps) => svg(p, <path d="M20 6 9 17l-5-5" />)
export const Cross = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  )
export const Arrow = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  )
export const ArrowUp = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </>
  )
export const Clock = (p: IconProps) =>
  svg(
    p,
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  )
export const Search = (p: IconProps) =>
  svg(
    p,
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  )
export const WifiOff = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M12 20h.01" />
      <path d="M8.5 16.43a5 5 0 0 1 7 0" />
      <path d="M2 2l20 20" />
      <path d="M5 12.86a10 10 0 0 1 5.17-2.69" />
      <path d="M19 12.86a10 10 0 0 0-2.01-1.44" />
    </>
  )

export function Bolt({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke="none"
      aria-hidden="true"
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  )
}
