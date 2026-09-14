"use client"

// Recorte de pantalla medido sobre public/iphone-frame.png (1666×3368):
// el hueco transparente del frame va de x 106–1567, y 83–3283 px.
const FRAME_W = 1666
const FRAME_H = 3368
const SCREEN = {
  left: (106 / FRAME_W) * 100,
  right: 100 - (1567 / FRAME_W) * 100,
  top: (83 / FRAME_H) * 100,
  bottom: 100 - (3283 / FRAME_H) * 100,
}

/**
 * Foto real de un iPhone (public/iphone-frame.png) usada como marco;
 * la captura de pantalla se ubica detrás, recortada al hueco transparente
 * del frame, así el resultado es un mockup fotorrealista.
 */
export function IPhoneMockup({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative"
      style={{ width: 280, aspectRatio: `${FRAME_W} / ${FRAME_H}` }}
    >
      {/* Sombra de contacto en el piso */}
      <div
        className="absolute bottom-[-4%] left-1/2 -translate-x-1/2"
        style={{
          height: "4%",
          width: "65%",
          background:
            "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 72%)",
          filter: "blur(2px)",
        }}
        aria-hidden
      />

      {/* Captura, recortada al hueco de pantalla del frame */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: `${SCREEN.left}%`,
          right: `${SCREEN.right}%`,
          top: `${SCREEN.top}%`,
          bottom: `${SCREEN.bottom}%`,
          borderRadius: "9%/4.5%",
          background: "#000",
        }}
      >
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover object-top select-none"
          draggable={false}
        />
      </div>

      {/* Frame real, por encima de la captura */}
      <img
        src="/iphone-frame.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        style={{
          filter:
            "drop-shadow(0 40px 80px rgba(0,0,0,0.6)) drop-shadow(0 8px 20px rgba(0,0,0,0.4))",
        }}
        draggable={false}
      />
    </div>
  )
}
