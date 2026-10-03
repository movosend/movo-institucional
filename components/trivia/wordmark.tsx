import { LogoMark } from "@/components/site/primitives"
import { css } from "@/lib/juegos/css"

/**
 * Isotipo + "movo" + etiqueta, alineados ópticamente en el centro de la altura de la x de
 * "movo" (es lo que el ojo toma como centro de una palabra en minúsculas).
 *
 * En vez de corrimientos calibrados a mano (cambian entre navegadores), todo va a la línea
 * de base del texto y cada pieza se ubica con `ex`, la altura de la x que el navegador mide
 * en la fuente que está usando de verdad:
 * - isotipo y separador: su borde de abajo cae en la línea de base; se los baja la mitad
 *   de su alto y se los sube media `ex`.
 * - etiqueta (mayúsculas): su centro está a media altura de mayúscula sobre la línea de base
 *   (0,727em en Inter, dato de la fuente); se la sube hasta media `ex` de "movo".
 */
export function Wordmark({
  size,
  mark,
  gap,
  label,
  labelSize,
  labelStyle = "",
  separator,
}: {
  /** Tamaño de "movo" (px). */
  size: number
  /** Tamaño del isotipo (px). */
  mark: number
  gap: number
  label?: string
  labelSize?: number
  labelStyle?: string
  /** Separador vertical entre "movo" y la etiqueta: alto (px) y estilo. */
  separator?: { height: number; style: string }
}) {
  const half = (h: number) => `calc(${h / 2}px - .5ex)`
  return (
    <span
      style={css(
        `display:flex;align-items:baseline;gap:${gap}px;font-size:${size}px;line-height:1`
      )}
    >
      <span
        className="mv-trivia-mark"
        style={{ ...css("display:block;position:relative"), top: half(mark) }}
      >
        <LogoMark size={mark} solid />
      </span>
      <span style={css("font-weight:600;letter-spacing:-.045em")}>movo</span>
      {separator && (
        <span
          style={{
            ...css(`display:block;position:relative;${separator.style}`),
            height: separator.height,
            top: half(separator.height),
          }}
        />
      )}
      {label && labelSize && (
        <span
          style={{
            ...css(
              `position:relative;font-size:${labelSize}px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;${labelStyle}`
            ),
            // `ex` acá es la de la etiqueta: la de "movo" es size/labelSize veces mayor.
            top: `calc(.3635em - ${((0.5 * size) / labelSize).toFixed(4)}ex)`,
          }}
        >
          {label}
        </span>
      )}
    </span>
  )
}
